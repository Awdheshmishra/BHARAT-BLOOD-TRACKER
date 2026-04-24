const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone:     { type: String, required: true },
  otp:       { type: String, required: true },
  purpose:   { type: String, enum: ['register','login','reset'], default: 'register' },
  userType:  { type: String, enum: ['user','hospital'], default: 'user' },
  verified:  { type: Boolean, default: false },
  attempts:  { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
