const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { serviceRequestValidator, idParam, pagination } = require('../validators/resourceValidators');
const {
  createRequest, listRequests, getRequest, updateRequest, cancelRequest, deleteRequest,
} = require('../controllers/requestController');
const { upload } = require('../middleware/upload');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  authorizeRoles(ROLES.CUSTOMER, ROLES.SUPPORT_AGENT, ROLES.PLATFORM_ADMIN, ROLES.OPERATIONS_MANAGER),
  upload.array('images', 10),
  serviceRequestValidator,
  validate,
  createRequest
);

router.get(
  '/',
  authenticateUser,
  authorizeRoles(ROLES.CUSTOMER, ROLES.SUPPORT_AGENT, ROLES.PLATFORM_ADMIN, ROLES.OPERATIONS_MANAGER),
  pagination,
  validate,
  listRequests
);

router.get('/:id', authenticateUser, idParam(), validate, getRequest);
router.put('/:id', authenticateUser, idParam(), validate, updateRequest);
router.delete('/:id', authenticateUser, idParam(), validate, deleteRequest);
router.post('/:id/cancel', authenticateUser, idParam(), validate, cancelRequest);

module.exports = router;