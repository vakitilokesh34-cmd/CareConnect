const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, default: '', trim: true },
    type: {
      type: String,
      enum: ['BOOKING', 'QUOTE', 'DISPUTE', 'PAYMENT', 'ADMIN', 'REQUEST', 'SYSTEM', 'JOB'],
      default: 'SYSTEM',
    },
    isRead: { type: Boolean, default: false },
    relatedResource: {
      model: { type: String, default: '' },
      id: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);