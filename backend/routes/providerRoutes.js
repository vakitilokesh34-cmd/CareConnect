const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const {
  providerProfileValidator, availabilityValidator, idParam, pagination,
} = require('../validators/resourceValidators');
const {
  listProviders, getProvider, getProviderProfile, updateProviderProfile,
  getAvailability, addAvailability, addManyAvailability, deleteAvailability,
  uploadDocuments, uploadProfileImage, dashboard,
} = require('../controllers/providerController');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', pagination, validate, listProviders);
router.get('/:id', idParam(), validate, getProvider);

// Protected provider-only routes
router.get('/profile/me', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), getProviderProfile);
router.put(
  '/profile',
  authenticateUser,
  authorizeRoles(ROLES.SERVICE_PROVIDER),
  providerProfileValidator,
  validate,
  updateProviderProfile
);
router.get('/me/availability', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), getAvailability);
router.post('/me/availability', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), availabilityValidator, validate, addAvailability);
router.post('/me/availability/bulk', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), addManyAvailability);
router.delete('/me/availability/:id', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), idParam('id'), validate, deleteAvailability);
router.post('/me/documents', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), upload.array('documents', 5), uploadDocuments);
router.post('/me/image', authenticateUser, upload.single('image'), uploadProfileImage);
router.get('/me/dashboard', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), dashboard);

// Backwards-compatible availability routes (implementation.md contract)
router.post('/availability', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), availabilityValidator, validate, addAvailability);
router.get('/availability', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), getAvailability);
router.post('/documents', authenticateUser, authorizeRoles(ROLES.SERVICE_PROVIDER), upload.array('documents', 5), uploadDocuments);

module.exports = router;