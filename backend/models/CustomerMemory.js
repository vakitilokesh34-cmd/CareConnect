const mongoose = require('mongoose');

const customerMemorySchema = new mongoose.Schema(
  {
    bankId: {
      type: String,
      required: true,
      default: 'careconnect',
      index: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    source: {
      type: String,
      enum: ['hindsight-remote', 'mongodb-persistent', 'system'],
      default: 'mongodb-persistent',
    },
  },
  { timestamps: true }
);

// Index for text search across memory content
customerMemorySchema.index({ content: 'text' });
customerMemorySchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model('CustomerMemory', customerMemorySchema);
