const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { idParam } = require('../validators/resourceValidators');
const { classify, recommend, health } = require('../controllers/aiController');

const router = express.Router();

router.get('/', health);
router.post(
  '/classify-request',
  authenticateUser,
  authorizeRoles(ROLES.CUSTOMER, ROLES.SUPPORT_AGENT, ROLES.PLATFORM_ADMIN, ROLES.OPERATIONS_MANAGER),
  classify
);
router.post('/recommend-providers', authenticateUser, recommend);

module.exports = router;