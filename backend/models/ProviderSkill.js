const mongoose = require('mongoose');

const providerSkillSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
      index: true,
    },
    skill: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    proficiencyLevel: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'EXPERT'],
      default: 'INTERMEDIATE',
    },
  },
  { timestamps: true }
);

providerSkillSchema.index({ provider: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('ProviderSkill', providerSkillSchema);