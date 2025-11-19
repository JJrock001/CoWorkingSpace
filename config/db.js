// config/db.js
const mongoose = require('mongoose');
MONGO_URI = mongodb+srv://jjmaleewong:Jjrock2004@vacq.smobqj7.mongodb.net/vacq?retryWrites=true&w=majority&appName=VacQ
const connectDB = async () => {
  const uri = process.env.MONGO_URI; 
  if (!uri) throw new Error('MONGODB_URI is not set');
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;  
