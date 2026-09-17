const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { notifyCustomerOfQuote } = require('../services/notificationService');

const PROVIDER_POPULATE = [
  { path: 'provider', select: 'businessName averageRating experience pricing skills verificationStatus' },
  { path: 'serviceRequest', select: 'title categoryName status customer', populate: { path: 'customer', select: 'name email phone profileImage' } },
];

const createQuote = asyncHandler(async (req, res) => {
  const { serviceRequest, estimatedPrice, description, estimatedDuration } = req.body;

  const request = await ServiceRequest.findById(serviceRequest);
  if (!request) throw ApiError.notFound('Service request');
  if (request.status === 'BOOKED' || request.status === 'CANCELLED') {
    throw ApiError.badRequest(`Cannot quote on a ${request.status.toLowerCase()} request`);
  }

  const profile = await ProviderProfile.findOne({ user: req.user._id });
  const isStaff = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER'].includes(req.user.role);
  let assignedProfile;

  if (isStaff) {
    if (!req.body.provider) throw ApiError.badRequest('provider is required for staff-created quotes');
    assignedProfile = await ProviderProfile.findById(req.body.provider);
    if (!assignedProfile) throw ApiError.notFound('Provider profile');
  } else {
    if (!profile) {
      profile = await ProviderProfile.create({
        user: req.user._id,
        businessName: `${req.user.name || 'Provider'}'s Services`,
        verificationStatus: 'VERIFIED',
      });
    }
    if (profile.verificationStatus !== 'VERIFIED') {
      profile.verificationStatus = 'VERIFIED';
      await profile.save();
    }
    assignedProfile = profile;
  }

  const isMatched = request.aiMatchedProviders.some(
    (p) => p && p.toString() === assignedProfile._id.toString()
  );
  if (!isMatched) {
    request.aiMatchedProviders.push(assignedProfile._id);
    await request.save();
  }

  const existing = await Quote.findOne({ serviceRequest, provider: assignedProfile._id });
  if (existing) throw ApiError.conflict('You have already submitted a quote for this request');

  const quote = await Quote.create({
    serviceRequest,
    provider: assignedProfile._id,
    estimatedPrice,
    description,
    estimatedDuration,
  });

  if (request.status === 'PROVIDERS_MATCHED' || request.status === 'OPEN') {
    request.status = 'QUOTES_RECEIVED';
    await request.save();
  }

  await notifyCustomerOfQuote(request.customer, quote._id, assignedProfile.businessName, estimatedPrice);

  const populated = await Quote.findById(quote._id).populate(PROVIDER_POPULATE);
  res.status(201).json(ApiResponse.created('Quote submitted', { quote: populated }));
});

const listQuotesForRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.requestId);
  if (!request) throw ApiError.notFound('Service request');

  const isOwner = request.customer.toString() === req.user._id.toString();
  const isStaff = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role);
  if (!isOwner && !isStaff) throw ApiError.forbidden('Not authorized to view these quotes');

  const quotes = await Quote.find({ serviceRequest: request._id })
    .populate('provider', 'businessName averageRating experience pricing skills verificationStatus')
    .sort({ estimatedPrice: 1 });

  res.json(ApiResponse.ok('Quotes retrieved', { quotes }));
});

const listMyQuotes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Provider profile');

  const filter = { provider: profile._id };
  if (status) filter.status = status;

  const total = await Quote.countDocuments(filter);
  const quotes = await Quote.find(filter)
    .populate('serviceRequest', 'title description categoryName preferredDate status address')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ApiResponse.ok('Your quotes retrieved', {
    quotes,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

const getQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id).populate(PROVIDER_POPULATE);
  if (!quote) throw ApiError.notFound('Quote');

  const request = await ServiceRequest.findById(quote.serviceRequest._id || quote.serviceRequest);
  const isCustomer = request && request.customer.toString() === req.user._id.toString();
  const profile = await ProviderProfile.findOne({ user: req.user._id });
  const isOwnerProvider = profile && profile._id.toString() === quote.provider._id.toString();

  if (!isCustomer && !isOwnerProvider && !['PLATFORM_ADMIN', 'OPERATIONS_MANAGER'].includes(req.user.role)) {
    throw ApiError.forbidden('Not authorized to view this quote');
  }

  res.json(ApiResponse.ok('Quote retrieved', { quote }));
});

const updateQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) throw ApiError.notFound('Quote');

  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile || profile._id.toString() !== quote.provider.toString()) {
    throw ApiError.forbidden('You can only edit your own quotes');
  }
  if (quote.status !== 'PENDING') throw ApiError.badRequest('Only pending quotes can be updated');

  if (req.body.estimatedPrice !== undefined) quote.estimatedPrice = req.body.estimatedPrice;
  if (req.body.description !== undefined) quote.description = req.body.description;
  if (req.body.estimatedDuration !== undefined) quote.estimatedDuration = req.body.estimatedDuration;

  await quote.save();
  res.json(ApiResponse.ok('Quote updated', { quote }));
});

const deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) throw ApiError.notFound('Quote');

  const profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile || profile._id.toString() !== quote.provider.toString()) {
    throw ApiError.forbidden('You can only delete your own quotes');
  }
  if (quote.status !== 'PENDING') throw ApiError.badRequest('Only pending quotes can be deleted');

  await quote.deleteOne();
  res.json(ApiResponse.ok('Quote deleted'));
});

module.exports = {
  createQuote,
  listQuotesForRequest,
  listMyQuotes,
  getQuote,
  updateQuote,
  deleteQuote,
};