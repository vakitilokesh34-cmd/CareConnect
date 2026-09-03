const mongoose = require('mongoose');

const jobUpdateSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'ASSIGNED',
        'ACCEPTED',
        'ON_THE_WAY',
        'IN_PROGRESS',
        'COMPLETED',
        'CUSTOMER_CONFIRMED',
        'CANCELLED',
        'DISPUTED',
      ],
      required: true,
    },
    note: { type: String, default: '' },
    attachments: { type: [String], default: [] },
    beforeImages: { type: [String], default: [] },
    afterImages: { type: [String], default: [] },
  },
  { timestamps: true }
);

jobUpdateSchema.index({ booking: 1, createdAt: 1 });

module.exports = mongoose.model('JobUpdate', jobUpdateSchema);