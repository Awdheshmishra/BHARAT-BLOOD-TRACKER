const r        = require('express').Router();
const Hospital = require('../models/Hospital');
const User     = require('../models/User');
const BR       = require('../models/BloodRequest');

r.get('/availability', async (req, res) => {
  try {
    const { city='Lucknow' } = req.query;
    const hospitals = await Hospital.find({ city, isVerified:true }).select('inventory');
    const totals = {'A+':0,'A-':0,'B+':0,'B-':0,'O+':0,'O-':0,'AB+':0,'AB-':0};
    hospitals.forEach(h => h.inventory.forEach(i => { totals[i.bloodGroup] += i.units; }));
    const data = Object.entries(totals).map(([bloodGroup, units]) => ({
      bloodGroup, units,
      status: units===0 ? 'out' : units<10 ? 'critical' : units<25 ? 'low' : 'available',
    }));
    res.json({ success:true, city, data, hospitalCount:hospitals.length });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

r.get('/summary', async (req, res) => {
  try {
    const { city='Lucknow' } = req.query;
    const hospitals = await Hospital.find({ city, isVerified:true }).select('inventory');
    const [donors, openRequests] = await Promise.all([
      User.countDocuments({ city, isDonor:true }),
      BR.countDocuments({ city, status:'open' }),
    ]);
    let totalUnits = 0;
    hospitals.forEach(h => h.inventory.forEach(i => { totalUnits += i.units; }));
    res.json({ success:true, data:{ hospitals:hospitals.length, donors, openRequests, totalUnits } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = r;
