const r = require('express').Router();
const { getRequests, createRequest, respondToRequest, fulfillRequest, getMyRequests } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
r.get('/',              getRequests);
r.post('/',             protect, createRequest);
r.get('/my',            protect, getMyRequests);
r.put('/:id/respond',  protect, respondToRequest);
r.put('/:id/fulfill',  protect, fulfillRequest);
module.exports = r;
