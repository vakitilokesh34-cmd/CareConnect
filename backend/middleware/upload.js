const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|heic/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ok) cb(null, true);
  else cb(new Error('Only images (jpg, png, gif, webp) and PDF documents are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: config.uploads.maxFileSize },
  fileFilter,
});

const uploadImages = upload.array('images', 10);
const uploadSingle = upload.single('file');

const staticUrl = (filename) => (filename ? `/uploads/${filename}` : '');

module.exports = { upload, uploadImages, uploadSingle, staticUrl, uploadDir };