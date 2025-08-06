const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

createFinalVideo = async (mediaList, audioPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const inputTxtPath = `src/output/input_${Date.now()}.txt`;

    const inputListContent = mediaList
      .map((file) =>
        file.endsWith(".mp4") ? `file '${file}'` : `file '${file}'\nduration 2`
      )
      .join("\n");

    fs.writeFileSync(inputTxtPath, inputListContent);

    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i ${inputTxtPath} -i ${audioPath} -shortest -c:v libx264 -c:a aac -strict experimental ${outputPath}`;

    exec(ffmpegCmd, (err, stdout, stderr) => {
      fs.unlinkSync(inputTxtPath); // cleanup

      if (err) {
        console.error("FFmpeg Error:", stderr);
        return reject(new Error("FFmpeg video generation failed"));
      }

      resolve();
    });
  });
};

module.exports = createFinalVideo;
