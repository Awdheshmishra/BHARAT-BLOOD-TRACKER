require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Hospital = require('../models/Hospital');

const HOSPITALS = [
  {
    name: 'SGPGI — Sanjay Gandhi PGI',       registrationNo: 'UP-SGPGI-001',
    email: 'bloodbank@sgpgi.ac.in',           phone: '+910522266870',
    address: 'Raebareli Road, Lucknow',       area: 'Raebareli Road',  pincode: '226014',
    isVerified: true, isApproved: true,
    location: { type: 'Point', coordinates: [80.9978, 26.7925] },
    inventory: [
      {bloodGroup:'A+',units:24},{bloodGroup:'A-',units:6},
      {bloodGroup:'B+',units:19},{bloodGroup:'B-',units:4},
      {bloodGroup:'O+',units:31},{bloodGroup:'O-',units:3},
      {bloodGroup:'AB+',units:8},{bloodGroup:'AB-',units:2},
    ],
  },
  {
    name: 'Ram Manohar Lohia Hospital',       registrationNo: 'UP-RML-002',
    email: 'blood@rmlh.gov.in',               phone: '+910522223597',
    address: 'Vibhuti Khand, Gomti Nagar',    area: 'Gomti Nagar',     pincode: '226010',
    isVerified: true, isApproved: true,
    location: { type: 'Point', coordinates: [80.9720, 26.8516] },
    inventory: [
      {bloodGroup:'A+',units:14},{bloodGroup:'A-',units:2},
      {bloodGroup:'B+',units:22},{bloodGroup:'B-',units:7},
      {bloodGroup:'O+',units:18},{bloodGroup:'O-',units:5},
      {bloodGroup:'AB+',units:3},{bloodGroup:'AB-',units:1},
    ],
  },
  {
    name: 'Lohia Institute of Medical Sciences', registrationNo: 'UP-LIMS-003',
    email: 'bloodbank@lims.ac.in',               phone: '+910522225754',
    address: 'Nirala Nagar, Lucknow',            area: 'Nirala Nagar',  pincode: '226020',
    isVerified: true, isApproved: true,
    location: { type: 'Point', coordinates: [80.9558, 26.8701] },
    inventory: [
      {bloodGroup:'A+',units:9},{bloodGroup:'A-',units:1},
      {bloodGroup:'B+',units:16},{bloodGroup:'B-',units:3},
      {bloodGroup:'O+',units:12},{bloodGroup:'O-',units:0},
      {bloodGroup:'AB+',units:5},{bloodGroup:'AB-',units:0},
    ],
  },
  {
    name: 'Balrampur Government Hospital',    registrationNo: 'UP-BGH-004',
    email: 'bloodbank@balrampur.gov.in',      phone: '+910522261510',
    address: 'Golaganj, Charbagh',            area: 'Charbagh',        pincode: '226001',
    isVerified: true, isApproved: true,
    location: { type: 'Point', coordinates: [80.9289, 26.8393] },
    inventory: [
      {bloodGroup:'A+',units:18},{bloodGroup:'A-',units:4},
      {bloodGroup:'B+',units:11},{bloodGroup:'B-',units:2},
      {bloodGroup:'O+',units:25},{bloodGroup:'O-',units:4},
      {bloodGroup:'AB+',units:6},{bloodGroup:'AB-',units:1},
    ],
  },
  {
    name: 'Civil Hospital Lucknow',           registrationNo: 'UP-CIVIL-005',
    email: 'bloodbank@civil.lko.gov.in',      phone: '+910522261811',
    address: 'Aminabad Road, Lucknow',        area: 'Aminabad',        pincode: '226018',
    isVerified: true, isApproved: true,
    location: { type: 'Point', coordinates: [80.9401, 26.8467] },
    inventory: [
      {bloodGroup:'A+',units:7},{bloodGroup:'A-',units:2},
      {bloodGroup:'B+',units:13},{bloodGroup:'B-',units:1},
      {bloodGroup:'O+',units:20},{bloodGroup:'O-',units:2},
      {bloodGroup:'AB+',units:4},{bloodGroup:'AB-',units:1},
    ],
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB se connect ho gaya!');

    await Hospital.deleteMany({});
    console.log('🗑️  Purane hospitals delete kiye');

    const pass = await bcrypt.hash('Hospital@123', 12);
    await Hospital.insertMany(HOSPITALS.map(h => ({ ...h, password: pass })));

    console.log('\n✅ 5 Lucknow hospitals seed ho gaye!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Sabhi hospitals ka password: Hospital@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 SGPGI:      bloodbank@sgpgi.ac.in');
    console.log('📧 RML:        blood@rmlh.gov.in');
    console.log('📧 LIMS:       bloodbank@lims.ac.in');
    console.log('📧 Balrampur:  bloodbank@balrampur.gov.in');
    console.log('📧 Civil:      bloodbank@civil.lko.gov.in');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
})();
