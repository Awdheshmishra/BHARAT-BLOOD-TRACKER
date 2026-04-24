const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const Hospital = require('../models/Hospital');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, message: 'Login karo pehle.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'hospital') {
      req.hospital = await Hospital.findById(decoded.id);
      req.userType = 'hospital';
    } else {
      req.user     = await User.findById(decoded.id);
      req.userType = 'user';
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid ya expire ho gaya.' });
  }
};

const hospitalOnly = (req, res, next) => {
  if (req.userType !== 'hospital')
    return res.status(403).json({ success: false, message: 'Sirf hospital account allowed.' });
  next();
};

const userOnly = (req, res, next) => {
  if (req.userType !== 'user')
    return res.status(403).json({ success: false, message: 'Sirf user account allowed.' });
  next();
};

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

module.exports = { protect, hospitalOnly, userOnly, generateToken };
