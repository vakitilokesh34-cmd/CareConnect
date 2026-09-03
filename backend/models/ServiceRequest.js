const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    gateway: { type: String, default: 'gemini' },
    model: { type: String, default: '' },
    raw: { type: Object, default: null },
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please describe your problem'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: {
      type: [{ type: String }],
      default: [],
    },
    address: {
      label: { type: String, trim: true, default: 'Service address' },
      line1: { type: String, required: [true, 'Service address is required'], trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, default: 'IN' },
    },
    preferredDate: { type: Date },
    preferredTime: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      index: true,
    },
    categoryName: { type: String, trim: true },
    requiredSkills: { type: [String], default: [] },
    AIClassification: {
      category: { type: String, default: '' },
      requiredSkills: { type: [String], default: [] },
      urgency: { type: String, default: 'Medium' },
      keywords: { type: [String], default: [] },
      summary: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
      gateway: { type: String, default: 'heuristic' },
    },
    aiMatchedProviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProviderProfile',
      },
    ],
    status: {
      type: String,
      enum: ['OPEN', 'PROVIDERS_MATCHED', 'QUOTES_RECEIVED', 'BOOKED', 'CANCELLED', 'COMPLETED'],
      default: 'OPEN',
    },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ status: 1, createdAt: -1 });
serviceRequestSchema.index({ customer: 1, createdAt: -1 });
serviceRequestSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);