const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

module.exports = { generateToken, verifyToken };