const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ensureDirectory = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Created directory: ${folderPath}`);
  }
};

const insertImageIntoTemplate = async (
  uploadPath,
  templatePath,
  outputPath
) => {
  try {
    const outputDir = path.dirname(outputPath);
    ensureDirectory(outputDir);

    const resizedImageBuffer = await sharp(uploadPath)
      .rotate()
      .resize({
        width: 300,
        height: 300,
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toBuffer();

    await sharp(templatePath)
      .composite([{ input: resizedImageBuffer, top: 320, left: 50 }])
      .toFile(outputPath);

    console.log(`✅ Image inserted into template: ${outputPath}`);
  } catch (err) {
    console.error("❌ insertImageIntoTemplate error:", err.message);
    throw err;
  }
};

// ✅ Active createFinalVideo function
const createFinalVideo = (mediaList, audioPath, finalOutputPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = "output";
    const tempVideoList = [];
    const durationPerImage = 2; // seconds

    ensureDirectory(outputDir);

    const imageList = mediaList.filter((f) => f.match(/\.(jpg|png|jpeg)$/i));
    const closingVideo = mediaList.find((f) => f.endsWith(".mp4"));

    // Step 1: Convert each image to short video with fade
    const convertImages = imageList.map((imgPath, index) => {
      return new Promise((res, rej) => {
        const tempVid = `${outputDir}/img_video_${index}.mp4`;
        ffmpeg()
          .input(imgPath)
          .loop(durationPerImage)
          .videoFilters([
            `fade=t=in:st=0:d=0.5`,
            `fade=t=out:st=${durationPerImage - 0.5}:d=0.5`,
            `scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2`,
          ])
          .outputOptions(["-pix_fmt", "yuv420p", "-t", `${durationPerImage}`])
          .videoCodec("libx264")
          .save(tempVid)
          .on("end", () => {
            tempVideoList.push(tempVid);
            res();
          })
          .on("error", rej);
      });
    });

    Promise.all(convertImages)
      .then(() => {
        const allVideos = [...tempVideoList];
        if (closingVideo) allVideos.push(closingVideo);

        const concatFile = `${outputDir}/concat_list.txt`;
        fs.writeFileSync(
          concatFile,
          allVideos
            .map((v) => `file '${path.resolve(v).replace(/\\/g, "/")}'`)
            .join("\n")
        );

        const intermediate = `${outputDir}/intermediate_${Date.now()}.mp4`;

        ffmpeg()
          .input(concatFile)
          .inputOptions(["-f", "concat", "-safe", "0"])
          .outputOptions(["-c", "copy"])
          .save(intermediate)
          .on("end", () => {
            ffmpeg()
              .input(intermediate)
              .input(audioPath)
              .outputOptions(["-c:v", "copy", "-c:a", "aac", "-shortest"])
              .save(finalOutputPath)
              .on("end", () => {
                tempVideoList.forEach(
                  (f) => fs.existsSync(f) && fs.unlinkSync(f)
                );
                fs.existsSync(intermediate) && fs.unlinkSync(intermediate);
                fs.existsSync(concatFile) && fs.unlinkSync(concatFile);
                console.log("✅ Final video created:", finalOutputPath);
                resolve();
              })
              .on("error", (err) => {
                console.error("❌ Audio merge error:", err.message);
                reject(err);
              });
          })
          .on("error", (err) => {
            console.error("❌ Concatenation error:", err.message);
            reject(err);
          });
      })
      .catch((err) => {
        console.error("❌ Image-to-video error:", err.message);
        reject(err);
      });
  });
};

// ✅ Export both functions
module.exports = {
  insertImageIntoTemplate,
  createFinalVideo,
};
