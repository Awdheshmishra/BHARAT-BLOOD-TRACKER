const r = require('express').Router();
const { createAndSendOtp, verifyOtp } = require('../utils/otp');

r.post('/send', async (req, res) => {
  try {
    const { phone, purpose='register', userType='user' } = req.body;
    if (!phone) return res.status(400).json({ success:false, message:'Phone number chahiye.' });
    const cleaned = phone.replace(/\D/g,'').slice(-10);
    if (cleaned.length !== 10)
      return res.status(400).json({ success:false, message:'Valid 10-digit Indian mobile number daalo.' });
    const result = await createAndSendOtp({ phone:`+91${cleaned}`, purpose, userType });
    res.json(result);
  } catch (err) { res.status(500).json({ success:false, message:'OTP bhejne mein error. Try again.' }); }
});

r.post('/verify', async (req, res) => {
  try {
    const { phone, otp, purpose='register' } = req.body;
    if (!phone || !otp) return res.status(400).json({ success:false, message:'Phone aur OTP chahiye.' });
    const cleaned = phone.replace(/\D/g,'').slice(-10);
    const result  = await verifyOtp({ phone:`+91${cleaned}`, otp, purpose });
    res.json(result);
  } catch (err) { res.status(500).json({ success:false, message:'OTP verify nahi hua.' }); }
});

module.exports = r;
