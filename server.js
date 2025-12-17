require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());

// app.use(cors({
//   origin: "https://mytodoapplicata.netlify.app",
//   credentials: true
// }));
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    // Don't log full file object as it might correspond to a buffer, just checking existence
    // console.log('File:', req.file ? 'Received file' : 'No file'); 
    next();
});

// Check Cloudinary Config on Startup
if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    console.error('❌ WARNING: Cloudinary Cloud Name is NOT set in .env file!');
    console.error('❌ Image uploads will FAIL.');
}


// Routes
app.use('/api/todos', todosRouter);
app.use('/api/auth', require('./routes/auth'));

// MongoDB Connection
// Note: Using 127.0.0.1 instead of localhost to avoid Node 17+ IPV6 issues
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mytodoapp';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




