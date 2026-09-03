const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { registerValidator, loginValidator, updateProfileValidator } = require('../validators/authValidator');
const {
  register, login, getProfile, updateProfile, changePassword,
} = require('../controllers/authController');
const { upload, uploadSingle } = require('../middleware/upload');
const multer = require('multer');

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/profile', authenticateUser, getProfile);
router.get('/me', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfileValidator, validate, updateProfile);
router.post('/change-password', authenticateUser, changePassword);

router.post(
  '/upload',
  authenticateUser,
  (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) return next(err);
      if (err) return next(err);
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      const file = req.files && req.files[0];
      if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
      return res.json({ success: true, message: 'File uploaded', data: { url: `/uploads/${file.filename}` } });
    }
    res.json({ success: true, message: 'File uploaded', data: { url: `/uploads/${req.file.filename}` } });
  }
);

module.exports = router;