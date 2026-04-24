const BloodRequest = require('../models/BloodRequest');

const getRequests = async (req, res) => {
  try {
    const { city='Lucknow', blood, urgency } = req.query;
    let query = { status:'open', city };
    if (blood && blood!=='all') query.bloodGroup = blood;
    if (urgency) query.urgency = urgency;
    const requests = await BloodRequest.find(query).sort({ createdAt:-1 }).limit(50);
    res.json({ success:true, count:requests.length, data:requests });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const createRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, units, hospital, area, contactPhone, urgency, notes, lat, lng } = req.body;
    const request = await BloodRequest.create({
      patientName, bloodGroup, units, hospital, area, contactPhone, urgency, notes,
      city: req.user?.city || req.hospital?.city || 'Lucknow',
      postedBy: req.user?._id || req.hospital?._id,
      postedByModel: req.userType==='hospital' ? 'Hospital' : 'User',
      ...(lat && lng ? { location:{ type:'Point', coordinates:[parseFloat(lng), parseFloat(lat)] } } : {}),
    });
    req.app.get('io').to(request.city).emit('request:new', {
      id:request._id, patientName:request.patientName, bloodGroup:request.bloodGroup,
      units:request.units, hospital:request.hospital, urgency:request.urgency });
    res.status(201).json({ success:true, message:'Request post ho gayi! Donors ko alert bheja ja raha hai.', data:request });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const respondToRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success:false, message:'Request nahi mili.' });
    if (request.status!=='open') return res.status(400).json({ success:false, message:'Ye request close ho gayi.' });
    if (!request.respondedBy.includes(req.user._id)) {
      request.respondedBy.push(req.user._id);
      await request.save();
    }
    req.app.get('io').to(request.city).emit('request:responded', { requestId:request._id, donorName:req.user.name });
    res.json({ success:true, message:'Response de diya! Patient tumse contact karega.' });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const fulfillRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id, { status:'fulfilled', fulfilledAt:new Date() }, { new:true });
    if (!request) return res.status(404).json({ success:false, message:'Request nahi mili.' });
    req.app.get('io').to(request.city).emit('request:fulfilled', { requestId:request._id, bloodGroup:request.bloodGroup });
    res.json({ success:true, message:'Request fulfilled mark ho gayi!', data:request });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const getMyRequests = async (req, res) => {
  try {
    const id = req.user?._id || req.hospital?._id;
    const requests = await BloodRequest.find({ postedBy:id }).sort({ createdAt:-1 });
    res.json({ success:true, data:requests });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

module.exports = { getRequests, createRequest, respondToRequest, fulfillRequest, getMyRequests };
