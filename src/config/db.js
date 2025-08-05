const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config(); // ✅ Load environment variables from .env

const connectDB = () => {
  return mongoose.connect(process.env.MONGO_URI);
};

module.exports = connectDB;
