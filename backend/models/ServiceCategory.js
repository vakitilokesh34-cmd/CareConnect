const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: { type: String, default: '' },
    icon: { type: String, default: '🔧' },
    requiredSkills: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && new Set(v.map((s) => s.toLowerCase())).size === v.length,
        message: 'Required skills must be a list of unique strings',
      },
    },
    basePrice: { type: Number, min: [0, 'Base price cannot be negative'], default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceCategorySchema.index({ isActive: 1 });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);