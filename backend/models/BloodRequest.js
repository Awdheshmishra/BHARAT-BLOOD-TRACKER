const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  postedBy:      { type: mongoose.Schema.Types.ObjectId, refPath: 'postedByModel', required: true },
  postedByModel: { type: String, enum: ['User','Hospital'], required: true },
  patientName:   { type: String, required: true },
  bloodGroup:    { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'], required: true },
  units:         { type: Number, required: true, min: 1, max: 20 },
  hospital:      { type: String, required: true },
  area:          { type: String, required: true },
  city:          { type: String, default: 'Lucknow' },
  contactPhone:  { type: String, required: true },
  urgency:       { type: String, enum: ['critical','urgent','stable'], default: 'urgent' },
  notes:         String,
  status:        { type: String, enum: ['open','fulfilled','expired'], default: 'open' },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [80.9462, 26.8467] },
  },
  respondedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  fulfilledAt:  Date,
  expiresAt:    { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) },
}, { timestamps: true });

bloodRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
