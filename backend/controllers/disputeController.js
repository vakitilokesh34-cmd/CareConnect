const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { notifyDisputeUpdate } = require('../services/notificationService');

const DISPUTE_POPULATE = [
  { path: 'booking', select: 'status scheduledStartTime provider customer totalPrice serviceRequest', populate: [{ path: 'provider', select: 'businessName user' }, { path: 'customer', select: 'name' }, { path: 'serviceRequest', select: 'title' }] },
  { path: 'raisedBy', select: 'name email role' },
  { path: 'assignedSupportAgent', select: 'name email' },
];

const createDispute = asyncHandler(async (req, res) => {
  const { booking, reason, description, evidence } = req.body;

  const bookingDoc = await Booking.findById(booking);
  if (!bookingDoc) throw ApiError.notFound('Booking');

  const isCustomer = bookingDoc.customer.toString() === req.user._id.toString();
  const isProvider =
    req.user.role === 'SERVICE_PROVIDER' &&
    (await require('../models/ProviderProfile').exists({ _id: bookingDoc.provider, user: req.user._id }));
  if (!isCustomer && !isProvider) {
    throw ApiError.forbidden('Only the parties in this booking can raise a dispute');
  }

  const isStaff = ['PLATFORM_ADMIN', 'SUPPORT_AGENT'].includes(req.user.role);
  if (bookingDoc.status === 'CANCELLED' && !isStaff) return;

  const existing = await Dispute.findOne({ booking: bookingDoc._id, status: { $ne: 'CLOSED' } });
  if (existing) throw ApiError.conflict('A dispute is already open for this booking');

  const dispute = await Dispute.create({
    booking: bookingDoc._id,
    raisedBy: req.user._id,
    reason,
    description: description || '',
    evidence: evidence || [],
  });

  if (bookingDoc.status !== 'DISPUTED' && bookingDoc.status !== 'CANCELLED') {
    bookingDoc.status = 'DISPUTED';
    await bookingDoc.save();
  }

  const populated = await Dispute.findById(dispute._id).populate(DISPUTE_POPULATE);
  res.status(201).json(ApiResponse.created('Dispute raised', { dispute: populated }));
});

const listDisputes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (req.user.role === 'CUSTOMER') filter.raisedBy = req.user._id;
  else if (req.user.role === 'SERVICE_PROVIDER') {
    const profile = await require('../models/ProviderProfile').findOne({ user: req.user._id });
    if (!profile) throw ApiError.notFound('Provider profile');
    const bookingIds = await require('../models/Booking').find({ provider: profile._id }).distinct('_id');
    filter.booking = { $in: bookingIds };
  } else if (req.user.role === 'SUPPORT_AGENT') {
    filter.$or = [{ assignedSupportAgent: req.user._id }, { assignedSupportAgent: null }];
  }

  if (status) filter.status = status;

  const total = await Dispute.countDocuments(filter);
  const disputes = await Dispute.find(filter)
    .populate(DISPUTE_POPULATE)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ApiResponse.ok('Disputes retrieved', {
    disputes,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

const getDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id).populate(DISPUTE_POPULATE);
  if (!dispute) throw ApiError.notFound('Dispute');
  const isStaff = ['PLATFORM_ADMIN', 'SUPPORT_AGENT', 'OPERATIONS_MANAGER'].includes(req.user.role);
  const isRaisedBy = dispute.raisedBy._id.toString() === req.user._id.toString();
  if (!isStaff && !isRaisedBy) throw ApiError.forbidden('Not authorized to view this dispute');
  res.json(ApiResponse.ok('Dispute retrieved', { dispute }));
});

const updateDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw ApiError.notFound('Dispute');

  if (req.user.role === 'SUPPORT_AGENT' || req.user.role === 'PLATFORM_ADMIN') {
    if (!dispute.assignedSupportAgent && req.user.role === 'SUPPORT_AGENT') {
      dispute.assignedSupportAgent = req.user._id;
    }
    if (req.body.status) {
      if (!['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].includes(req.body.status)) {
        throw ApiError.badRequest('Invalid dispute status');
      }
      dispute.status = req.body.status;
    }
    if (req.body.assignedSupportAgent !== undefined) {
      dispute.assignedSupportAgent = req.body.assignedSupportAgent;
    }
    if (req.body.resolution !== undefined) {
      dispute.resolution = { ...dispute.resolution, ...req.body.resolution };
    }
    await dispute.save();
    await notifyDisputeUpdate(
      dispute.raisedBy,
      dispute._id,
      'Dispute updated',
      `Your dispute status is now "${dispute.status}".`
    );
  } else {
    throw ApiError.forbidden('Only support agents can update disputes');
  }

  const populated = await Dispute.findById(dispute._id).populate(DISPUTE_POPULATE);
  res.json(ApiResponse.ok('Dispute updated', { dispute: populated }));
});

const resolveDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw ApiError.notFound('Dispute');

  if (!['SUPPORT_AGENT', 'PLATFORM_ADMIN'].includes(req.user.role)) {
    throw ApiError.forbidden('Only support agents or admins can resolve disputes');
  }

  const { action, notes, refundAmount = 0 } = req.body;

  dispute.status = 'RESOLVED';
  dispute.assignedSupportAgent = dispute.assignedSupportAgent || req.user._id;
  dispute.resolution = {
    action,
    notes: notes || '',
    refundAmount,
    decidedAt: new Date(),
  };
  await dispute.save();

  // Apply resolution to booking + invoice
  const booking = await Booking.findById(dispute.booking);
  if (booking) {
    booking.status = 'CUSTOMER_CONFIRMED';
    await booking.save();
    const Invoice = require('../models/Invoice');
    const invoice = await Invoice.findOne({ booking: booking._id });
    if (invoice) {
      if (refundAmount > 0) {
        invoice.paymentStatus = 'REFUNDED';
        invoice.taxes = 0;
        invoice.totalAmount = Math.max(0, invoice.totalAmount - refundAmount);
        await invoice.save();
      }
    }
  }

  await notifyDisputeUpdate(
    dispute.raisedBy,
    dispute._id,
    'Dispute resolved',
    `Resolution: ${action}. ${notes ? notes : ''}`
  );

  const populated = await Dispute.findById(dispute._id).populate(DISPUTE_POPULATE);
  res.json(ApiResponse.ok('Dispute resolved', { dispute: populated }));
});

module.exports = { createDispute, listDisputes, getDispute, updateDispute, resolveDispute };