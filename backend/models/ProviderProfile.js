const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    baseRate: { type: Number, min: [0, 'Base rate cannot be negative'], default: 0 },
    unit: { type: String, enum: ['PER_JOB', 'PER_HOUR', 'PER_SQFT'], default: 'PER_JOB' },
    minimumCharge: { type: Number, min: [0, 'Minimum charge cannot be negative'], default: 0 },
    travelFee: { type: Number, min: [0, 'Travel fee cannot be negative'], default: 0 },
    currency: { type: String, default: 'INR' },
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    description: { type: String, default: '' },
    experience: { type: Number, default: 0 }, // years
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && new Set(v.map((s) => s.toLowerCase())).size === v.length,
        message: 'Skills must be a list of unique strings',
      },
    },
    serviceCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
      },
    ],
    serviceAreas: {
      type: [
        {
          city: { type: String, required: true },
          pincode: { type: String },
        },
      ],
      default: [],
    },
    pricing: { type: pricingSchema, default: () => ({}) },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    verificationDocuments: {
      type: [
        {
          title: { type: String, default: 'Document' },
          url: { type: String },
          status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
          },
        },
      ],
      default: [],
    },
    rejectionReason: { type: String, default: '' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

providerProfileSchema.index({ serviceCategories: 1 });
providerProfileSchema.index({ 'serviceAreas.city': 1 });
providerProfileSchema.index({ verificationStatus: 1 });
providerProfileSchema.index({ averageRating: -1 });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);