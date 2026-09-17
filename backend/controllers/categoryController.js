const ServiceCategory = require('../models/ServiceCategory');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const { includeInactive = false, search = '' } = req.query;
  const filter = {};
  if (includeInactive !== 'true') filter.isActive = { $ne: false };
  if (search) filter.name = { $regex: search, $options: 'i' };

  const categories = await ServiceCategory.find(filter).sort({ name: 1 });
  res.json(ApiResponse.ok('Service categories retrieved', { categories }));
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound('Service category');
  res.json(ApiResponse.ok('Service category retrieved', { category }));
});

const createCategory = asyncHandler(async (req, res) => {
  const existing = await ServiceCategory.findOne({ name: req.body.name.trim().toLowerCase() });
  if (existing) throw ApiError.conflict('A category with this name already exists');
  const category = await ServiceCategory.create(req.body);
  res.status(201).json(ApiResponse.created('Service category created', { category }));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound('Service category');
  res.json(ApiResponse.ok('Service category updated', { category }));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound('Service category');
  res.json(ApiResponse.ok('Service category deleted', { category }));
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};