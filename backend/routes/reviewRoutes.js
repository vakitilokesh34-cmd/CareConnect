const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { reviewValidator, idParam, pagination } = require('../validators/resourceValidators');
const { createReview, listProviderReviews, listMyReviewContexts } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', authenticateUser, authorizeRoles(ROLES.CUSTOMER), reviewValidator, validate, createReview);
router.get('/pending', authenticateUser, authorizeRoles(ROLES.CUSTOMER), listMyReviewContexts);
router.get('/provider/:providerId', authenticateUser, idParam('providerId'), pagination, validate, listProviderReviews);

module.exports = router;