const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { toPublicUser } = require('../utils/helpers');
const { ROLES, STAFF_ROLES } = require('../utils/constants');

const listUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ApiResponse.ok('Users retrieved', {
    users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!STAFF_ROLES.includes(role)) {
    throw ApiError.badRequest('Staff users must have role PLATFORM_ADMIN, OPERATIONS_MANAGER or SUPPORT_AGENT');
  }
  const [emailTaken, phoneTaken] = await Promise.all([
    User.isEmailTaken(email),
    User.isPhoneTaken(phone),
  ]);
  if (emailTaken) throw ApiError.conflict('Email already exists');
  if (phoneTaken) throw ApiError.conflict('Phone already exists');

  const user = await User.create({ name, email, password, phone, role });
  res.status(201).json(ApiResponse.created('Staff user created', { user: toPublicUser(user) }));
});

const setUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User');
  if (user.role === ROLES.PLATFORM_ADMIN) throw ApiError.forbidden('Cannot suspend a platform admin');

  user.isActive = req.body.isActive;
  await user.save();
  res.json(ApiResponse.ok('User status updated', { user: toPublicUser(user) }));
});

const listProviders = asyncHandler(async (req, res) => {
  const { verificationStatus, search, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await ProviderProfile.countDocuments(filter);
  const providers = await ProviderProfile.find(filter)
    .populate('user', 'name email phone isActive')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ApiResponse.ok('Providers retrieved', {
    providers,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

const verifyProvider = asyncHandler(async (req, res) => {
  const { verificationStatus, rejectionReason } = req.body;
  const profile = await ProviderProfile.findById(req.params.id).populate('user', 'name email');
  if (!profile) throw ApiError.notFound('Provider');

  profile.verificationStatus = verificationStatus;
  profile.rejectionReason = rejectionReason || '';
  if (verificationStatus === 'VERIFIED') {
    profile.verificationDocuments = profile.verificationDocuments.map((d) => ({
      ...d,
      status: 'APPROVED',
    }));
  }
  await profile.save();

  await require('../services/notificationService').createNotification({
    user: profile.user._id,
    title: verificationStatus === 'VERIFIED' ? 'Provider verification approved' : 'Provider verification rejected',
    message: verificationStatus === 'VERIFIED'
      ? 'Congratulations! Your provider profile is now verified and visible to customers.'
      : (rejectionReason || 'Please review the rejection reason and re-submit your documents.'),
    type: 'ADMIN',
  });

  res.json(ApiResponse.ok('Provider verification updated', { provider: profile }));
});

const updateCategoryStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const category = await require('../models/ServiceCategory').findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );
  if (!category) throw ApiError.notFound('Service category');
  res.json(ApiResponse.ok('Category status updated', { category }));
});

const managePolicies = asyncHandler(async (req, res) => {
  const Policy = mongoosePolicyModel();
  for (const [key, value] of Object.entries(req.body)) {
    await Policy.updateOne({ key }, { $set: { value } }, { upsert: true });
  }
  const policies = await Policy.find().lean();
  res.json(ApiResponse.ok('Platform policies updated', { policies }));
});

function mongoosePolicyModel() {
  const mongoose = require('mongoose');
  if (mongoose.models.PlatformPolicy) return mongoose.model('PlatformPolicy');
  return mongoose.model('PlatformPolicy', new mongoose.Schema(
    {
      key: { type: String, required: true, unique: true },
      value: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    { timestamps: true }
  ));
}

const getPolicies = asyncHandler(async (req, res) => {
  const policies = await mongoosePolicyModel().find().lean();
  res.json(ApiResponse.ok('Platform policies', { policies }));
});

const listAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, action } = req.query;
  const filter = {};
  if (action) filter.action = { $regex: action, $options: 'i' };

  const total = await require('../models/AuditLog').countDocuments(filter);
  const logs = await require('../models/AuditLog')
    .find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ApiResponse.ok('Audit logs retrieved', {
    logs,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

module.exports = {
  listUsers,
  createStaffUser,
  setUserStatus,
  listProviders,
  verifyProvider,
  updateCategoryStatus,
  managePolicies,
  getPolicies,
  listAuditLogs,
};