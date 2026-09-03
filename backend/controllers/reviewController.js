const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createReview = asyncHandler(async (req, res) => {
  const { booking, rating, comment } = req.body;

  const bookingDoc = await Booking.findById(booking);
  if (!bookingDoc) throw ApiError.notFound('Booking');

  if (bookingDoc.customer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only review your own bookings');
  }

  // Only customers with a completed booking may review
  if (bookingDoc.status !== 'CUSTOMER_CONFIRMED' && bookingDoc.status !== 'COMPLETED') {
    throw ApiError.badRequest('Only customers who completed the booking can submit a review');
  }

  const existing = await Review.findOne({ booking: bookingDoc._id });
  if (existing) throw ApiError.conflict('You have already reviewed this booking');

  const review = await Review.create({
    customer: req.user._id,
    provider: bookingDoc.provider,
    booking: bookingDoc._id,
    rating,
    comment: comment || '',
  });

  // Recompute provider aggregate rating + count
  const agg = await Review.aggregate([
    { $match: { provider: bookingDoc.provider } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = rating, count = 1 } = agg[0] || {};
  await ProviderProfile.updateOne(
    { _id: bookingDoc.provider },
    { averageRating: Math.round(avg * 100) / 100, totalReviews: count }
  );

  const populated = await Review.findById(review._id).populate('customer', 'name profileImage');
  res.status(201).json(ApiResponse.created('Review submitted', { review: populated }));
});

const listProviderReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { provider: req.params.providerId };

  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ApiResponse.ok('Reviews retrieved', {
    reviews,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

const listMyReviewContexts = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    customer: req.user._id,
    status: { $in: ['CUSTOMER_CONFIRMED', 'COMPLETED'] },
    _id: { $nin: await Review.find({ customer: req.user._id }).distinct('booking') },
  })
    .populate({ path: 'provider', select: 'businessName averageRating user', populate: { path: 'user', select: 'name profileImage' } })
    .sort({ updatedAt: -1 })
    .limit(30);

  res.json(ApiResponse.ok('Review contexts retrieved', { bookings, pendingReviews: bookings.length }));
});

module.exports = { createReview, listProviderReviews, listMyReviewContexts };