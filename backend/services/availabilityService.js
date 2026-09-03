const Booking = require('../models/Booking');
const AvailabilitySlot = require('../models/AvailabilitySlot');

const ACTIVE_SCHEDULE_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROVIDER_ASSIGNED',
  'ACCEPTED',
  'ON_THE_WAY',
  'IN_PROGRESS',
];

const hasOverlap = (start, end, list) =>
  list.some((item) => new Date(start) < new Date(item.endTime) && new Date(end) > new Date(item.startTime));

const findConflictingBookings = async (providerId, start, end, excludeBookingId = null) => {
  const filter = {
    provider: providerId,
    status: { $in: ACTIVE_SCHEDULE_STATUSES },
    scheduledStartTime: { $lt: end },
    scheduledEndTime: { $gt: start },
  };
  if (excludeBookingId) filter._id = { $ne: excludeBookingId };
  return Booking.find(filter).lean();
};

const hasOverlappingAvailability = async (providerId, start, end) => {
  const conflicting = await AvailabilitySlot.findOverlapping(providerId, start, end);
  return conflicting.length > 0;
};

const assertProviderAvailable = async (providerId, start, end, excludeBookingId = null) => {
  const [conflictingBookings, hasSlot] = await Promise.all([
    findConflictingBookings(providerId, start, end, excludeBookingId),
    hasOverlappingAvailability(providerId, start, end),
  ]);

  if (conflictingBookings.length > 0 || hasSlot) {
    const err = new Error('Provider is not available during the selected time.');
    err.code = 'AVAILABILITY_CONFLICT';
    err.overlappingBookings = conflictingBookings;
    err.overlappingSlots = hasSlot;
    throw err;
  }
  return true;
};

module.exports = { assertProviderAvailable, findConflictingBookings, hasOverlappingAvailability, hasOverlap };