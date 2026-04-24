const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET','POST'], credentials: true },
});
app.set('io', io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/blood',     require('./routes/blood'));
app.use('/api/donors',    require('./routes/donors'));
app.use('/api/requests',  require('./routes/requests'));
app.use('/api/otp',       require('./routes/otp'));

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: '🩸 Bharat Blood Tracker chal raha hai!', time: new Date() })
);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('join:city',     (city) => socket.join(city));
  socket.on('join:hospital', (id)   => socket.join(`hospital:${id}`));
  socket.on('disconnect',    ()     => console.log(`❌ Disconnected: ${socket.id}`));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas se connect ho gaya!');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server chal raha hai: http://localhost:${process.env.PORT || 5000}`);
      console.log(`🌐 Health: http://localhost:${process.env.PORT || 5000}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});
