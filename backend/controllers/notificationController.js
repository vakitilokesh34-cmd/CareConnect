const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const listMine = asyncHandler(async (req, res) => {
  const { unreadOnly = 'false', page = 1, limit = 20 } = req.query;
  const filter = { user: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.json(ApiResponse.ok('Notifications retrieved', {
    notifications,
    unreadCount: unread,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }));
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw require('../utils/ApiError').notFound('Notification');
  res.json(ApiResponse.ok('Notification marked as read', { notification }));
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json(ApiResponse.ok('All notifications marked as read', { modified: result.modifiedCount }));
});

module.exports = { listMine, markRead, markAllRead };