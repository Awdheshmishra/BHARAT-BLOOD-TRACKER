const r    = require('express').Router();
const User = require('../models/User');
const { protect, userOnly } = require('../middleware/auth');

r.get('/', async (req, res) => {
  try {
    const { blood, area, city='Lucknow' } = req.query;
    let query = { isDonor:true, city };
    if (blood && blood!=='all') query.bloodGroup = blood;
    if (area  && area!=='All Areas') query.area  = area;
    const donors = await User.find(query)
      .select('name bloodGroup area donorProfile.lastDonated donorProfile.available donorProfile.totalDonations')
      .limit(50);
    res.json({ success:true, count:donors.length, data:donors });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

r.get('/nearest', async (req, res) => {
  try {
    const { lat, lng, blood, maxDistance=15000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success:false, message:'lat aur lng chahiye.' });
    let matchStage = { isDonor:true, 'donorProfile.available':true };
    if (blood && blood!=='all') matchStage.bloodGroup = blood;
    const donors = await User.aggregate([
      { $geoNear:{ near:{ type:'Point', coordinates:[parseFloat(lng),parseFloat(lat)] },
          distanceField:'distance', maxDistance:parseInt(maxDistance), spherical:true, query:matchStage }},
      { $limit:20 },
      { $project:{ name:1, bloodGroup:1, area:1, distance:1,
          'donorProfile.lastDonated':1, 'donorProfile.totalDonations':1 }},
    ]);
    res.json({ success:true, count:donors.length, data:donors });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

r.post('/register', protect, userOnly, async (req, res) => {
  try {
    const { weight, lastDonated } = req.body;
    req.user.isDonor = true;
    req.user.donorProfile = { weight, lastDonated: lastDonated ? new Date(lastDonated) : undefined, available:true };
    await req.user.save();
    res.json({ success:true, message:`${req.user.bloodGroup} donor register ho gaya!` });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

r.put('/availability', protect, userOnly, async (req, res) => {
  try {
    req.user.donorProfile.available = req.body.available;
    await req.user.save();
    res.json({ success:true, message:'Availability update ho gayi.' });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = r;
