const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      index: true,
    },
    estimatedPrice: {
      type: Number,
      required: [true, 'Estimated price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: { type: String, default: '' },
    estimatedDuration: {
      type: String,
      default: '2 hours',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

quoteSchema.index({ serviceRequest: 1, provider: 1 }, { unique: true });
quoteSchema.index({ provider: 1, createdAt: -1 });

module.exports = mongoose.model('Quote', quoteSchema);