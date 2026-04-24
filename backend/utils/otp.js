const OTP = require('../models/OTP');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const createAndSendOtp = async ({ phone, purpose = 'register', userType = 'user' }) => {
  const otp       = generateOTP();
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60000);

  await OTP.deleteMany({ phone, purpose });
  await OTP.create({ phone, otp, purpose, userType, expiresAt });

  // DEV: OTP terminal mein print hoga — Twilio ki zaroorat nahi testing ke liye
  console.log('\n╔══════════════════════════════╗');
  console.log(`║  📱 OTP: ${otp}  (${phone})  ║`);
  console.log('╚══════════════════════════════╝\n');

  return { success: true, message: `OTP bheja gaya ${phone} par (dev mode: terminal dekho)` };
};

const verifyOtp = async ({ phone, otp, purpose }) => {
  const record = await OTP.findOne({ phone, purpose, verified: false });
  if (!record)
    return { success: false, message: 'OTP nahi mila. Dobara request karo.' };
  if (record.attempts >= 5) {
    await OTP.deleteOne({ _id: record._id });
    return { success: false, message: '5 galat attempts. Naya OTP mangao.' };
  }
  if (new Date() > record.expiresAt) {
    await OTP.deleteOne({ _id: record._id });
    return { success: false, message: 'OTP expire ho gaya. Naya OTP mangao.' };
  }
  if (record.otp !== otp) {
    await OTP.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return { success: false, message: `Galat OTP. ${4 - record.attempts} attempts bache.` };
  }
  await OTP.updateOne({ _id: record._id }, { verified: true });
  return { success: true, message: 'OTP verify ho gaya!' };
};

module.exports = { createAndSendOtp, verifyOtp };
