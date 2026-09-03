const mongoose = require('mongoose');
const ProviderProfile = require('../models/ProviderProfile');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { staticUrl } = require('../middleware/upload');

const listProviders = asyncHandler(async (req, res) => {
  const {
    category, skills, city, minRating, maxPrice, onlyVerified = 'true',
    page = 1, limit = 12, search = '',
  } = req.query;

  const filter = {};

  if (onlyVerified === 'true') filter.verificationStatus = 'VERIFIED';
  if (category) filter.serviceCategories = { $in: [category] };
  if (skills) filter.skills = { $in: String(skills).split(',').map((s) => s.trim()) };
  if (city) {
    filter['serviceAreas.city'] = { $regex: String(city).trim(), $options: 'i' };
  }
  if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };
  if (maxPrice) filter['pricing.baseRate'] = { $lte: parseFloat(maxPrice) };
  if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await ProviderProfile.countDocuments(filter);
  const providers = await ProviderProfile.find(filter)
    .populate('user', 'name phone profileImage')
    .populate('serviceCategories', 'name icon')
    .sort({ averageRating: -1, completedJobs: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(
    ApiResponse.ok('Providers retrieved', {
      providers,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  );
});

const getProvider = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findById(req.params.id)
    .populate('user', 'name email phone profileImage createdAt')
    .populate('serviceCategories', 'name icon');

  if (!provider) throw ApiError.notFound('Provider');

  const reviews = await require('../models/Review')
    .find({ provider: provider._id })
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(ApiResponse.ok('Provider retrieved', { provider, reviews }));
});

const getProviderProfile = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id })
    .populate('serviceCategories');
  if (!profile) throw ApiError.notFound('Provider profile. Complete your profile first');
  res.json(ApiResponse.ok('Provider profile retrieved', {
    user: require('../utils/helpers').toPublicUser(req.user),
    provider: profile,
  }));
});

const updateProviderProfile = asyncHandler(async (req, res) => {
  const {
    businessName, description, experience, skills, serviceCategories,
    serviceAreas, pricing,
  } = req.body;

  let profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = new ProviderProfile({ user: req.user._id });
  }

  if (businessName !== undefined) profile.businessName = businessName;
  if (description !== undefined) profile.description = description;
  if (experience !== undefined) profile.experience = experience;
  if (skills !== undefined) {
    profile.skills = [...new Set(skills.map((s) => s.trim()).filter(Boolean))];
  }
  if (serviceCategories !== undefined) profile.serviceCategories = serviceCategories;
  if (serviceAreas !== undefined) profile.serviceAreas = serviceAreas;
  if (pricing !== undefined) profile.pricing = pricing;

  await profile.save();
  res.json(ApiResponse.ok('Provider profile updated', { provider: profile }));
});

const getAvailability = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Provider profile');

  const { start, end } = req.query;
  const filter = { provider: profile._id };
  if (start && end) filter.startTime = { $gte: new Date(start), $lte: new Date(end) };

  const slots = await AvailabilitySlot.find(filter).sort({ startTime: 1 });
  res.json(ApiResponse.ok('Availability slots retrieved', { slots }));
});

const addAvailability = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Provider profile. Create your profile first');

  const { startTime, endTime, isAvailable = true } = req.body;
  if (new Date(endTime) <= new Date(startTime)) {
    throw ApiError.badRequest('End time must be after start time');
  }

  const overlapping = await AvailabilitySlot.findOverlapping(profile._id, startTime, endTime);
  if (overlapping.length > 0) {
    throw ApiError.conflict('This time slot overlaps with an existing availability slot');
  }

  const slot = await AvailabilitySlot.create({
    provider: profile._id,
    startTime,
    endTime,
    isAvailable,
  });

  profile.isAvailable = true;
  await profile.save();

  res.status(201).json(ApiResponse.created('Availability slot created', { slot }));
});

const addManyAvailability = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Provider profile. Create your profile first');

  const { slots } = req.body;
  if (!Array.isArray(slots) || slots.length === 0) {
    throw ApiError.badRequest('Provide at least one slot');
  }

  const created = [];
  for (const s of slots) {
    const { startTime, endTime, isAvailable = true } = s;
    if (new Date(endTime) <= new Date(startTime)) continue;
    const overlapping = await AvailabilitySlot.findOverlapping(profile._id, startTime, endTime);
    if (overlapping.length > 0) continue;
    created.push(
      await AvailabilitySlot.create({ provider: profile._id, startTime, endTime, isAvailable })
    );
  }

  if (created.length > 0) {
    profile.isAvailable = true;
    await profile.save();
  }

  res.status(201).json(
    ApiResponse.created(
      `${created.length} availability slot(s) created`,
      { slots: created, skipped: slots.length - created.length }
    )
  );
});

const deleteAvailability = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Provider profile');

  const slot = await AvailabilitySlot.findOneAndDelete({
    _id: req.params.id,
    provider: profile._id,
  });
  if (!slot) throw ApiError.notFound('Availability slot');

  res.json(ApiResponse.ok('Availability slot deleted', { slot }));
});

const uploadDocuments = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Provider profile');

  const files = req.files || [];
  const titles = Array.isArray(req.body.titles) ? req.body.titles : [];

  const docs = files.map((file, i) => ({
    title: titles[i] || `Document ${i + 1}`,
    url: staticUrl(file.filename),
    status: 'PENDING',
  }));

  profile.verificationDocuments.push(...docs);
  await profile.save();

  res.json(ApiResponse.ok('Verification documents uploaded', {
    documents: profile.verificationDocuments,
  }));
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  req.user.profileImage = staticUrl(req.file.filename);
  await req.user.save();
  res.json(ApiResponse.ok('Profile image updated', { profileImage: req.user.profileImage }));
});

const dashboard = asyncHandler(async (req, res) => {
  const profile = await ProviderProfile.findOne({ user: req.user._id })
    .populate('serviceCategories');
  if (!profile) throw ApiError.notFound('Provider profile');

  const [
    totalJobs,
    activeJobs,
    completedJobs,
    pendingReviewsCount,
    recentBookings,
    earningsAgg,
  ] = await Promise.all([
    require('../models/Booking').countDocuments({ provider: profile._id }),
    require('../models/Booking').countDocuments({
      provider: profile._id,
      status: { $in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'] },
    }),
    require('../models/Booking').countDocuments({
      provider: profile._id,
      status: { $in: ['COMPLETED', 'CUSTOMER_CONFIRMED'] },
    }),
    require('../models/ServiceRequest').countDocuments({ aiMatchedProviders: profile._id }),
    require('../models/Booking')
      .find({ provider: profile._id })
      .populate('customer', 'name profileImage')
      .populate('serviceRequest', 'title categoryName')
      .sort({ createdAt: -1 })
      .limit(8),
    require('../models/Invoice').aggregate([
      { $match: { provider: profile._id } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  const earnings = earningsAgg.length ? earningsAgg[0].total : 0;

  res.json(ApiResponse.ok('Provider dashboard data', {
    stats: { totalJobs, activeJobs, completedJobs, pendingReviewsCount, earnings },
    recentBookings,
    profile,
  }));
});

module.exports = {
  listProviders,
  getProvider,
  getProviderProfile,
  updateProviderProfile,
  getAvailability,
  addAvailability,
  addManyAvailability,
  deleteAvailability,
  uploadDocuments,
  uploadProfileImage,
  dashboard,
};