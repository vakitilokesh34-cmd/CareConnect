const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { listMine, markRead, markAllRead } = require('../controllers/notificationController');
const { idParam } = require('../validators/resourceValidators');

const router = express.Router();

router.use(authenticateUser);

router.get('/', validate, listMine);
router.put('/:id/read', idParam(), validate, markRead);
router.post('/read-all', markAllRead);

module.exports = router;