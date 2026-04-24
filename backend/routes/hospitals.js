const r = require('express').Router();
const { getAllHospitals,getNearestHospitals,getHospital,updateInventory } = require('../controllers/hospitalController');
const { protect, hospitalOnly } = require('../middleware/auth');
r.get('/',          getAllHospitals);
r.get('/nearest',   getNearestHospitals);
r.get('/:id',       getHospital);
r.put('/inventory', protect, hospitalOnly, updateInventory);
module.exports = r;
