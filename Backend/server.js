const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./dbConfig/db');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const path = require('path');
const reservationRoutes = require('./routes/reservationRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve images

app.use('/api/auth', authRoutes);
app.use('/api', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users',authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//CI/CD Pipeline testing



