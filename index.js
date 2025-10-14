import fs from "fs";
import { execSync } from "child_process";
import fetch from "node-fetch";

export default async ({ req, res, log, error }) => {
  try {
    const { videoUrl, imageUrl } = JSON.parse(req.body);

    const videoPath = "/tmp/video.webm";
    const imagePath = "/tmp/image.png";
    const outputPath = "/tmp/output.mp4";

    // Download input files
    const videoBuffer = await fetch(videoUrl).then((r) => r.arrayBuffer());
    fs.writeFileSync(videoPath, Buffer.from(videoBuffer));

    const imageBuffer = await fetch(imageUrl).then((r) => r.arrayBuffer());
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));

    // Merge with FFmpeg
    const cmd = `ffmpeg -i ${videoPath} -i ${imagePath} -filter_complex "[1][0]overlay=0:0:format=auto" -pix_fmt yuv420p -c:v libx264 ${outputPath}`;
    execSync(cmd, { stdio: "inherit" });

    // Return base64 of output (or later upload to Appwrite Storage)
    const mergedBuffer = fs.readFileSync(outputPath);
    const base64Video = mergedBuffer.toString("base64");

    return res.json({
      success: true,
      message: "Video merged successfully",
      video: base64Video,
    });
  } catch (err) {
    error(err);
    return res.json({ success: false, message: err.message });
  }
};
