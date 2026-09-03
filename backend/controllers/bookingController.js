const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const JobUpdate = require('../models/JobUpdate');
const Invoice = require('../models/Invoice');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoiceNumber } = require('../utils/helpers');
const { assertProviderAvailable } = require('../services/availabilityService');
const {
  notifyProviderOfBooking,
  notifyCustomerOfBooking,
  notifyBookingStatusChange,
  notifyQuoteDecision,
} = require('../services/notificationService');

const BOOKING_POPULATE = [
  { path: 'customer', select: 'name email phone profileImage addresses' },
  { path: 'provider', populate: { path: 'user', select: 'name phone profileImage' } },
  { path: 'serviceRequest', select: 'title description categoryName preferredDate preferredTime requiredSkills' },
  { path: 'quote', select: 'estimatedPrice estimatedDuration description' },
];

const FORBIDDEN_BOOKING_STATUSES = ['CANCELLED', 'COMPLETED', 'CUSTOMER_CONFIRMED', 'DISPUTED'];

const createBooking = asyncHandler(async (req, res) => {
  const { serviceRequest, quote, provider, scheduledStartTime, scheduledEndTime } = req.body;

  const q = await Quote.findById(quote);
  if (!q) throw ApiError.notFound('Quote');
  if (q.status === 'ACCEPTED') throw ApiError.badRequest('A booking already exists for this quote');
  if (q.status === 'REJECTED') throw ApiError.badRequest('This quote was rejected');

  if (q.provider.toString() !== provider) throw ApiError.badRequest('Quote does not belong to this provider');

  const request = await ServiceRequest.findById(serviceRequest);
  if (!request) throw ApiError.notFound('Service request');
  if (request.customer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only book on your own service requests');
  }
  if (request.status === 'BOOKED') throw ApiError.badRequest('This request already has a booking');

  // Availability engine: reject overlapping bookings / conflicting slots
  await assertProviderAvailable(provider, scheduledStartTime, scheduledEndTime);

  const [profile] = await ProviderProfile.find({ _id: provider }).populate('user', 'name');

  const booking = await Booking.create({
    customer: req.user._id,
    provider,
    serviceRequest,
    quote: q._id,
    scheduledStartTime,
    scheduledEndTime,
    address: request.address,
    status: 'CONFIRMED',
    totalPrice: q.estimatedPrice,
  });

  q.status = 'ACCEPTED';
  await q.save();

  request.status = 'BOOKED';
  await request.save();

  await JobUpdate.create({
    booking: booking._id,
    provider,
    status: 'ASSIGNED',
    note: 'Booking created. Awaiting provider acceptance.',
  });

  await notifyProviderOfBooking(profile.user._id, booking._id);
  await notifyCustomerOfBooking(req.user._id, booking._id);
  await notifyQuoteDecision(profile.user._id, q, true);

  const populated = await Booking.findById(booking._id).populate(BOOKING_POPULATE);
  res.status(201).json(ApiResponse.created('Booking created successfully', { booking: populated }));
});

const listBookings = asyncHandler(async (req, res) => {
  const { status, provider, customer, from, to, page = 1, limit = 10 } = req.query;
  const filter = {};

  const isStaff = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role);
  if (req.user.role === 'CUSTOMER') filter.customer = req.user._id;
  else if (req.user.role === 'SERVICE_PROVIDER') {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) throw ApiError.notFound('Provider profile');
    filter.provider = profile._id;
  }

  if (status) filter.status = status;
  if (provider) filter.provider = provider;
  if (customer && isStaff) filter.customer = customer;
  if (from || to) {
    filter.scheduledStartTime = {};
    if (from) filter.scheduledStartTime.$gte = new Date(from);
    if (to) filter.scheduledStartTime.$lte = new Date(to);
  }

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate(BOOKING_POPULATE)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ApiResponse.ok('Bookings retrieved', {
    bookings,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate(BOOKING_POPULATE);
  if (!booking) throw ApiError.notFound('Booking');

  const isPermitted =
    (req.user.role === 'CUSTOMER' && booking.customer._id.toString() === req.user._id.toString()) ||
    req.user.role === 'PLATFORM_ADMIN' ||
    req.user.role === 'OPERATIONS_MANAGER' ||
    req.user.role === 'SUPPORT_AGENT' ||
    (req.user.role === 'SERVICE_PROVIDER' &&
      (await ProviderProfile.exists({ _id: booking.provider._id, user: req.user._id })));

  if (!isPermitted) throw ApiError.forbidden('You are not authorized to view this booking');

  const updates = await JobUpdate.find({ booking: booking._id }).sort({ createdAt: 1 });
  const invoice = await Invoice.findOne({ booking: booking._id });
  const dispute = await require('../models/Dispute').findOne({ booking: booking._id });

  res.json(ApiResponse.ok('Booking retrieved', { booking, updates, invoice, dispute }));
});

const analyzeStatusTransition = (current, next, role, body) => {
  const fail = () => {
    throw ApiError.badRequest(`Status transition from "${current}" to "${next}" is not allowed`);
  };
  if (current === next) return true;

  switch (role) {
    case 'SERVICE_PROVIDER': {
      const map = {
        CONFIRMED: ['ACCEPTED', 'CANCELLED'],
        PROVIDER_ASSIGNED: ['ACCEPTED', 'CANCELLED'],
        ACCEPTED: ['ON_THE_WAY', 'IN_PROGRESS', 'CANCELLED'],
        ON_THE_WAY: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['COMPLETED', 'DISPUTED'],
        COMPLETED: ['IN_PROGRESS'],
      };
      if (!(map[current] || []).includes(next)) fail();
      break;
    }
    case 'CUSTOMER': {
      if (next !== 'CANCELLED') fail();
      if (['CANCELLED', 'COMPLETED', 'CUSTOMER_CONFIRMED'].includes(current)) fail();
      break;
    }
    case 'OPERATIONS_MANAGER':
    case 'PLATFORM_ADMIN': {
      if (!['ACCEPTED', 'CANCELLED', 'DISPUTED', 'PROVIDER_ASSIGNED', 'COMPLETED'].includes(next)) fail();
      break;
    }
    default:
      fail();
  }
  return true;
};

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const booking = await Booking.findById(req.params.id).populate('provider', 'user');
  if (!booking) throw ApiError.notFound('Booking');

  if (FORBIDDEN_BOOKING_STATUSES.includes(booking.status)) {
    throw ApiError.badRequest(`Booking is already ${booking.status.toLowerCase()} and cannot be changed`);
  }

  const isProvider =
    req.user.role === 'SERVICE_PROVIDER' &&
    booking.provider &&
    booking.provider.user &&
    booking.provider.user._id.toString() === req.user._id.toString();

  let effectiveRole = req.user.role;
  if (req.user.role === 'SERVICE_PROVIDER' && !isProvider) {
    throw ApiError.forbidden('You are not the assigned provider for this booking');
  }

  analyzeStatusTransition(booking.status, status, effectiveRole, req.body);

  const prev = booking.status;
  booking.status = status;
  if (status === 'CANCELLED') booking.cancellationReason = note || bodyCancellationReason(req, note);
  await booking.save();

  const jobUpdate = await JobUpdate.create({
    booking: booking._id,
    provider: booking.provider._id,
    status: status === 'CANCELLED' ? 'CANCELLED' : status,
    note: note || `Booking status changed from ${prev} to ${status}`,
    beforeImages: req.body.beforeImages || [],
    afterImages: req.body.afterImages || [],
    attachments: req.body.attachments || [],
  });

  if (status === 'CANCELLED') {
    await Quote.updateMany({ _id: booking.quote }, { status: 'REJECTED' });
    await ServiceRequest.updateOne({ _id: booking.serviceRequest }, { status: 'OPEN' });
  }

  await notifyBookingStatusChange(booking, `Booking ${booking.status.toLowerCase()}`, note || `Your booking status is now "${status}".`);

  res.json(ApiResponse.ok('Booking status updated', { booking, jobUpdate }));
});

function bodyCancellationReason(req, note) {
  return (req.body && req.body.cancellationReason) || note || 'Cancelled';
}

const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking');

  const isCustomer = booking.customer.toString() === req.user._id.toString();
  const isProvider =
    req.user.role === 'SERVICE_PROVIDER' &&
    (await ProviderProfile.exists({ _id: booking.provider, user: req.user._id }));

  if (!isCustomer && !isProvider && !['PLATFORM_ADMIN', 'SUPPORT_AGENT', 'OPERATIONS_MANAGER'].includes(req.user.role)) {
    throw ApiError.forbidden('You are not authorized to cancel this booking');
  }

  if (['CANCELLED', 'COMPLETED', 'CUSTOMER_CONFIRMED'].includes(booking.status)) {
    throw ApiError.badRequest('This booking cannot be cancelled in its current state');
  }

  if (isCustomer && ['IN_PROGRESS', 'COMPLETED', 'DISPUTED'].includes(booking.status)) {
    throw ApiError.badRequest('This job is already in progress. Raise a dispute instead.');
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = reason || 'Cancelled by user';
  await booking.save();

  await Quote.updateMany({ _id: booking.quote }, { status: 'REJECTED' });
  await ServiceRequest.updateOne({ _id: booking.serviceRequest }, { status: 'OPEN' });

  await JobUpdate.create({
    booking: booking._id,
    provider: booking.provider,
    status: 'CANCELLED',
    note: booking.cancellationReason,
  });

  await notifyBookingStatusChange(booking, 'Booking cancelled', booking.cancellationReason);

  res.json(ApiResponse.ok('Booking cancelled', { booking }));
});

const confirmCompletion = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('provider', 'user _id');
  if (!booking) throw ApiError.notFound('Booking');

  if (booking.customer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the customer can confirm completion');
  }
  if (booking.status !== 'COMPLETED') {
    throw ApiError.badRequest('The provider must mark the job as completed before you can confirm');
  }

  const provided = req.user._id;
  const confirmJob = async () => {
    booking.status = 'CUSTOMER_CONFIRMED';
    await booking.save();

    await ServiceRequest.updateOne({ _id: booking.serviceRequest }, { status: 'COMPLETED' });
    await ProviderProfile.updateOne(
      { _id: booking.provider },
      { $inc: { completedJobs: 1 } }
    );

    const taxRate = 0.1;
    const subtotal = booking.totalPrice;
    const taxes = Math.round(subtotal * taxRate * 100) / 100;

    let invoice = await Invoice.findOne({ booking: booking._id });
    if (!invoice) {
      invoice = await Invoice.create({
        booking: booking._id,
        invoiceNumber: generateInvoiceNumber(),
        provider: booking.provider,
        customer: booking.customer,
        services: [
          { description: 'Home service job', quantity: 1, unitPrice: subtotal },
        ],
        subtotal,
        taxes,
        totalAmount: subtotal + taxes,
        paymentStatus: 'PAID',
      });
    } else {
      invoice.paymentStatus = 'PAID';
      await invoice.save();
    }

    await JobUpdate.create({
      booking: booking._id,
      provider: booking.provider,
      status: 'CUSTOMER_CONFIRMED',
      note: 'Customer confirmed service completion.',
    });

    await notifyBookingStatusChange(booking, 'Job completed & confirmed', 'Your job has been confirmed. You can now review your provider.');
    return invoice;
  };

  const invoice = await confirmJob();

  res.json(ApiResponse.ok('Service completion confirmed', {
    booking,
    invoice,
    message: 'Invoice finalized. Thank you for using CareConnect!',
  }));
});

const assignProvider = asyncHandler(async (req, res) => {
  const { providerId } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking');
  if (booking.status === 'CANCELLED' || booking.status === 'DISPUTED') {
    throw ApiError.badRequest('This booking cannot be reassigned');
  }

  const profile = await ProviderProfile.findById(providerId).populate('user', 'name');
  if (!profile) throw ApiError.notFound('Provider');

  // Re-check availability for manual assignment
  await assertProviderAvailable(providerId, booking.scheduledStartTime, booking.scheduledEndTime, booking._id);

  booking.provider = providerId;
  booking.status = 'PROVIDER_ASSIGNED';
  await booking.save();

  await notifyProviderOfBooking(profile.user._id, booking._id);

  res.json(ApiResponse.ok('Provider assigned to booking', { booking, assignedTo: profile.businessName }));
});

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  confirmCompletion,
  assignProvider,
};