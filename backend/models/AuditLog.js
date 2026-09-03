const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: { type: String, required: true, trim: true },
    resourceType: { type: String, trim: true, default: '' },
    resourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: Object, default: {} },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);