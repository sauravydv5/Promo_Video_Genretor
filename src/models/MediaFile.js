// models/MediaFile.js
const mongoose = require("mongoose");

const mediaFileSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
  type: { type: String, enum: ["image", "audio", "video"] },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MediaFile", mediaFileSchema);
