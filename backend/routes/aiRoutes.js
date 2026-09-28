const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles, optionalAuth } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { idParam } = require('../validators/resourceValidators');
const { classify, recommend, health } = require('../controllers/aiController');

const router = express.Router();

router.get('/', health);
router.post('/classify-request', optionalAuth, classify);
router.post('/recommend-providers', recommend);

module.exports = router;