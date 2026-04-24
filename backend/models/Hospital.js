const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  registrationNo: { type: String, required: true, unique: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  phone:          { type: String, required: true },
  password:       { type: String, required: true, select: false },
  address:        { type: String, required: true },
  area:           { type: String, required: true },
  city:           { type: String, default: 'Lucknow' },
  pincode:        String,
  isVerified:     { type: Boolean, default: false },
  isApproved:     { type: Boolean, default: false },
  inventory: {
    type: [{
      bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
      units:      { type: Number, default: 0, min: 0 },
      updatedAt:  { type: Date, default: Date.now },
    }],
    default: () => [
      { bloodGroup:'A+',  units:0 }, { bloodGroup:'A-',  units:0 },
      { bloodGroup:'B+',  units:0 }, { bloodGroup:'B-',  units:0 },
      { bloodGroup:'O+',  units:0 }, { bloodGroup:'O-',  units:0 },
      { bloodGroup:'AB+', units:0 }, { bloodGroup:'AB-', units:0 },
    ],
  },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [80.9462, 26.8467] },
  },
}, { timestamps: true });

hospitalSchema.index({ location: '2dsphere' });

hospitalSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

hospitalSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Hospital', hospitalSchema);
