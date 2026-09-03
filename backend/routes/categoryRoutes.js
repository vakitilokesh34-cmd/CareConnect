const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { categoryValidator, idParam, pagination } = require('../validators/resourceValidators');
const {
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get('/', listCategories);
router.get('/:id', idParam(), validate, getCategory);

router.post(
  '/',
  authenticateUser,
  authorizeRoles(ROLES.PLATFORM_ADMIN),
  categoryValidator,
  validate,
  createCategory
);

router.put(
  '/:id',
  authenticateUser,
  authorizeRoles(ROLES.PLATFORM_ADMIN),
  idParam(),
  categoryValidator,
  validate,
  updateCategory
);

router.delete(
  '/:id',
  authenticateUser,
  authorizeRoles(ROLES.PLATFORM_ADMIN),
  idParam(),
  validate,
  deleteCategory
);

module.exports = router;