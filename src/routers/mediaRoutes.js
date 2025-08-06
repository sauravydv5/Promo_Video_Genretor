// routes/mediaRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const mediaController = require("../controller/MediaController");

// ✅ Multer config (saves files to uploads/)
const upload = multer({ dest: "uploads/" });

// ✅ Route 1: Upload image and insert into template
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const uploadedImage = req.file?.path;

    if (!uploadedImage) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    const finalTemplatePath = "processed/template_output.jpg";
    const templatePath = "assets/template.jpg";

    await mediaController.insertImageIntoTemplate(
      uploadedImage,
      templatePath,
      finalTemplatePath
    );

    res.json({
      message: "✅ Image inserted into template",
      path: finalTemplatePath,
    });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    res.status(500).json({ error: "Image processing failed" });
  }
});

router.post("/generate-video", async (req, res) => {
  try {
    const mediaList = [
      "processed/template_output.jpg",
      "assets/Freestyle.jpg",
      "assets/Battery.jpg",
      "assets/4K.jpg",
      "assets/Display.jpg",
      "assets/video.mp4",
    ];

    const audioPath = "assets/audio.mp3";
    const finalOutputPath = `output/final_video_${Date.now()}.mp4`;

    await mediaController.createFinalVideo(
      mediaList,
      audioPath,
      finalOutputPath
    );

    res.json({ message: "✅ Video created", video: finalOutputPath });
  } catch (err) {
    console.error("❌ Video generation error:", err.message);
    res.status(500).json({ error: "Video generation failed" });
  }
});

module.exports = router;
