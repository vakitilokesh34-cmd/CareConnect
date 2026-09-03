const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { jobUpdateValidator, idParam } = require('../validators/resourceValidators');
const { addJobUpdate, listJobUpdates } = require('../controllers/jobController');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.post(
  '/:bookingId/updates',
  authenticateUser,
  idParam('bookingId'),
  upload.array('files', 8),
  jobUpdateValidator,
  validate,
  addJobUpdate
);
router.get('/:bookingId/updates', authenticateUser, idParam('bookingId'), validate, listJobUpdates);
router.post(
  '/:bookingId/evidence',
  authenticateUser,
  idParam('bookingId'),
  upload.array('images', 8),
  addJobUpdate
);

module.exports = router;