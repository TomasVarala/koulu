const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CustomError = require('../utils/customError');

// Access token (15 min)
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
};

// Refresh token (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

// 🔥 UUSI: Register käyttäjä
exports.registerUser = async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  if (!name || !email || !password || !passwordConfirm) {
    throw new CustomError('Please provide all fields', 400);
  }

  if (password !== passwordConfirm) {
    throw new CustomError('Passwords do not match', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError('Email already registered', 400);
  }

  const user = new User({ name, email, password });
  await user.save();

  res.status(201).json({ message: 'User registered successfully' });
};

// 🔥 Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new CustomError('Invalid credentials', 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // muuta production: true
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json({ accessToken });
};

// 🔥 Logout
exports.logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie('refreshToken', { httpOnly: true });
  res.sendStatus(204);
};

// 🔥 Refresh access token
exports.refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken });
  if (!user) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err || decoded.id !== user._id.toString()) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
};
