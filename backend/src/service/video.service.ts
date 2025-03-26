import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

interface Resolutions {
  width: number;
  height: number;
  bitRate: number;
}

const resolutions: Resolutions[] = [
  { width: 1920, height: 1080, bitRate: 5000 }, // 1080p
  { width: 1280, height: 720, bitRate: 2500 },  // 720p
  { width: 854, height: 480, bitRate: 1000 },   // 480p
  { width: 426, height: 240, bitRate: 500 },    // 240p
];

/**
 * Processes a video file for HTTP Live Streaming (HLS)
 */
export const processVideoForHLS = (
  inputPath: string,
  outputPath: string,
  callback: (error: Error | null, masterPlaylist?: string) => void
): void => {
  if (!fs.existsSync(inputPath)) {
    callback(new Error("❌ Input video file does not exist."));
    return;
  }

  fs.mkdirSync(outputPath, { recursive: true });

  const masterPlaylist = `${outputPath}/master.m3u8`;
  const masterContent: string[] = ["#EXTM3U"];
  let countProcessing = 0;

  resolutions.forEach((resolution) => {
    const variantOutput = path.join(outputPath, `${resolution.height}p`);
    const variantPlaylist = path.join(variantOutput, "playlist.m3u8");

    fs.mkdirSync(variantOutput, { recursive: true });

    console.log(`🔄 Processing ${resolution.width}x${resolution.height} at ${resolution.bitRate} kbps`);

    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=${resolution.width}:${resolution.height}`,
        `-b:v ${resolution.bitRate}k`,
        "-codec:v libx264",
        "-codec:a aac",
        "-preset veryfast",
        "-hls_time 10",
        "-hls_playlist_type vod",
        "-hls_flags independent_segments",
        `-hls_segment_filename ${variantOutput}/segment%03d.ts`,
      ])
      .output(variantPlaylist)
      .on("end", () => {
        console.log(`✅ Completed processing for ${resolution.height}p`);

        masterContent.push(
          `#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitRate * 1000},RESOLUTION=${resolution.width}x${resolution.height}`,
          `${resolution.height}p/playlist.m3u8`
        );

        countProcessing++;
        if (countProcessing === resolutions.length) {
          console.log("🎉 HLS PROCESSING COMPLETE");

          fs.writeFileSync(masterPlaylist, masterContent.join("\n"));
          callback(null, masterPlaylist);
        }
      })
      .on("error", (error) => {
        console.error("❌ Error in FFmpeg:", error);
        callback(error);
      })
      .run();
  });
};
