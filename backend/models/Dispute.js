const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    description: { type: String, default: '', trim: true },
    evidence: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    assignedSupportAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolution: {
      action: { type: String, default: '' },
      notes: { type: String, default: '' },
      refundAmount: { type: Number, default: 0, min: 0 },
      decidedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

disputeSchema.index({ booking: 1, status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);