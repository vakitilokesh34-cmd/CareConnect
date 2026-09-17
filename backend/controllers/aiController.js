const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { classifyRequest, checkAiHealth } = require('../services/aiService');
const { recommendProviders } = require('../services/recommendationService');

const classify = asyncHandler(async (req, res) => {
  const text = req.body.text || req.body.description;
  if (!text || !text.trim()) throw ApiError.badRequest('Please provide the request text to classify');

  const result = await classifyRequest(text);
  res.json(ApiResponse.ok('Request classified by AI', { classification: result }));
});

const recommend = asyncHandler(async (req, res) => {
  const { category, categoryId, requiredSkills = [], preferredDate, address, limit } = req.body;
  if (!categoryId && !category) {
    throw ApiError.badRequest('Provide a category or categoryId to find providers');
  }

  const result = await recommendProviders({
    category,
    categoryId: categoryId || category,
    requiredSkills,
    preferredDate,
    address,
    limit,
  });

  res.json(ApiResponse.ok('Provider recommendations generated', {
    recommendations: result,
    explanation: 'Recommendations are computed using skill match, availability, rating, experience, service area and completed jobs.',
  }));
});

const health = asyncHandler(async (req, res) => {
  res.json(ApiResponse.ok('AI service status', checkAiHealth()));
});

module.exports = { classify, recommend, health };