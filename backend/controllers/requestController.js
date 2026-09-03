const ServiceRequest = require('../models/ServiceRequest');
const ServiceCategory = require('../models/ServiceCategory');
const Quote = require('../models/Quote');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { classifyRequest } = require('../services/aiService');
const { recommendProviders } = require('../services/recommendationService');
const { notifyProviderOfRequest } = require('../services/notificationService');

const POPULATE = [
  { path: 'category', select: 'name icon basePrice' },
  { path: 'aiMatchedProviders', select: 'businessName averageRating experience skills' },
];

const createRequest = asyncHandler(async (req, res) => {
  const { title, description, images = [], address, preferredDate, preferredTime } = req.body;

  // 1. Persist the request (status OPEN)
  const request = await ServiceRequest.create({
    customer: req.user._id,
    title,
    description,
    images,
    address,
    preferredDate,
    preferredTime,
  });

  // 2. AI classification (Gemini when configured, heuristic otherwise)
  const ai = await classifyRequest(description);

  // 3. Find matching ServiceCategory by name
  const category = await ServiceCategory.findOne({ name: new RegExp(`^${ai.category}$`, 'i') });
  request.AIClassification = {
    category: category ? category.name : ai.category,
    requiredSkills: ai.requiredSkills,
    urgency: ai.urgency,
    keywords: ai.keywords,
    summary: ai.summary,
    confidence: ai.confidence,
    gateway: ai.gateway,
  };
  request.category = category ? category._id : null;
  request.categoryName = category ? category.name : ai.category;
  request.requiredSkills = ai.requiredSkills;
  await request.save();

  // 4. Discover + rank matching providers
  const scored = await recommendProviders({
    category: category,
    categoryId: category ? category._id : null,
    requiredSkills: ai.requiredSkills,
    preferredDate,
    address,
    limit: 10,
  });

  const matchedProviderIds = scored
    .filter((r) => r.matchScore > 0)
    .map((r) => r.provider._id);

  if (matchedProviderIds.length > 0) {
    request.aiMatchedProviders = matchedProviderIds;
    request.status = 'PROVIDERS_MATCHED';
    await request.save();
  }

  // 5. Notify matched providers
  const providerProfiles = await require('../models/ProviderProfile')
    .find({ _id: { $in: matchedProviderIds } })
    .select('user');
  await Promise.all(
    providerProfiles.map((p) =>
      notifyProviderOfRequest(p.user, request._id, request.title)
    )
  );

  const populated = await ServiceRequest.findById(request._id).populate(POPULATE);

  res.status(201).json(
    ApiResponse.created('Service request created and classified by AI', {
      request: populated,
      recommendations: scored,
      aiClassification: request.AIClassification,
    })
  );
});

const listRequests = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 10, mine = 'true' } = req.query;
  const filter = {};

  if (req.user.role === 'CUSTOMER') {
    // Customers can only see their own requests.
    filter.customer = req.user._id;
  } else if (req.user.role === 'SERVICE_PROVIDER') {
    // Providers only see requests explicitly matched to their profile.
    const profile = await require('../models/ProviderProfile').findOne({ user: req.user._id }).select('_id');
    if (!profile) throw ApiError.notFound('Provider profile');
    filter.aiMatchedProviders = profile._id;
  } else if (!['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role)) {
    throw ApiError.forbidden('Not authorized to view service requests');
  }

  if (status && status !== '') filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { categoryName: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await ServiceRequest.countDocuments(filter);
  const requests = await ServiceRequest.find(filter)
    .populate(POPULATE)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ApiResponse.ok('Service requests retrieved', {
    requests,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

const getRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id)
    .populate(POPULATE)
    .populate('customer', 'name email phone profileImage');

  if (!request) throw ApiError.notFound('Service request');

  const isOwner = request.customer._id.toString() === req.user._id.toString();
  const isProvider = await require('../models/ProviderProfile').exists({
    user: req.user._id,
    _id: { $in: request.aiMatchedProviders },
  });
  const isStaff = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role);

  if (!isOwner && !isStaff && !isProvider) {
    throw ApiError.forbidden('You are not authorized to view this request');
  }

  const quotes = await Quote.find({ serviceRequest: request._id })
    .populate('provider', 'businessName averageRating experience user pricing')
    .sort({ estimatedPrice: 1 });

  res.json(ApiResponse.ok('Service request retrieved', { request, quotes }));
});

const updateRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Service request');

  if (request.customer.toString() !== req.user._id.toString() &&
      !['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role)) {
    throw ApiError.forbidden('You are not authorized to update this request');
  }

  if (['BOOKED', 'CANCELLED', 'COMPLETED'].includes(request.status)) {
    throw ApiError.badRequest('This request cannot be edited in its current state');
  }

  const allowed = ['title', 'description', 'images', 'address', 'preferredDate', 'preferredTime'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) request[field] = req.body[field];
  });

  if (req.body.description && req.body.description !== request.description) {
    const ai = await classifyRequest(req.body.description);
    request.AIClassification = {
      category: ai.category,
      requiredSkills: ai.requiredSkills,
      urgency: ai.urgency,
      keywords: ai.keywords,
      summary: ai.summary,
      confidence: ai.confidence,
      gateway: ai.gateway,
    };
    request.categoryName = ai.category;
    request.requiredSkills = ai.requiredSkills;
    const category = await ServiceCategory.findOne({ name: new RegExp(`^${ai.category}$`, 'i') });
    request.category = category ? category._id : null;
    request.status = 'OPEN';
  }

  await request.save();
  res.json(ApiResponse.ok('Service request updated', { request }));
});

const cancelRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Service request');

  if (request.customer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to cancel this request');
  }
  if (request.status === 'BOOKED') {
    throw ApiError.badRequest('This request is booked. Cancel the booking instead.');
  }
  if (request.status === 'CANCELLED') throw ApiError.badRequest('Request is already cancelled');

  request.status = 'CANCELLED';
  await request.save();
  res.json(ApiResponse.ok('Service request cancelled', { request }));
});

const deleteRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Service request');

  if (request.customer.toString() !== req.user._id.toString() &&
      req.user.role !== 'PLATFORM_ADMIN') {
    throw ApiError.forbidden('You are not authorized to delete this request');
  }
  if (request.status === 'BOOKED') {
    throw ApiError.badRequest('Booked requests cannot be deleted');
  }

  await Quote.deleteMany({ serviceRequest: request._id });
  await request.deleteOne();
  res.json(ApiResponse.ok('Service request deleted'));
});

module.exports = {
  createRequest,
  listRequests,
  getRequest,
  updateRequest,
  cancelRequest,
  deleteRequest,
};
