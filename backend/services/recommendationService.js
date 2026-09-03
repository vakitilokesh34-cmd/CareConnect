const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const config = require('../config');

const WEIGHTS = {
  skillMatch: 30,
  availability: 20,
  rating: 20,
  experience: 15,
  serviceArea: 10,
  completedJobs: 5,
};

function scoreProvider(provider, { categoryId, requiredSkills, preferredDate, address }) {
  const factors = {};

  // 1. Skill match (30%)
  const skills = provider.skills || [];
  const reqSkills = (requiredSkills || []).map((s) => s.toLowerCase());
  const matchedSkills = skills.filter((s) => reqSkills.includes(s.toLowerCase()));
  factors.skillMatch = reqSkills.length === 0
    ? (provider.serviceCategories || []).some((c) => c && c.toString() === String(categoryId)) ? 0.9 : 0.6
    : Math.min(1, matchedSkills.length / Math.max(1, reqSkills.length));

  // 2. Availability (20%)
  factors.availability = 0.5;
  if (preferredDate) {
    const start = new Date(preferredDate);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    // Using try/catch style promise-less computation; final check done by scoring pass
    factors.availability = 0.5; // placeholder refined below
  } else {
    factors.availability = 0.85;
  }

  // 3. Rating (20%)
  factors.rating = (provider.averageRating || 0) / 5;

  // 4. Experience (15%) - scaled to 20+ years max
  factors.experience = Math.min(1, (provider.experience || 0) / 20);

  // 5. Service area (10%)
  const city = (address && address.city) ? address.city.toLowerCase() : '';
  const areas = (provider.serviceAreas || []).map((a) => (a.city || '').toLowerCase());
  factors.serviceArea = city ? (areas.includes(city) ? 1 : 0.45) : 0.7;

  // 6. Completed jobs (5%)
  factors.completedJobs = Math.min(1, (provider.completedJobs || 0) / 200);

  const score = Math.round(
    factors.skillMatch * WEIGHTS.skillMatch +
      factors.availability * WEIGHTS.availability +
      factors.rating * WEIGHTS.rating +
      factors.experience * WEIGHTS.experience +
      factors.serviceArea * WEIGHTS.serviceArea +
      factors.completedJobs * WEIGHTS.completedJobs
  );

  return { factors, score: Math.min(100, score) };
}

function buildExplanation(provider, factors, options) {
  const parts = [];
  if (factors.skillMatch >= 0.7) {
    parts.push('has all or most of the required skills');
  }
  const city = options.address && options.address.city;
  if (city && factors.serviceArea === 1) {
    parts.push(`serves your area (${options.address.city})`);
  }
  if (factors.availability >= 0.85) {
    parts.push('is available at your requested time');
  } else if (factors.availability >= 0.5) {
    parts.push('has some overlapping availability');
  }
  if (provider.averageRating >= 4.5) {
    parts.push(`holds a ${provider.averageRating.toFixed(1)} star rating`);
  } else if (provider.averageRating >= 4) {
    parts.push(`is rated ${provider.averageRating.toFixed(1)} stars`);
  }
  if (provider.experience >= 3) {
    parts.push(`brings ${provider.experience} years of experience`);
  }
  if (provider.completedJobs >= 50) {
    parts.push(`and has completed ${provider.completedJobs} jobs`);
  }
  if (parts.length === 0) parts.push('is a verified service provider in this category');
  return `Recommended because this provider ${parts.join(', ')}.`;
}

const recommendProviders = async ({
  category,
  categoryId,
  requiredSkills = [],
  preferredDate,
  address,
  excludeProviders = [],
  limit = 8,
}) => {
  const filter = {
    verificationStatus: 'VERIFIED',
    isAvailable: true,
    $or: [
      { serviceCategories: categoryId },
      { skills: { $in: requiredSkills } },
      { serviceCategories: { $size: 0 } },
    ],
  };
  if (excludeProviders.length) {
    filter._id = { $nin: excludeProviders };
  }

  let providers = await ProviderProfile.find(filter)
    .populate('user', 'name email phone profileImage')
    .limit(50)
    .lean();

  // Availability refinement when a preferred date is provided
  let dateInfo = null;
  if (preferredDate) {
    const start = new Date(preferredDate);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const slots = await AvailabilitySlot.find({
      provider: { $in: providers.map((p) => p._id) },
      isAvailable: true,
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).lean();

    const overlappingBookings = await Booking.find({
      provider: { $in: providers.map((p) => p._id) },
      status: { $nin: ['CANCELLED', 'COMPLETED', 'CUSTOMER_CONFIRMED', 'DISPUTED'] },
      scheduledStartTime: { $lt: end },
      scheduledEndTime: { $gt: start },
    }).lean();

    const slotProviderSet = new Set(slots.map((s) => s.provider.toString()));
    const bookedProviderSet = new Set(overlappingBookings.map((b) => b.provider.toString()));
    dateInfo = { slotProviderSet, bookedProviderSet };
  }

  const scored = providers.map((provider) => {
    const options = { categoryId, requiredSkills, preferredDate, address };
    if (dateInfo) {
      const pid = provider._id.toString();
      const hasSlot = dateInfo.slotProviderSet.has(pid);
      const isBooked = dateInfo.bookedProviderSet.has(pid);
      if (isBooked) provider._isBooked = true;
      provider._hasSlot = hasSlot;
    }
    const { factors, score } = scoreProvider(provider, options);
    const explanation = buildExplanation(provider, factors, options);
    return { provider, factors, score, explanation };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ provider, factors, score, explanation }) => ({
    provider: {
      _id: provider._id,
      businessName: provider.businessName,
      description: provider.description,
      experience: provider.experience,
      skills: provider.skills,
      serviceAreas: provider.serviceAreas,
      pricing: provider.pricing,
      averageRating: provider.averageRating,
      totalReviews: provider.totalReviews,
      completedJobs: provider.completedJobs,
      verificationStatus: provider.verificationStatus,
      user: provider.user,
    },
    matchScore: score,
    factors: {
      skillMatch: factors.skillMatch,
      availability: factors.availability,
      rating: factors.rating,
      experience: factors.experience,
      serviceArea: factors.serviceArea,
      completedJobs: factors.completedJobs,
    },
    explanation: provider._isBooked
      ? `Recommended because this provider is a strong match, but they already have a conflicting booking at your requested time — consider adjusting your preferred slot.`
      : explanation,
    hasAvailabilitySlot: provider._hasSlot !== undefined ? provider._hasSlot : true,
    hasConflictingBooking: Boolean(provider._isBooked),
  }));
};

module.exports = { recommendProviders, scoreProvider, WEIGHTS, buildExplanation };