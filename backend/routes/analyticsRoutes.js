const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { dashboard, bookingsAnalytics, providersAnalytics, revenueAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/dashboard', authenticateUser, dashboard);
router.get(
  '/bookings',
  authenticateUser,
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.OPERATIONS_MANAGER),
  bookingsAnalytics
);
router.get(
  '/providers',
  authenticateUser,
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.OPERATIONS_MANAGER),
  providersAnalytics
);
router.get(
  '/revenue',
  authenticateUser,
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.OPERATIONS_MANAGER),
  revenueAnalytics
);

module.exports = router;