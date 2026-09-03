const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { idParam, pagination, adminStatusValidator, verifyProviderValidator } = require('../validators/resourceValidators');
const {
  listUsers, createStaffUser, setUserStatus, listProviders, verifyProvider,
  updateCategoryStatus, managePolicies, getPolicies, listAuditLogs,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticateUser, authorizeRoles(ROLES.PLATFORM_ADMIN));

router.get('/users', pagination, validate, listUsers);
router.post('/users', createStaffUser);
router.put('/users/:id/status', idParam(), adminStatusValidator, validate, setUserStatus);

router.get('/providers', pagination, validate, listProviders);
router.put('/providers/:id/verify', idParam(), verifyProviderValidator, validate, verifyProvider);

router.put('/categories/:id/status', idParam(), adminStatusValidator, validate, updateCategoryStatus);

router.get('/policies', getPolicies);
router.post('/policies', managePolicies);

router.get('/audit-logs', pagination, validate, listAuditLogs);

module.exports = router;