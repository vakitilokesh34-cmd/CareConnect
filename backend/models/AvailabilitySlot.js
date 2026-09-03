const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

availabilitySlotSchema.index({ provider: 1, startTime: 1, endTime: 1 });

availabilitySlotSchema.pre('validate', function (next) {
  if (this.endTime && this.startTime && this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

const hasOverlap = (start, end, existing) =>
  existing.some((slot) => start < slot.endTime && end > slot.startTime);

availabilitySlotSchema.statics.findOverlapping = async function (providerId, start, end) {
  const existing = await this.find({
    provider: providerId,
    isAvailable: true,
    startTime: { $lt: end },
    endTime: { $gt: start },
  });
  return existing;
};

module.exports = mongoose.model('AvailabilitySlot', availabilitySlotSchema);
module.exports.hasOverlap = hasOverlap;