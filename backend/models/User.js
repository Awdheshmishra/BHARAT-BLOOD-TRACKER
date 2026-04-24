const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  phone:      { type: String, required: true, unique: true },
  email:      { type: String, trim: true, lowercase: true },
  password:   { type: String, required: true, select: false },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'], required: true },
  area:       { type: String, required: true },
  city:       { type: String, default: 'Lucknow' },
  isVerified: { type: Boolean, default: false },
  isDonor:    { type: Boolean, default: false },
  donorProfile: {
    weight:         Number,
    lastDonated:    Date,
    totalDonations: { type: Number, default: 0 },
    available:      { type: Boolean, default: true },
  },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [80.9462, 26.8467] },
  },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
