const { isValidObjectId } = require('mongoose');

const isValidMongoId = (id) => isValidObjectId(id);

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const generateInvoiceNumber = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CC-${y}${m}-${rand}`;
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const normalizePhone = (phone) => phone.replace(/[^\d+]/g, '');

const round2 = (n) => Math.round(n * 100) / 100;

const toPublicUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

const paginateMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
});

module.exports = {
  isValidMongoId,
  slugify,
  generateInvoiceNumber,
  generateOTP,
  normalizePhone,
  round2,
  toPublicUser,
  paginateMeta,
};