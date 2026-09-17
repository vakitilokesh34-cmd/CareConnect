const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { quoteValidator, idParam, pagination } = require('../validators/resourceValidators');
const {
  createQuote, listQuotesForRequest, listMyQuotes, getQuote, updateQuote, deleteQuote,
} = require('../controllers/quoteController');

const router = express.Router();

router.post('/', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER, ROLES.OPERATIONS_MANAGER, ROLES.PLATFORM_ADMIN), quoteValidator, validate, createQuote);
router.get('/request/:requestId', authenticateUser, idParam('requestId'), validate, listQuotesForRequest);
router.get('/my', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), pagination, validate, listMyQuotes);
router.get('/:id', authenticateUser, idParam(), validate, getQuote);
router.put('/:id', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), idParam(), validate, updateQuote);
router.delete('/:id', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), idParam(), validate, deleteQuote);

module.exports = router;