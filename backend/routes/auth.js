const r = require('express').Router();
const { registerUser,loginUser,registerHospital,loginHospital,getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
r.post('/user/register',     registerUser);
r.post('/user/login',        loginUser);
r.post('/hospital/register', registerHospital);
r.post('/hospital/login',    loginHospital);
r.get('/me',                 protect, getMe);
module.exports = r;
