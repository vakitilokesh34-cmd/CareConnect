const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/providers', require('./providerRoutes'));
router.use('/requests', require('./requestRoutes'));
router.use('/ai', require('./aiRoutes'));
router.use('/quotes', require('./quoteRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/jobs', require('./jobRoutes'));
router.use('/invoices', require('./invoiceRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/disputes', require('./disputeRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/notifications', require('./notificationRoutes'));

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'CareConnect API is healthy', uptime: process.uptime() });
});

module.exports = router;