const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { bookingValidator, idParam, pagination } = require('../validators/resourceValidators');
const {
  createBooking, listBookings, getBooking, updateBookingStatus, cancelBooking, confirmCompletion, assignProvider,
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/', authenticateUser, authorizeRoles(ROLES.CUSTOMER), bookingValidator, validate, createBooking);
router.get('/', authenticateUser, pagination, validate, listBookings);
router.get('/:id', authenticateUser, idParam(), validate, getBooking);
router.put('/:id/status', authenticateUser, idParam(), validate, updateBookingStatus);
router.post('/:id/cancel', authenticateUser, idParam(), validate, cancelBooking);
router.post('/:id/confirm-completion', authenticateUser, authorizeRoles(ROLES.CUSTOMER), idParam(), validate, confirmCompletion);
router.post('/:id/assign', authenticateUser, authorizeRoles(ROLES.OPERATIONS_MANAGER, ROLES.PLATFORM_ADMIN), idParam(), validate, assignProvider);

module.exports = router;