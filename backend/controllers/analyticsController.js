const User = require('../models/User');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const Invoice = require('../models/Invoice');
const ServiceCategory = require('../models/ServiceCategory');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/constants');

const ACTIVE_STATUSES = ['CONFIRMED', 'PROVIDER_ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'];

const dashboard = asyncHandler(async (req, res) => {
  const role = req.user.role;

  if (role === 'PLATFORM_ADMIN') {
    const [
      totalUsers, totalCustomers, totalProviders, verifiedProviders, pendingVerifications,
      totalBookings, completedBookings, cancelledBookings, openDisputes, totalCategories,
      totalRequests, totalRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.CUSTOMER }),
      User.countDocuments({ role: ROLES.SERVICE_PROVIDER }),
      ProviderProfile.countDocuments({ verificationStatus: 'VERIFIED' }),
      ProviderProfile.countDocuments({ verificationStatus: 'PENDING' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['COMPLETED', 'CUSTOMER_CONFIRMED'] } }),
      Booking.countDocuments({ status: 'CANCELLED' }),
      Dispute.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } }),
      ServiceCategory.countDocuments({ isActive: true }),
      ServiceRequest.countDocuments(),
      Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);

    res.json(ApiResponse.ok('Admin dashboard analytics', {
      stats: {
        totalUsers, totalCustomers, totalProviders, verifiedProviders, pendingVerifications,
        totalBookings, completedBookings, cancelledBookings, openDisputes, totalCategories,
        totalRequests,
        totalRevenue: totalRevenue.length ? totalRevenue[0].total : 0,
      },
    }));
  }

  if (role === 'OPERATIONS_MANAGER') {
    const [
      activeJobs, completedJobs, totalBookings, cancelledBookings, avgRatingAgg, providers, reviews,
    ] = await Promise.all([
      Booking.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
      Booking.countDocuments({ status: { $in: ['COMPLETED', 'CUSTOMER_CONFIRMED'] } }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'CANCELLED' }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      ProviderProfile.countDocuments({ verificationStatus: 'VERIFIED' }),
      Review.countDocuments(),
    ]);

    const averageRating = avgRatingAgg.length ? Math.round(avgRatingAgg[0].avg * 100) / 100 : 0;
    const bookingCompletionRate = totalBookings ? Math.round((completedJobs / totalBookings) * 100) : 0;
    const cancellationRate = totalBookings ? Math.round((cancelledBookings / totalBookings) * 100) : 0;
    const activeProviders = await ProviderProfile.countDocuments({ isAvailable: true, verificationStatus: 'VERIFIED' });

    res.json(ApiResponse.ok('Operations analytics', {
      stats: {
        activeJobs, completedJobs, totalBookings, cancelledBookings,
        bookingCompletionRate, cancellationRate, averageRating,
        verifiedProviders: providers, activeProviders, totalReviews: reviews,
      },
    }));
  }

  if (role === 'SERVICE_PROVIDER') {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) return res.json(ApiResponse.ok('Provider analytics', { stats: null }));

    const [totalJobs, completedJobs, activeJobs, earningsAgg, avgRating, totalReviews] =
      await Promise.all([
        Booking.countDocuments({ provider: profile._id }),
        Booking.countDocuments({ provider: profile._id, status: { $in: ['COMPLETED', 'CUSTOMER_CONFIRMED'] } }),
        Booking.countDocuments({ provider: profile._id, status: { $in: ACTIVE_STATUSES } }),
        Invoice.aggregate([
          { $match: { provider: profile._id, paymentStatus: 'PAID' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Review.countDocuments({ provider: profile._id, rating: { $gte: 4 } }),
        Review.countDocuments({ provider: profile._id }),
      ]);

    res.json(ApiResponse.ok('Provider analytics', {
      stats: {
        totalJobs,
        completedJobs,
        activeJobs,
        averageRating: profile.averageRating || 0,
        totalReviews: profile.totalReviews || 0,
        earnings: earningsAgg.length ? earningsAgg[0].total : 0,
      },
    }));
  }

  if (role === 'SUPPORT_AGENT') {
    const [openDisputes, underReview, resolved, totalDisputes] = await Promise.all([
      Dispute.countDocuments({ status: 'OPEN' }),
      Dispute.countDocuments({ status: 'UNDER_REVIEW' }),
      Dispute.countDocuments({ status: 'RESOLVED' }),
      Dispute.countDocuments(),
    ]);
    res.json(ApiResponse.ok('Support analytics', {
      stats: { openDisputes, underReview, resolved, totalDisputes },
    }));
  }

  // Customer overview
  const [totalRequests, openRequests, myBookings, activeBookings, completedBookings, quotesReceived] = await Promise.all([
    ServiceRequest.countDocuments({ customer: req.user._id }),
    ServiceRequest.countDocuments({ customer: req.user._id, status: { $in: ['OPEN', 'PROVIDERS_MATCHED', 'QUOTES_RECEIVED'] } }),
    Booking.countDocuments({ customer: req.user._id }),
    Booking.countDocuments({ customer: req.user._id, status: { $in: ACTIVE_STATUSES } }),
    Booking.countDocuments({ customer: req.user._id, status: { $in: ['COMPLETED', 'CUSTOMER_CONFIRMED'] } }),
    ServiceRequest.countDocuments({ customer: req.user._id, status: 'QUOTES_RECEIVED' }),
  ]);

  res.json(ApiResponse.ok('Customer analytics', {
    stats: { totalRequests, openRequests, myBookings, activeBookings, completedBookings, quotesReceived },
  }));
});

const bookingsAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - parseInt(days, 10));

  const raw = await Booking.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'CUSTOMER_CONFIRMED']] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(ApiResponse.ok('Booking analytics', { bookings: raw }));
});

const providersAnalytics = asyncHandler(async (req, res) => {
  const providers = await ProviderProfile.find()
    .populate('user', 'name')
    .sort({ completedJobs: -1 })
    .limit(10)
    .select('businessName averageRating totalReviews completedJobs experience verificationStatus pricing');

  res.json(ApiResponse.ok('Provider analytics', { providers }));
});

const revenueAnalytics = asyncHandler(async (req, res) => {
  const { days = 90 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - parseInt(days, 10));

  const raw = await Invoice.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totals = await Invoice.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
  ]);

  res.json(ApiResponse.ok('Revenue analytics', {
    revenue: raw,
    totals: totals.length ? totals[0] : { revenue: 0, count: 0 },
  }));
});

module.exports = { dashboard, bookingsAnalytics, providersAnalytics, revenueAnalytics };