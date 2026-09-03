const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoiceNumber, round2 } = require('../utils/helpers');
const { notifyBookingStatusChange } = require('../services/notificationService');

const INVOICE_POPULATE = [
  { path: 'booking', select: 'status scheduledStartTime scheduledEndTime address' },
  { path: 'provider', populate: { path: 'user', select: 'name businessName' } },
  { path: 'customer', select: 'name email phone' },
];

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate(INVOICE_POPULATE);
  if (!invoice) throw ApiError.notFound('Invoice');

  const isCustomer = invoice.customer._id.toString() === req.user._id.toString();
  const isStaff = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role);

  let isProvider = false;
  if (req.user.role === 'SERVICE_PROVIDER') {
    isProvider = await ProviderProfile.exists({ _id: invoice.provider, user: req.user._id });
  }

  if (!isCustomer && !isStaff && !isProvider) throw ApiError.forbidden('Not authorized to view this invoice');
  res.json(ApiResponse.ok('Invoice retrieved', { invoice }));
});

const getInvoiceByBooking = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ booking: req.params.bookingId }).populate(INVOICE_POPULATE);
  if (!invoice) throw ApiError.notFound('Invoice for this booking');
  res.json(ApiResponse.ok('Invoice retrieved', { invoice }));
});

const createInvoice = asyncHandler(async (req, res) => {
  const { booking: bookingId, services, taxRate = 0.1, markPaid = false } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking');

  const isProvider =
    req.user.role === 'SERVICE_PROVIDER' &&
    (await ProviderProfile.exists({ _id: booking.provider, user: req.user._id }));
  if (!isProvider && !['PLATFORM_ADMIN', 'OPERATIONS_MANAGER'].includes(req.user.role)) {
    throw ApiError.forbidden('Only the provider or admin can create an invoice');
  }

  const exists = await Invoice.findOne({ booking: bookingId });
  if (exists) throw ApiError.conflict('An invoice already exists for this booking');

  const lines = (services || [{ description: 'Home service job', quantity: 1, unitPrice: booking.totalPrice }]).map(
    (l) => ({ description: l.description, quantity: l.quantity || 1, unitPrice: l.unitPrice || 0 })
  );
  const subtotal = round2(lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0));
  const taxes = round2(subtotal * taxRate);

  const invoice = await Invoice.create({
    booking: bookingId,
    invoiceNumber: generateInvoiceNumber(),
    provider: booking.provider,
    customer: booking.customer,
    services: lines,
    subtotal,
    taxes,
    totalAmount: round2(subtotal + taxes),
    paymentStatus: markPaid ? 'PAID' : 'PENDING',
  });

  if (markPaid) {
    await notifyBookingStatusChange(booking, 'Invoice paid', 'Your invoice has been marked as paid.');
  }

  res.status(201).json(ApiResponse.created('Invoice created', { invoice }));
});

module.exports = { getInvoice, getInvoiceByBooking, createInvoice };