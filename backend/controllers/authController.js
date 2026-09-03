const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwt');
const { toPublicUser } = require('../utils/helpers');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'CUSTOMER' } = req.body;

  const [emailTaken, phoneTaken] = await Promise.all([
    User.isEmailTaken(email),
    User.isPhoneTaken(phone),
  ]);
  if (emailTaken) throw ApiError.conflict('An account with this email already exists');
  if (phoneTaken) throw ApiError.conflict('An account with this phone number already exists');

  const user = await User.create({ name, email, password, phone, role });
  const token = generateToken(user);

  if (role === 'SERVICE_PROVIDER') {
    await ProviderProfile.create({
      user: user._id,
      businessName: `${name}'s Services`,
    });
  }

  res.status(201).json(
    ApiResponse.created('Registration successful', {
      token,
      user: toPublicUser(user),
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }

  const token = generateToken(user);
  res.json(ApiResponse.ok('Login successful', { token, user: toPublicUser(user) }));
});

const getProfile = asyncHandler(async (req, res) => {
  let provider = null;
  if (req.user.role === 'SERVICE_PROVIDER') {
    provider = await ProviderProfile.findOne({ user: req.user._id }).populate('serviceCategories');
    if (provider) {
      const doc = provider.toObject();
      delete doc.__v;
      provider = doc;
    }
  }
  res.json(ApiResponse.ok('Profile retrieved', { user: toPublicUser(req.user), provider }));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profileImage, addresses } = req.body;

  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (profileImage !== undefined) req.user.profileImage = profileImage;
  if (addresses !== undefined) req.user.addresses = addresses;

  await req.user.save();
  res.json(ApiResponse.ok('Profile updated', { user: toPublicUser(req.user) }));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw ApiError.notFound('User');

  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  await user.save();
  res.json(ApiResponse.ok('Password changed successfully'));
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};