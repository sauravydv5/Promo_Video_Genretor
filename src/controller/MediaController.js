const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");
const path = require("path");

const insertImageIntoTemplate = async (
  uploadPath,
  templatePath,
  outputPath
) => {
  await sharp(templatePath)
    .composite([{ input: uploadPath, top: 300, left: 150 }]) // example placement
    .toFile(outputPath);
};

const createFinalVideo = async (mediaPaths, audioPath, outputVideoPath) => {
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg();

    mediaPaths.forEach((p) => ffmpegCommand.input(p));

    ffmpegCommand
      .input(audioPath)
      .complexFilter([
        "[0:v]fade=t=in:st=0:d=1[v0]; " +
          "[1:v]fade=t=in:st=1:d=1[v1]; " +
          "[2:v]fade=t=in:st=2:d=1[v2]; " +
          "[3:v]fade=t=in:st=3:d=1[v3]; " +
          "[v0][v1][v2][v3]concat=n=4:v=1:a=0[outv]",
      ])
      .outputOptions("-map", "[outv]")
      .output(outputVideoPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
};
const mediaController = {
  insertImageIntoTemplate,
  createFinalVideo,
};

module.exports = mediaController;
