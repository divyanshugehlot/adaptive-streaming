"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideoForHLS = void 0;
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const movie_repository_1 = require("../repositories/movie.repository");
const resolutions = [
    { width: 1920, height: 1080, bitRate: 5000 }, // 1080p
    { width: 1280, height: 720, bitRate: 2500 }, // 720p
    { width: 854, height: 480, bitRate: 1000 }, // 480p
    { width: 426, height: 240, bitRate: 500 }, // 240p
];
/**
 * Processes a video file for HTTP Live Streaming (HLS)
 */
const processVideoForHLS = (inputPath, outputPath, callback) => {
    fs_1.default.mkdirSync(outputPath, { recursive: true }); // Create the output directory
    const masterPlaylist = `${outputPath}/master.m3u8`; // Path to the master playlist file
    const masterContent = [];
    let countProcessing = 0;
    resolutions.forEach((resolution) => {
        console.log(`Processing video for resolution: ${resolution.width}x${resolution.height}`);
        const variantOutput = `${outputPath}/${resolution.height}p`;
        const variantPlaylist = `${variantOutput}/playlist.m3u8`; // Path to the variant playlist file
        (0, movie_repository_1.createMovie)(outputPath);
        fs_1.default.mkdirSync(variantOutput, { recursive: true }); // Create the variant directory
        (0, fluent_ffmpeg_1.default)(inputPath)
            .outputOptions([
            `-vf scale=w=${resolution.width}:h=${resolution.height}`,
            `-b:v ${resolution.bitRate}k`,
            '-codec:v libx264',
            '-codec:a aac',
            '-hls_time 10',
            '-hls_playlist_type vod',
            `-hls_segment_filename ${variantOutput}/segment%03d.ts`
        ])
            .output(variantPlaylist) // Output to the variant playlist file
            .on('end', () => {
            // When the processing ends for a resolution, add the variant playlist to the master playlist
            masterContent.push(`#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitRate * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n${resolution.height}p/playlist.m3u8`);
            countProcessing += 1;
            if (countProcessing === resolutions.length) {
                console.log('Processing complete');
                console.log(masterContent);
                // When the processing ends for all resolutions, create the master playlist
                fs_1.default.writeFileSync(masterPlaylist, `#EXTM3U\n${masterContent.join('\n')}`);
                // place where video processing ends;
                (0, movie_repository_1.updateMovieStatus)(outputPath, "COMPLETE");
                callback(null, masterPlaylist); // Call the callback with the master playlist path
            }
        })
            .on('error', (error) => {
            console.log('An error occurred:', error);
            callback(error); // Call the callback with the error
        })
            .run();
    });
};
exports.processVideoForHLS = processVideoForHLS;
