const User     = require('../models/User');
const Hospital = require('../models/Hospital');
const { generateToken } = require('../middleware/auth');
const { verifyOtp }     = require('../utils/otp');

const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password, bloodGroup, area, otp } = req.body;
    if (!name || !phone || !password || !bloodGroup || !area)
      return res.status(400).json({ success:false, message:'Sabhi fields bharo.' });
    const cleaned   = '+91' + phone.replace(/\D/g,'').slice(-10);
    const otpResult = await verifyOtp({ phone: cleaned, otp, purpose:'register' });
    if (!otpResult.success) return res.status(400).json(otpResult);
    if (await User.findOne({ phone: cleaned }))
      return res.status(400).json({ success:false, message:'Ye number pehle se registered hai.' });
    const user  = await User.create({ name, phone:cleaned, email, password, bloodGroup, area, isVerified:true });
    const token = generateToken(user._id, 'user');
    res.status(201).json({ success:true, message:'Account ban gaya!', token,
      user:{ id:user._id, name:user.name, phone:user.phone, bloodGroup:user.bloodGroup, area:user.area }});
  } catch (err) {
    if (err.code===11000) return res.status(400).json({ success:false, message:'Phone ya email pehle se registered hai.' });
    res.status(500).json({ success:false, message:err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const cleaned = '+91' + phone.replace(/\D/g,'').slice(-10);
    const user    = await User.findOne({ phone:cleaned }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success:false, message:'Phone ya password galat hai.' });
    const token = generateToken(user._id, 'user');
    res.json({ success:true, token,
      user:{ id:user._id, name:user.name, phone:user.phone, bloodGroup:user.bloodGroup, area:user.area, isDonor:user.isDonor }});
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const registerHospital = async (req, res) => {
  try {
    const { name, registrationNo, email, phone, password, address, area, otp } = req.body;
    if (!name || !registrationNo || !email || !phone || !password || !address || !area)
      return res.status(400).json({ success:false, message:'Sabhi fields bharo.' });
    const cleaned   = '+91' + phone.replace(/\D/g,'').slice(-10);
    const otpResult = await verifyOtp({ phone:cleaned, otp, purpose:'register' });
    if (!otpResult.success) return res.status(400).json(otpResult);
    if (await Hospital.findOne({ $or:[{email},{registrationNo}] }))
      return res.status(400).json({ success:false, message:'Email ya registration number pehle se hai.' });
    const hospital = await Hospital.create({ name, registrationNo, email, phone:cleaned, password, address, area, isVerified:true });
    const token    = generateToken(hospital._id, 'hospital');
    res.status(201).json({ success:true, message:'Hospital account ban gaya!', token,
      hospital:{ id:hospital._id, name:hospital.name, area:hospital.area, inventory:hospital.inventory }});
  } catch (err) {
    if (err.code===11000) return res.status(400).json({ success:false, message:'Email ya registration number pehle se hai.' });
    res.status(500).json({ success:false, message:err.message });
  }
};

const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hospital = await Hospital.findOne({ email }).select('+password');
    if (!hospital || !(await hospital.matchPassword(password)))
      return res.status(401).json({ success:false, message:'Email ya password galat hai.' });
    const token = generateToken(hospital._id, 'hospital');
    res.json({ success:true, token,
      hospital:{ id:hospital._id, name:hospital.name, area:hospital.area, inventory:hospital.inventory, isApproved:hospital.isApproved }});
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const getMe = async (req, res) => {
  if (req.userType==='hospital') res.json({ success:true, userType:'hospital', data:req.hospital });
  else res.json({ success:true, userType:'user', data:req.user });
};

module.exports = { registerUser, loginUser, registerHospital, loginHospital, getMe };
