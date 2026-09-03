const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      index: true,
    },
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
      index: true,
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
      index: true,
    },
    scheduledStartTime: {
      type: Date,
      required: [true, 'Scheduled start time is required'],
    },
    scheduledEndTime: {
      type: Date,
      required: [true, 'Scheduled end time is required'],
    },
    address: {
      line1: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, default: 'IN' },
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PROVIDER_ASSIGNED',
        'ACCEPTED',
        'ON_THE_WAY',
        'IN_PROGRESS',
        'COMPLETED',
        'CUSTOMER_CONFIRMED',
        'CANCELLED',
        'DISPUTED',
      ],
      default: 'PENDING',
    },
    cancellationReason: { type: String, default: '' },
    totalPrice: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

bookingSchema.index({ provider: 1, scheduledStartTime: 1, scheduledEndTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ customer: 1, createdAt: -1 });

bookingSchema.pre('validate', function (next) {
  if (this.scheduledEndTime && this.scheduledStartTime && this.scheduledEndTime <= this.scheduledStartTime) {
    return next(new Error('Scheduled end time must be after start time'));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);