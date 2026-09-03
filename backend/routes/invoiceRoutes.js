const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { idParam } = require('../validators/resourceValidators');
const { getInvoice, getInvoiceByBooking, createInvoice } = require('../controllers/invoiceController');

const router = express.Router();

router.post('/', authenticateUser, validate, createInvoice);
router.get('/booking/:bookingId', authenticateUser, idParam('bookingId'), validate, getInvoiceByBooking);
router.get('/:id', authenticateUser, idParam(), validate, getInvoice);

module.exports = router;