const Hospital = require('../models/Hospital');

const getAllHospitals = async (req, res) => {
  try {
    const { city='Lucknow', blood } = req.query;
    let query = { city, isVerified:true };
    if (blood && blood!=='all') query['inventory'] = { $elemMatch:{ bloodGroup:blood, units:{ $gt:0 } } };
    const hospitals = await Hospital.find(query).select('-password');
    res.json({ success:true, count:hospitals.length, data:hospitals });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const getNearestHospitals = async (req, res) => {
  try {
    const { lat, lng, blood, maxDistance=20000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success:false, message:'lat aur lng chahiye.' });
    let matchStage = { isVerified:true };
    if (blood && blood!=='all') matchStage['inventory'] = { $elemMatch:{ bloodGroup:blood, units:{ $gt:0 } } };
    const hospitals = await Hospital.aggregate([
      { $geoNear:{ near:{ type:'Point', coordinates:[parseFloat(lng), parseFloat(lat)] },
          distanceField:'distance', maxDistance:parseInt(maxDistance), spherical:true, query:matchStage } },
      { $limit:10 }, { $project:{ password:0 } },
    ]);
    res.json({ success:true, count:hospitals.length, data:hospitals });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const getHospital = async (req, res) => {
  try {
    const h = await Hospital.findById(req.params.id).select('-password');
    if (!h) return res.status(404).json({ success:false, message:'Hospital nahi mila.' });
    res.json({ success:true, data:h });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const updateInventory = async (req, res) => {
  try {
    const { inventory } = req.body;
    const hospital = req.hospital;
    if (!Array.isArray(inventory))
      return res.status(400).json({ success:false, message:'inventory array chahiye.' });
    inventory.forEach(({ bloodGroup, units }) => {
      const item = hospital.inventory.find(i => i.bloodGroup===bloodGroup);
      if (item) { item.units = Math.max(0, units); item.updatedAt = new Date(); }
    });
    await hospital.save();
    const io = req.app.get('io');
    io.to(hospital.city).emit('inventory:updated', {
      hospitalId:hospital._id, hospitalName:hospital.name,
      inventory:hospital.inventory, timestamp:new Date() });
    const criticals = hospital.inventory.filter(i => i.units < 5);
    if (criticals.length)
      io.to(hospital.city).emit('inventory:critical', {
        hospitalName:hospital.name,
        criticalGroups:criticals.map(c => ({ bloodGroup:c.bloodGroup, units:c.units })) });
    res.json({ success:true, message:'Inventory live update ho gaya!', data:hospital.inventory });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

module.exports = { getAllHospitals, getNearestHospitals, getHospital, updateInventory };
