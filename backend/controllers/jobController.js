const Booking = require('../models/Booking');
const JobUpdate = require('../models/JobUpdate');
const ProviderProfile = require('../models/ProviderProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { staticUrl } = require('../middleware/upload');
const { notifyBookingStatusChange } = require('../services/notificationService');

const assertProviderForBooking = async (req, booking) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile || profile._id.toString() !== booking.provider.toString()) {
    throw ApiError.forbidden('You are not the assigned provider for this booking');
  }
  return profile;
};

const addJobUpdate = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw ApiError.notFound('Booking');

  const where = req.body.where || 'provider';
  let profile;
  if (req.user.role === 'SERVICE_PROVIDER') {
    profile = await assertProviderForBooking(req, booking);
  } else if (!['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role)) {
    throw ApiError.forbidden('Not authorized to update this job');
  }

  const { status, note } = req.body;
  const allowedStatusFlow = ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CUSTOMER_CONFIRMED'];
  if (status && !allowedStatusFlow.includes(status)) {
    throw ApiError.badRequest('Invalid job status');
  }

  // Update booking status to match the job progress when relevant
  if (status && status !== 'ASSIGNED' && status !== 'CUSTOMER_CONFIRMED') {
    if (booking.status === 'TO_BE_ACCEPTED' || booking.status === 'PENDING') {
      booking.status = 'CONFIRMED';
    }
    const bookingNext = status === 'COMPLETED' ? 'COMPLETED' : status;
    booking.status = booking.status === 'CUSTOMER_CONFIRMED' ? booking.status : bookingNext;
    await booking.save();
  }

  const files = req.files || [];
  const inProgressImages = files.map((f) => staticUrl(f.filename));

  const update = await JobUpdate.create({
    booking: booking._id,
    provider: profile ? profile._id : booking.provider,
    status: status || booking.status,
    note: note || '',
    attachments: inProgressImages,
    beforeImages: req.body.beforeImages || [],
    afterImages: req.body.afterImages || [],
  });

  await notifyBookingStatusChange(
    booking,
    `Job status: ${update.status}`,
    note || `Job progress moved to "${update.status}".`
  );

  res.status(201).json(ApiResponse.created('Job update added', { update, booking }));
});

const listJobUpdates = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw ApiError.notFound('Booking');

  const isCustomer = booking.customer.toString() === req.user._id.toString();
  const isStaff = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role);
  const isProvider =
    req.user.role === 'SERVICE_PROVIDER' &&
    (await ProviderProfile.exists({ _id: booking.provider, user: req.user._id }));

  if (!isCustomer && !isStaff && !isProvider) {
    throw ApiError.forbidden('Not authorized to view job updates');
  }

  const updates = await JobUpdate.find({ booking: booking._id })
    .populate('provider', 'businessName user')
    .sort({ createdAt: 1 });

  res.json(ApiResponse.ok('Job updates retrieved', { updates }));
});

module.exports = { addJobUpdate, listJobUpdates };