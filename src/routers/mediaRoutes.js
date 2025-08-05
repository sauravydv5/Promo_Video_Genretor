// routes/mediaRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const mediaController = require("../controller/MediaController");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), async (req, res) => {
  const { path: uploadedImage } = req.file;

  const finalTemplate = "processed/template_output.jpg";
  await mediaController.insertImageIntoTemplate(
    uploadedImage,
    "assets/template.jpg",
    finalTemplate
  );

  res.json({ message: "Image inserted into template", path: finalTemplate });
});

router.post("/generate-video", async (req, res) => {
  const mediaList = [
    "processed/template_output.jpg",
    "assets/Freestyle.jpg",
    "assets/Battery.jpg",
    "assets/4K.jpg",
    "assets/Display.jpg",
    "assets/closing_1.mp4",
  ];
  const audio = "assets/audio 1.mp3";
  const finalOutput = "output/final_video.mp4";

  await mediaController.createFinalVideo(mediaList, audio, finalOutput);
  res.json({ message: "Final video created", video: finalOutput });
});

module.exports = router; // ✅ FIXED
