const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const authenticateUser = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Please log in to access this resource');
  }

  const token = header.split(' ')[1];
  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    throw ApiError.unauthorized('Session expired or invalid token. Please log in again.');
  }

  const user = await User.findById(payload.id);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been suspended. Contact support.');
  }

  req.user = user;
  next();
});

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to perform this action');
  }
  next();
};

const validateResourceOwnership = (model, { param = 'id', ownerField = 'user' } = {}) =>
  asyncHandler(async (req, res, next) => {
    const resourceId = req.params[param];
    if (!resourceId) return next();

    const resource = await model.findById(resourceId).select('+ownerField');
    if (!resource) throw ApiError.notFound('Resource');

    const isOwner = resource[ownerField] && resource[ownerField].toString() === req.user._id.toString();
    const isStaff = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      throw ApiError.forbidden('You are not authorized to access this resource');
    }

    req.resource = resource;
    next();
  });

module.exports = { authenticateUser, authorizeRoles, validateResourceOwnership };