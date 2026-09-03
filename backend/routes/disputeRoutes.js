const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { disputeValidator, resolveDisputeValidator, idParam, pagination } = require('../validators/resourceValidators');
const {
  createDispute, listDisputes, getDispute, updateDispute, resolveDispute,
} = require('../controllers/disputeController');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  authorizeRoles(ROLES.CUSTOMER, ROLES.SERVICE_PROVIDER),
  upload.array('evidence', 5),
  disputeValidator,
  validate,
  createDispute
);
router.get('/', authenticateUser, pagination, validate, listDisputes);
router.get('/:id', authenticateUser, idParam(), validate, getDispute);
router.put(
  '/:id',
  authenticateUser,
  authorizeRoles(ROLES.SUPPORT_AGENT, ROLES.PLATFORM_ADMIN),
  idParam(),
  validate,
  updateDispute
);
router.post(
  '/:id/resolve',
  authenticateUser,
  authorizeRoles(ROLES.SUPPORT_AGENT, ROLES.PLATFORM_ADMIN),
  idParam(),
  resolveDisputeValidator,
  validate,
  resolveDispute
);

module.exports = router;