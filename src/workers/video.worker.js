// // // src/workers/video.worker.js
// // // importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/ffmpeg.min.js');
// // importScripts(
// //     'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js'
// // );


// // let ffmpeg = null;
// // let currentJobId = null;
// // let isCancelled = false;

// // const sendProgress = (stage, progress, data = {}) => {
// //     self.postMessage({
// //         type: 'PROGRESS',
// //         jobId: currentJobId,
// //         data: {
// //             stage,
// //             progress,
// //             ...data
// //         }
// //     });
// // };

// // const sendLog = (message) => {
// //     self.postMessage({
// //         type: 'LOG',
// //         jobId: currentJobId,
// //         data: { message }
// //     });
// // };

// // self.onmessage = async (e) => {
// //     const { type, jobId, data } = e.data;
// //     currentJobId = jobId;
// //     isCancelled = false;

// //     try {
// //         switch (type) {
// //             case 'INIT_FFMPEG':
// //                 await initFFmpeg();
// //                 self.postMessage({ type: 'FFMPEG_READY', jobId });
// //                 break;

// //             case 'GENERATE_SLIDES': {
// //                 const slides = await generateSlides(data);
// //                 self.postMessage({
// //                     type: 'SLIDES_GENERATED',
// //                     jobId,
// //                     data: { slides }
// //                 });
// //                 break;
// //             }

// //             case 'ENCODE_VIDEO': {
// //                 const videoResult = await encodeVideo(data);
// //                 self.postMessage({
// //                     type: 'VIDEO_ENCODED',
// //                     jobId,
// //                     data: videoResult
// //                 });
// //                 break;
// //             }

// //             case 'PROCESS_IMAGE': {
// //                 const processedImage = await processImage(data);
// //                 self.postMessage({
// //                     type: 'IMAGE_PROCESSED',
// //                     jobId,
// //                     data: { image: processedImage }
// //                 });
// //                 break;
// //             }

// //             case 'CANCEL': {
// //                 isCancelled = true;
// //                 if (ffmpeg) {
// //                     ffmpeg.terminate();
// //                     ffmpeg = null;
// //                 }
// //                 self.postMessage({ type: 'CANCELLED', jobId });
// //                 break;
// //             }

// //             default:
// //                 throw new Error(`Unknown message type: ${type}`);
// //         }
// //     } catch (error) {
// //         if (!isCancelled) {
// //             self.postMessage({
// //                 type: 'ERROR',
// //                 jobId,
// //                 data: {
// //                     error: error.message,
// //                     stack: error.stack
// //                 }
// //             });
// //         }
// //     }
// // };

// // async function initFFmpeg() {
// //     if (!ffmpeg) {
// //         sendLog('Initializing FFmpeg...');

// //         const { createFFmpeg } = FFmpeg;
// //         ffmpeg = createFFmpeg({
// //             log: true,
// //             progress: ({ ratio }) => {
// //                 sendProgress('encoding', Math.round(ratio * 100));
// //             }
// //         });

// //         await ffmpeg.load();
// //         sendLog('FFmpeg initialized successfully');
// //     }
// // }

// // async function generateSlides(data) {
// //     const { slides, controls } = data;
// //     const generatedSlides = [];

// //     sendLog(`Generating ${slides.length} slides...`);

// //     for (let i = 0; i < slides.length; i++) {
// //         if (isCancelled) break;

// //         const slide = slides[i];
// //         const progress = Math.round(((i + 1) / slides.length) * 100);

// //         sendProgress('generating_slides', progress, {
// //             currentSlide: i + 1,
// //             totalSlides: slides.length
// //         });

// //         try {
// //             const slideImage = await generateSlide(slide, controls, i);
// //             generatedSlides.push(slideImage);

// //             sendLog(`Generated slide ${i + 1}/${slides.length}`);
// //         } catch (error) {
// //             sendLog(`Error generating slide ${i + 1}: ${error.message}`);
// //             // Create error slide
// //             generatedSlides.push(await createErrorSlide(i, error.message));
// //         }
// //     }

// //     if (!isCancelled) {
// //         sendLog(`Successfully generated ${generatedSlides.length} slides`);
// //     }

// //     return generatedSlides;
// // }

// // async function generateSlide(slideData, controls, index) {
// //     const canvas = new OffscreenCanvas(1280, 720);
// //     const ctx = canvas.getContext('2d');

// //     // Background
// //     ctx.fillStyle = controls.backgroundColor || 'rgba(0, 0, 0, 0.4)';
// //     ctx.fillRect(0, 0, canvas.width, canvas.height);

// //     // Load image if available
// //     if (slideData.image) {
// //         try {
// //             const response = await fetch(slideData.image);
// //             const blob = await response.blob();
// //             const imageBitmap = await createImageBitmap(blob);

// //             ctx.save();
// //             ctx.filter = `blur(${Math.min(controls.blurAmount || 0, 10)}px) 
// //                     brightness(${controls.brightness || 100}%) 
// //                     contrast(${controls.contrast || 100}%)`;
// //             ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
// //             ctx.restore();
// //         } catch (error) {
// //             sendLog(`Could not load image for slide ${index + 1}`);
// //         }
// //     }

// //     // Draw text
// //     ctx.fillStyle = controls.textColor || '#ffffff';
// //     const fontSize = Math.min(controls.fontSize || 36, 42);
// //     ctx.font = `bold ${fontSize}px ${controls.fontFamily || 'Arial, sans-serif'}`;
// //     ctx.textAlign = 'center';
// //     ctx.textBaseline = 'middle';
// //     ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
// //     ctx.shadowBlur = 10;
// //     ctx.shadowOffsetX = 2;
// //     ctx.shadowOffsetY = 2;

// //     // Text wrapping
// //     const maxWidth = canvas.width * 0.8;
// //     const lineHeight = fontSize * 1.4;
// //     const words = slideData.text.split(' ');
// //     let line = '';
// //     const lines = [];

// //     for (const word of words) {
// //         const testLine = line + word + ' ';
// //         const metrics = ctx.measureText(testLine);

// //         if (metrics.width > maxWidth && line !== '') {
// //             lines.push(line.trim());
// //             line = word + ' ';
// //         } else {
// //             line = testLine;
// //         }
// //     }

// //     if (line.trim()) lines.push(line.trim());

// //     const totalHeight = lines.length * lineHeight;
// //     const startY = canvas.height / 2 - totalHeight / 2 + lineHeight / 2;

// //     lines.forEach((textLine, idx) => {
// //         ctx.fillText(textLine, canvas.width / 2, startY + idx * lineHeight);
// //     });

// //     // Convert to blob
// //     const blob = await canvas.convertToBlob({
// //         type: 'image/png',
// //         quality: 0.95
// //     });

// //     return {
// //         index,
// //         blob,
// //         duration: controls.slideDuration || 3,
// //         filename: `slide_${index}.png`
// //     };
// // }

// // async function createErrorSlide(index, errorMessage) {
// //     const canvas = new OffscreenCanvas(1280, 720);
// //     const ctx = canvas.getContext('2d');

// //     // Background
// //     ctx.fillStyle = '#1F2937';
// //     ctx.fillRect(0, 0, canvas.width, canvas.height);

// //     // Error text
// //     ctx.fillStyle = '#EF4444';
// //     ctx.font = 'bold 32px Arial';
// //     ctx.textAlign = 'center';
// //     ctx.textBaseline = 'middle';

// //     ctx.fillText(`Slide ${index + 1}`, canvas.width / 2, canvas.height / 2 - 40);
// //     ctx.fillText('Error', canvas.width / 2, canvas.height / 2);
// //     ctx.fillText(errorMessage.substring(0, 50), canvas.width / 2, canvas.height / 2 + 40);

// //     const blob = await canvas.convertToBlob({ type: 'image/png' });

// //     return {
// //         index,
// //         blob,
// //         duration: 3,
// //         filename: `slide_${index}.png`
// //     };
// // }

// // async function encodeVideo(data) {
// //     const { slides, audio, controls } = data;

// //     if (!ffmpeg) {
// //         await initFFmpeg();
// //     }

// //     sendLog('Starting video encoding...');

// //     // Write slides to FFmpeg filesystem
// //     for (const slide of slides) {
// //         if (isCancelled) break;

// //         const fileData = await slide.blob.arrayBuffer();
// //         await ffmpeg.writeFile(slide.filename, new Uint8Array(fileData));
// //     }

// //     if (isCancelled) return;

// //     // Write audio if available
// //     if (audio) {
// //         const audioData = await audio.arrayBuffer();
// //         await ffmpeg.writeFile('audio.mp3', new Uint8Array(audioData));
// //     }

// //     // Create concat file
// //     let concatContent = '';
// //     slides.forEach(slide => {
// //         concatContent += `file ${slide.filename}\n`;
// //         concatContent += `duration ${slide.duration}\n`;
// //     });

// //     await ffmpeg.writeFile('concat.txt', concatContent);

// //     // Build FFmpeg command
// //     const command = audio ? [
// //         '-f', 'concat',
// //         '-safe', '0',
// //         '-i', 'concat.txt',
// //         '-i', 'audio.mp3',
// //         '-filter_complex', '[0:v]scale=1280:720,fps=30[v];[v][1:a]concat=n=1:v=1:a=1[outv][outa]',
// //         '-map', '[outv]',
// //         '-map', '[outa]',
// //         '-c:v', 'libx264',
// //         '-preset', 'medium',
// //         '-crf', '23',
// //         '-c:a', 'aac',
// //         '-b:a', '128k',
// //         '-pix_fmt', 'yuv420p',
// //         '-movflags', '+faststart',
// //         'output.mp4'
// //     ] : [
// //         '-f', 'concat',
// //         '-safe', '0',
// //         '-i', 'concat.txt',
// //         '-vf', 'fps=30,scale=1280:720',
// //         '-c:v', 'libx264',
// //         '-preset', 'medium',
// //         '-crf', '23',
// //         '-pix_fmt', 'yuv420p',
// //         '-movflags', '+faststart',
// //         'output.mp4'
// //     ];

// //     // Execute FFmpeg command
// //     await ffmpeg.exec(command);

// //     if (isCancelled) return;

// //     // Read output
// //     const outputData = await ffmpeg.readFile('output.mp4');
// //     const videoBlob = new Blob([outputData.buffer], { type: 'video/mp4' });

// //     // Cleanup
// //     await cleanupFiles([
// //         'concat.txt',
// //         ...slides.map(s => s.filename),
// //         ...(audio ? ['audio.mp3'] : []),
// //         'output.mp4'
// //     ]);

// //     // Get video info
// //     const videoInfo = await getVideoInfo(videoBlob);

// //     sendLog('Video encoding completed successfully');

// //     return {
// //         videoBlob,
// //         videoInfo: {
// //             duration: videoInfo.duration.toFixed(1),
// //             size: (videoBlob.size / (1024 * 1024)).toFixed(2),
// //             resolution: `${videoInfo.width}x${videoInfo.height}`,
// //             format: 'MP4',
// //             codec: 'H.264/AAC'
// //         }
// //     };
// // }

// // async function processImage(data) {
// //     const { imageBlob, operations } = data;

// //     const canvas = new OffscreenCanvas(100, 100);
// //     const ctx = canvas.getContext('2d');

// //     const imageBitmap = await createImageBitmap(imageBlob);
// //     canvas.width = imageBitmap.width;
// //     canvas.height = imageBitmap.height;

// //     // Apply operations
// //     ctx.filter = operations.filter || 'none';
// //     ctx.drawImage(imageBitmap, 0, 0);

// //     // Convert back to blob
// //     return await canvas.convertToBlob({
// //         type: imageBlob.type || 'image/png',
// //         quality: 0.9
// //     });
// // }

// // async function cleanupFiles(filenames) {
// //     for (const filename of filenames) {
// //         try {
// //             await ffmpeg.deleteFile(filename);
// //         } catch (error) {
// //             // Ignore cleanup errors
// //         }
// //     }
// // }

// // async function getVideoInfo(videoBlob) {
// //     return new Promise((resolve, reject) => {
// //         const video = document.createElement('video');
// //         const url = URL.createObjectURL(videoBlob);

// //         video.onloadedmetadata = () => {
// //             const info = {
// //                 duration: video.duration,
// //                 width: video.videoWidth,
// //                 height: video.videoHeight
// //             };
// //             URL.revokeObjectURL(url);
// //             resolve(info);
// //         };

// //         video.onerror = () => {
// //             URL.revokeObjectURL(url);
// //             reject(new Error('Failed to load video metadata'));
// //         };

// //         video.src = url;
// //     });
// // }

// // // Note: This is a simplified example and may require additional error handling and optimizations for production use.


// // src/workers/video.worker.js - FIXED VERSION
// importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/ffmpeg.min.js');

// let ffmpeg = null;
// let currentJobId = null;
// let isCancelled = false;

// // Enhanced error reporting
// const sendError = (error, context = '') => {
//     const errorInfo = {
//         error: error?.message || 'Unknown error',
//         stack: error?.stack || new Error().stack,
//         context,
//         timestamp: Date.now()
//     };

//     self.postMessage({
//         type: 'ERROR',
//         jobId: currentJobId,
//         data: errorInfo
//     });
// };

// const sendProgress = (stage, progress, data = {}) => {
//     self.postMessage({
//         type: 'PROGRESS',
//         jobId: currentJobId,
//         data: {
//             stage,
//             progress,
//             ...data
//         }
//     });
// };

// const sendLog = (message) => {
//     self.postMessage({
//         type: 'LOG',
//         jobId: currentJobId,
//         data: { message }
//     });
// };

// self.onmessage = async (e) => {
//     const { type, jobId, data } = e.data;
//     currentJobId = jobId;
//     isCancelled = false;

//     try {
//         switch (type) {
//             case 'INIT_FFMPEG':
//                 await initFFmpeg();
//                 self.postMessage({ type: 'FFMPEG_READY', jobId });
//                 break;

//             case 'GENERATE_SLIDES': {
//                 const slides = await generateSlides(data);
//                 self.postMessage({
//                     type: 'SLIDES_GENERATED',
//                     jobId,
//                     data: { slides }
//                 });
//                 break;
//             }

//             case 'ENCODE_VIDEO': {
//                 const videoResult = await encodeVideo(data);
//                 self.postMessage({
//                     type: 'VIDEO_ENCODED',
//                     jobId,
//                     data: videoResult
//                 });
//                 break;
//             }

//             case 'PROCESS_IMAGE': {
//                 const processedImage = await processImage(data);
//                 self.postMessage({
//                     type: 'IMAGE_PROCESSED',
//                     jobId,
//                     data: { image: processedImage }
//                 });
//                 break;
//             }

//             case 'CANCEL':
//                 isCancelled = true;
//                 if (ffmpeg) {
//                     ffmpeg.terminate();
//                     ffmpeg = null;
//                 }
//                 self.postMessage({ type: 'CANCELLED', jobId });
//                 break;

//             default:
//                 sendError(new Error(`Unknown message type: ${type}`), 'onmessage');
//         }
//     } catch (error) {
//         if (!isCancelled) {
//             sendError(error, `onmessage handler for ${type}`);
//         }
//     }
// };

// async function initFFmpeg() {
//     try {
//         sendLog('Initializing FFmpeg...');

//         if (typeof FFmpeg === 'undefined') {
//             throw new Error('FFmpeg library not loaded');
//         }

//         const { createFFmpeg } = ffmpeg;

//         if (typeof createFFmpeg !== 'function') {
//             throw new Error('FFmpeg.createFFmpeg not found');
//         }

//         ffmpeg = createFFmpeg({
//             log: true,
//             progress: ({ ratio }) => {
//                 sendProgress('encoding', Math.round(ratio * 100));
//             }
//         });

//         if (!ffmpeg || typeof ffmpeg.load !== 'function') {
//             throw new Error('FFmpeg instance not created properly');
//         }

//         await ffmpeg.load();
//         sendLog('FFmpeg initialized successfully');
//     } catch (error) {
//         sendError(error, 'initFFmpeg');
//         throw error;
//     }
// }

// async function generateSlides(data) {
//     try {
//         const { slides, controls } = data;

//         if (!slides || !Array.isArray(slides)) {
//             throw new Error('Invalid slides data');
//         }

//         sendLog(`Generating ${slides.length} slides...`);

//         const generatedSlides = [];

//         for (let i = 0; i < slides.length; i++) {
//             if (isCancelled) break;

//             try {
//                 const slide = await generateSlide(slides[i], controls, i);
//                 generatedSlides.push(slide);

//                 sendProgress('generating_slides', Math.round(((i + 1) / slides.length) * 100), {
//                     currentSlide: i + 1,
//                     totalSlides: slides.length
//                 });

//             } catch (slideError) {
//                 sendError(slideError, `generateSlide ${i + 1}`);
//                 // Create fallback slide
//                 generatedSlides.push(await createErrorSlide(i, slideError.message));
//             }
//         }

//         if (!isCancelled) {
//             sendLog(`Successfully generated ${generatedSlides.length} slides`);
//         }

//         return generatedSlides;
//     } catch (error) {
//         sendError(error, 'generateSlides');
//         throw error;
//     }
// }

// async function generateSlide(slideData, controls, index) {
//     try {
//         const canvas = new OffscreenCanvas(1280, 720);
//         const ctx = canvas.getContext('2d');

//         if (!ctx) {
//             throw new Error('Could not get canvas context');
//         }

//         // Background
//         ctx.fillStyle = controls?.backgroundColor || 'rgba(0, 0, 0, 0.4)';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);

//         // Load image if available
//         if (slideData.image) {
//             try {
//                 const response = await fetch(slideData.image);
//                 if (!response.ok) {
//                     throw new Error(`Failed to fetch image: ${response.status}`);
//                 }
//                 const blob = await response.blob();
//                 const imageBitmap = await createImageBitmap(blob);

//                 ctx.save();
//                 const filter = `blur(${Math.min(controls?.blurAmount || 0, 10)}px) 
//                        brightness(${controls?.brightness || 100}%) 
//                        contrast(${controls?.contrast || 100}%)`;
//                 ctx.filter = filter;
//                 ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
//                 ctx.restore();
//             } catch (imageError) {
//                 sendLog(`Could not load image for slide ${index + 1}: ${imageError.message}`);
//             }
//         }

//         // Draw text
//         ctx.fillStyle = controls?.textColor || '#ffffff';
//         const fontSize = Math.min(controls?.fontSize || 36, 42);
//         ctx.font = `bold ${fontSize}px ${controls?.fontFamily || 'Arial, sans-serif'}`;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
//         ctx.shadowBlur = 10;
//         ctx.shadowOffsetX = 2;
//         ctx.shadowOffsetY = 2;

//         // Text wrapping
//         const maxWidth = canvas.width * 0.8;
//         const lineHeight = fontSize * 1.4;
//         const words = slideData.text?.split(' ') || ['No text'];
//         let line = '';
//         const lines = [];

//         for (const word of words) {
//             const testLine = line + word + ' ';
//             const metrics = ctx.measureText(testLine);

//             if (metrics.width > maxWidth && line !== '') {
//                 lines.push(line.trim());
//                 line = word + ' ';
//             } else {
//                 line = testLine;
//             }
//         }

//         if (line.trim()) lines.push(line.trim());

//         const totalHeight = lines.length * lineHeight;
//         const startY = canvas.height / 2 - totalHeight / 2 + lineHeight / 2;

//         lines.forEach((textLine, idx) => {
//             ctx.fillText(textLine, canvas.width / 2, startY + idx * lineHeight);
//         });

//         // Convert to blob
//         const blob = await canvas.convertToBlob({
//             type: 'image/png',
//             quality: 0.95
//         });

//         if (!blob) {
//             throw new Error('Failed to create image blob');
//         }

//         return {
//             index,
//             blob,
//             duration: controls?.slideDuration || 3,
//             filename: `slide_${index}.png`
//         };
//     } catch (error) {
//         sendError(error, `generateSlide ${index}`);
//         throw error;
//     }
// }

// async function createErrorSlide(index, errorMessage) {
//     try {
//         const canvas = new OffscreenCanvas(1280, 720);
//         const ctx = canvas.getContext('2d');

//         if (!ctx) {
//             throw new Error('Could not get canvas context for error slide');
//         }

//         // Background
//         ctx.fillStyle = '#1F2937';
//         ctx.fillRect(0, 0, canvas.width, canvas.height);

//         // Error text
//         ctx.fillStyle = '#EF4444';
//         ctx.font = 'bold 32px Arial';
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';

//         ctx.fillText(`Slide ${index + 1}`, canvas.width / 2, canvas.height / 2 - 40);
//         ctx.fillText('Error', canvas.width / 2, canvas.height / 2);
//         ctx.fillText(errorMessage.substring(0, 50), canvas.width / 2, canvas.height / 2 + 40);

//         const blob = await canvas.convertToBlob({ type: 'image/png' });

//         if (!blob) {
//             throw new Error('Failed to create error slide blob');
//         }

//         return {
//             index,
//             blob,
//             duration: 3,
//             filename: `slide_${index}.png`
//         };
//     } catch (error) {
//         // Last resort - return minimal data
//         return {
//             index,
//             blob: new Blob(),
//             duration: 3,
//             filename: `slide_${index}.png`,
//             isError: true
//         };
//     }
// }

// async function encodeVideo(data) {
//     try {
//         const { slides, audio, controls } = data;

//         if (!slides || !Array.isArray(slides) || slides.length === 0) {
//             throw new Error('No slides provided for encoding');
//         }

//         if (!ffmpeg) {
//             await initFFmpeg();
//         }

//         sendLog('Starting video encoding...');

//         // Write slides to FFmpeg filesystem
//         for (const slide of slides) {
//             if (isCancelled) break;

//             try {
//                 const fileData = await slide.blob.arrayBuffer();
//                 await ffmpeg.writeFile(slide.filename, new Uint8Array(fileData));
//                 sendLog(`Written: ${slide.filename}`);
//             } catch (writeError) {
//                 sendError(writeError, `writeFile ${slide.filename}`);
//                 throw writeError;
//             }
//         }

//         if (isCancelled) {
//             throw new DOMException('Encoding cancelled', 'AbortError');
//         }

//         // Write audio if available
//         if (audio) {
//             try {
//                 const audioData = await audio.arrayBuffer();
//                 await ffmpeg.writeFile('audio.mp3', new Uint8Array(audioData));
//                 sendLog('Audio file written');
//             } catch (audioError) {
//                 sendError(audioError, 'writeAudio');
//                 // Continue without audio
//                 sendLog('Warning: Could not write audio, continuing without it');
//             }
//         }

//         // Create concat file
//         let concatContent = '';
//         slides.forEach(slide => {
//             concatContent += `file ${slide.filename}\n`;
//             concatContent += `duration ${slide.duration}\n`;
//         });

//         await ffmpeg.writeFile('concat.txt', concatContent);
//         sendLog('Concat file created');

//         // Build FFmpeg command
//         const command = audio ? [
//             '-f', 'concat',
//             '-safe', '0',
//             '-i', 'concat.txt',
//             '-i', 'audio.mp3',
//             '-filter_complex', '[0:v]scale=1280:720,fps=30[v];[v][1:a]concat=n=1:v=1:a=1[outv][outa]',
//             '-map', '[outv]',
//             '-map', '[outa]',
//             '-c:v', 'libx264',
//             '-preset', 'medium',
//             '-crf', '23',
//             '-c:a', 'aac',
//             '-b:a', '128k',
//             '-pix_fmt', 'yuv420p',
//             '-movflags', '+faststart',
//             'output.mp4'
//         ] : [
//             '-f', 'concat',
//             '-safe', '0',
//             '-i', 'concat.txt',
//             '-vf', 'fps=30,scale=1280:720',
//             '-c:v', 'libx264',
//             '-preset', 'medium',
//             '-crf', '23',
//             '-pix_fmt', 'yuv420p',
//             '-movflags', '+faststart',
//             'output.mp4'
//         ];

//         // Execute FFmpeg command
//         sendLog('Executing FFmpeg command...');
//         await ffmpeg.exec(command);

//         if (isCancelled) {
//             throw new DOMException('Encoding cancelled', 'AbortError');
//         }

//         // Read output
//         sendLog('Reading output file...');
//         const outputData = await ffmpeg.readFile('output.mp4');

//         if (!outputData || outputData.byteLength === 0) {
//             throw new Error('Generated video file is empty');
//         }

//         const videoBlob = new Blob([outputData.buffer], { type: 'video/mp4' });

//         // Cleanup
//         await cleanupFiles([
//             'concat.txt',
//             ...slides.map(s => s.filename),
//             ...(audio ? ['audio.mp3'] : []),
//             'output.mp4'
//         ]);

//         // Get video info
//         const videoInfo = await getVideoInfo(videoBlob);

//         sendLog('Video encoding completed successfully');

//         return {
//             videoBlob,
//             videoInfo: {
//                 duration: videoInfo.duration.toFixed(1),
//                 size: (videoBlob.size / (1024 * 1024)).toFixed(2),
//                 resolution: `${videoInfo.width}x${videoInfo.height}`,
//                 format: 'MP4',
//                 codec: 'H.264/AAC'
//             }
//         };
//     } catch (error) {
//         sendError(error, 'encodeVideo');
//         throw error;
//     }
// }

// async function processImage(data) {
//     try {
//         const { imageBlob, operations } = data;

//         if (!imageBlob) {
//             throw new Error('No image blob provided');
//         }

//         const canvas = new OffscreenCanvas(100, 100);
//         const ctx = canvas.getContext('2d');

//         if (!ctx) {
//             throw new Error('Could not get canvas context');
//         }

//         const imageBitmap = await createImageBitmap(imageBlob);
//         canvas.width = imageBitmap.width;
//         canvas.height = imageBitmap.height;

//         // Apply operations
//         ctx.filter = operations?.filter || 'none';
//         ctx.drawImage(imageBitmap, 0, 0);

//         // Convert back to blob
//         return await canvas.convertToBlob({
//             type: imageBlob.type || 'image/png',
//             quality: 0.9
//         });
//     } catch (error) {
//         sendError(error, 'processImage');
//         throw error;
//     }
// }

// async function cleanupFiles(filenames) {
//     for (const filename of filenames) {
//         try {
//             await ffmpeg.deleteFile(filename);
//         } catch (error) {
//             // Ignore cleanup errors
//         }
//     }
// }

// async function getVideoInfo(videoBlob) {
//     return new Promise((resolve, reject) => {
//         const video = document.createElement('video');
//         const url = URL.createObjectURL(videoBlob);
//         let timeoutId;

//         const cleanup = () => {
//             if (timeoutId) clearTimeout(timeoutId);
//             URL.revokeObjectURL(url);
//             video.remove();
//         };

//         timeoutId = setTimeout(() => {
//             cleanup();
//             reject(new Error('Video metadata timeout'));
//         }, 10000);

//         video.onloadedmetadata = () => {
//             const info = {
//                 duration: video.duration,
//                 width: video.videoWidth,
//                 height: video.videoHeight
//             };
//             cleanup();
//             resolve(info);
//         };

//         video.onerror = () => {
//             cleanup();
//             reject(new Error('Failed to load video metadata'));
//         };

//         video.src = url;
//     });
// }

// // Global error handler for worker
// self.onerror = (event) => {
//     sendError({
//         message: event.message || 'Unknown worker error',
//         filename: event.filename,
//         lineno: event.lineno,
//         colno: event.colno
//     }, 'worker.onerror');
// };

// // Unhandled rejection handler
// self.addEventListener('unhandledrejection', (event) => {
//     sendError(event.reason || 'Unhandled promise rejection', 'unhandledrejection');
// });






///////////////////////////////////////

// src/workers/video.worker.js - COMPLETE WORKING VERSION

// Use classic worker with importScripts
// importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/ffmpeg.min.js');

// let ffmpeg = null;
let currentJobId = null;
let isCancelled = false;

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg = null

const post = (type, data = {}) => {
    self.postMessage({ type, data })
}

const initFFmpeg = async () => {
    if (ffmpeg) return

    post('LOG', { message: 'Loading FFmpeg...' })

    ffmpeg = new FFmpeg()

    //   await ffmpeg.load({
    //     coreURL: new URL(
    //       '@ffmpeg/core/dist/ffmpeg-core.js',
    //       import.meta.url
    //     ).toString()
    //   })

    // await ffmpeg.load({
    //     coreURL: new URL(
    //         '@ffmpeg/core/dist/ffmpeg-core.js',
    //         import.meta.url
    //     ).toString(),
    //     wasmURL: new URL(
    //         '@ffmpeg/core/dist/ffmpeg-core.wasm',
    //         import.meta.url
    //     ).toString()
    // })

    await ffmpeg.load({
        coreURL: '/ffmpeg/esm/ffmpeg-core.js',
        wasmURL: '/ffmpeg/esm/ffmpeg-core.wasm'
    })


    post('READY')
}

self.onmessage = async (e) => {
    try {
        const { type, data } = e.data

        if (type === 'INIT') {
            await initFFmpeg()
        }

        if (type === 'ENCODE') {
            const { images, audio } = data

            // write images
            for (let i = 0; i < images.length; i++) {
                await ffmpeg.writeFile(
                    `img${i}.png`,
                    await fetchFile(images[i])
                )
            }

            // concat file
            let concat = ''
            images.forEach((_, i) => {
                concat += `file img${i}.png\n`
                concat += `duration 2\n`
            })

            await ffmpeg.writeFile('list.txt', concat)

            if (audio) {
                await ffmpeg.writeFile(
                    'audio.mp3',
                    await fetchFile(audio)
                )
            }

            const cmd = audio
                ? [
                    '-f', 'concat', '-safe', '0', '-i', 'list.txt',
                    '-i', 'audio.mp3',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                    '-shortest', 'out.mp4'
                ]
                : [
                    '-f', 'concat', '-safe', '0', '-i', 'list.txt',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                    'out.mp4'
                ]

            await ffmpeg.exec(cmd)

            const out = await ffmpeg.readFile('out.mp4')

            post('DONE', {
                blob: new Blob([out.buffer], { type: 'video/mp4' })
            })
        }

    } catch (err) {
        post('ERROR', { message: err.message })
    }
}


// Enhanced error reporting
const sendError = (error, context = '') => {
    const errorInfo = {
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        context,
        timestamp: Date.now(),
        jobId: currentJobId
    };

    self.postMessage({
        type: 'ERROR',
        jobId: currentJobId,
        data: errorInfo
    });
};

const sendProgress = (stage, progress, data = {}) => {
    self.postMessage({
        type: 'PROGRESS',
        jobId: currentJobId,
        data: {
            stage,
            progress,
            ...data
        }
    });
};

const sendLog = (message) => {
    self.postMessage({
        type: 'LOG',
        jobId: currentJobId,
        data: { message }
    });
};

const sendSuccess = (type, data = {}) => {
    self.postMessage({
        type,
        jobId: currentJobId,
        data
    });
};

// Initialize FFmpeg
// const initFFmpeg = async () => {
//     try {
//         sendLog('🚀 Initializing FFmpeg...');

//         if (typeof FFmpeg === 'undefined') {
//             throw new Error('FFmpeg library not loaded');
//         }

//         const { createFFmpeg } = FFmpeg;

//         if (typeof createFFmpeg !== 'function') {
//             throw new Error('FFmpeg.createFFmpeg not available');
//         }

//         ffmpeg = createFFmpeg({
//             log: false, // Reduce logs for better performance
//             progress: ({ ratio }) => {
//                 sendProgress('encoding', Math.round(ratio * 100));
//             },
//             coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/ffmpeg-core.js',
//             wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/ffmpeg-core.wasm'
//         });

//         sendLog('📦 Loading FFmpeg core...');
//         await ffmpeg.load();
//         sendLog('✅ FFmpeg loaded successfully');

//         return true;
//     } catch (error) {
//         sendError(error, 'initFFmpeg');
//         throw error;
//     }
// };

// Main message handler
// self.onmessage = async (e) => {
//     const { type, jobId, data } = e.data;
//     currentJobId = jobId;
//     isCancelled = false;

//     try {
//         switch (type) {
//             case 'INIT_FFMPEG':
//                 await initFFmpeg();
//                 sendSuccess('FFMPEG_READY');
//                 break;

//             case 'GENERATE_SLIDES': {
//                 const slides = await generateSlides(data);
//                 sendSuccess('SLIDES_GENERATED', { slides });
//                 break;
//             }

//             case 'ENCODE_VIDEO': {
//                 const videoResult = await encodeVideo(data);
//                 sendSuccess('VIDEO_ENCODED', videoResult);
//                 break;
//             }

//             case 'PROCESS_IMAGE': {
//                 const processedImage = await processImage(data);
//                 sendSuccess('IMAGE_PROCESSED', { image: processedImage });
//                 break;
//             }
//             case 'TEST_WORKER':
//                 sendSuccess('WORKER_TESTED', {
//                     message: 'Worker is working',
//                     timestamp: Date.now()
//                 });
//                 break;

//             case 'CANCEL':
//                 isCancelled = true;
//                 if (ffmpeg) {
//                     ffmpeg.terminate();
//                     ffmpeg = null;
//                 }
//                 sendSuccess('CANCELLED');
//                 break;

//             default:
//                 throw new Error(`Unknown message type: ${type}`);
//         }
//     } catch (error) {
//         if (!isCancelled) {
//             sendError(error, `onmessage:${type}`);
//         }
//     }
// };

// Generate slides function
async function generateSlides(data) {
    try {
        const { slides, controls } = data;

        if (!slides || !Array.isArray(slides)) {
            throw new Error('Invalid slides data');
        }

        sendLog(`🖼️ Generating ${slides.length} slides...`);

        const generatedSlides = [];

        for (let i = 0; i < slides.length; i++) {
            if (isCancelled) break;

            try {
                const slide = await generateSlide(slides[i], controls, i);
                generatedSlides.push(slide);

                // Update progress
                const progress = Math.round(((i + 1) / slides.length) * 100);
                sendProgress('generating_slides', progress, {
                    currentSlide: i + 1,
                    totalSlides: slides.length
                });

                sendLog(`✅ Generated slide ${i + 1}/${slides.length}`);

            } catch (slideError) {
                sendLog(`⚠️ Error in slide ${i + 1}: ${slideError.message}`);
                // Create error slide as fallback
                generatedSlides.push(await createErrorSlide(i, slideError.message));
            }
        }

        if (!isCancelled) {
            sendLog(`🎉 Successfully generated ${generatedSlides.length} slides`);
        }

        return generatedSlides;
    } catch (error) {
        sendError(error, 'generateSlides');
        throw error;
    }
}

// Generate individual slide
async function generateSlide(slideData, controls, index) {
    const canvas = new OffscreenCanvas(1280, 720);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#7C3AED');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image if available
    if (slideData.image) {
        try {
            const response = await fetch(slideData.image);
            if (response.ok) {
                const blob = await response.blob();
                const imageBitmap = await createImageBitmap(blob);

                ctx.save();
                // Apply effects
                const blur = Math.min(controls?.blurAmount || 0, 10);
                const brightness = controls?.brightness || 100;
                const contrast = controls?.contrast || 100;

                ctx.filter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%)`;
                ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
                ctx.restore();
            }
        } catch (imageError) {
            // Continue without image
            sendLog(`⚠️ Could not load image for slide ${index + 1}`);
        }
    }

    // Add overlay
    ctx.fillStyle = controls?.backgroundColor || 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = controls?.textColor || '#ffffff';
    const fontSize = Math.min(controls?.fontSize || 36, 42);
    ctx.font = `bold ${fontSize}px ${controls?.fontFamily || 'Arial, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Text wrapping
    const text = slideData.text || 'No text';
    const maxWidth = canvas.width * 0.8;
    const lineHeight = fontSize * 1.4;
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && line !== '') {
            lines.push(line.trim());
            line = word + ' ';
        } else {
            line = testLine;
        }
    }
    if (line.trim()) lines.push(line.trim());

    const totalHeight = lines.length * lineHeight;
    const startY = canvas.height / 2 - totalHeight / 2 + lineHeight / 2;

    // Draw each line
    lines.forEach((textLine, idx) => {
        ctx.fillText(textLine, canvas.width / 2, startY + idx * lineHeight);
    });

    // Convert to blob
    const blob = await canvas.convertToBlob({
        type: 'image/png',
        quality: 0.95
    });

    return {
        index,
        blob,
        duration: controls?.slideDuration || 3,
        filename: `slide_${index}.png`
    };
}

// Create error slide
async function createErrorSlide(index, errorMessage) {
    const canvas = new OffscreenCanvas(1280, 720);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(`Slide ${index + 1}`, canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText('Error', canvas.width / 2, canvas.height / 2);
    ctx.fillText(errorMessage?.substring(0, 50) || 'Unknown error', canvas.width / 2, canvas.height / 2 + 40);

    const blob = await canvas.convertToBlob({ type: 'image/png' });

    return {
        index,
        blob,
        duration: 3,
        filename: `slide_${index}.png`,
        isError: true
    };
}

// Encode video function
async function encodeVideo(data) {
    try {
        const { slides, audio, controls } = data;

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            throw new Error('No slides provided');
        }

        if (!ffmpeg) {
            await initFFmpeg();
        }

        sendLog('🎬 Starting video encoding...');

        // Write slides to FFmpeg
        for (const slide of slides) {
            if (isCancelled) break;

            const arrayBuffer = await slide.blob.arrayBuffer();
            await ffmpeg.writeFile(slide.filename, new Uint8Array(arrayBuffer));
        }

        if (isCancelled) {
            throw new DOMException('Encoding cancelled', 'AbortError');
        }

        // Write audio if exists
        if (audio) {
            try {
                const audioArrayBuffer = await audio.arrayBuffer();
                await ffmpeg.writeFile('audio.mp3', new Uint8Array(audioArrayBuffer));
                sendLog('🔊 Audio file added');
            } catch (audioError) {
                sendLog(`⚠️ Could not add audio: ${audioError.message}`);
            }
        }

        // Create concat file
        let concatContent = '';
        slides.forEach(slide => {
            concatContent += `file ${slide.filename}\n`;
            concatContent += `duration ${slide.duration}\n`;
        });

        await ffmpeg.writeFile('concat.txt', concatContent);

        // Build FFmpeg command
        const command = audio ? [
            '-f', 'concat',
            '-safe', '0',
            '-i', 'concat.txt',
            '-i', 'audio.mp3',
            '-filter_complex', '[0:v]scale=1280:720,fps=30,format=yuv420p[v];[v][1:a]concat=n=1:v=1:a=1[outv][outa]',
            '-map', '[outv]',
            '-map', '[outa]',
            '-c:v', 'libx264',
            '-preset', 'fast', // Using fast for better performance
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            '-threads', '2',
            'output.mp4'
        ] : [
            '-f', 'concat',
            '-safe', '0',
            '-i', 'concat.txt',
            '-vf', 'fps=30,scale=1280:720,format=yuv420p',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            '-threads', '2',
            'output.mp4'
        ];

        sendLog('⚙️ Executing FFmpeg...');
        await ffmpeg.exec(command);

        if (isCancelled) {
            throw new DOMException('Encoding cancelled', 'AbortError');
        }

        // Read output
        const outputData = await ffmpeg.readFile('output.mp4');
        const videoBlob = new Blob([outputData.buffer], { type: 'video/mp4' });

        // Cleanup
        await cleanupFiles([
            'concat.txt',
            ...slides.map(s => s.filename),
            ...(audio ? ['audio.mp3'] : []),
            'output.mp4'
        ]);

        // Get video info
        const videoInfo = await getVideoInfo(videoBlob);

        sendLog('✅ Video encoding completed');

        return {
            videoBlob,
            videoInfo: {
                duration: videoInfo.duration.toFixed(1),
                size: (videoBlob.size / (1024 * 1024)).toFixed(2),
                resolution: `${videoInfo.width}x${videoInfo.height}`,
                format: 'MP4',
                codec: 'H.264/AAC',
                frameRate: '30 fps'
            }
        };

    } catch (error) {
        sendError(error, 'encodeVideo');
        throw error;
    }
}

// Process image (utility function)
async function processImage(data) {
    const { imageBlob, operations } = data;

    const canvas = new OffscreenCanvas(100, 100);
    const ctx = canvas.getContext('2d');

    const imageBitmap = await createImageBitmap(imageBlob);
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    // Apply operations
    ctx.filter = operations?.filter || 'none';
    ctx.drawImage(imageBitmap, 0, 0);

    return await canvas.convertToBlob({
        type: imageBlob.type || 'image/png',
        quality: 0.9
    });
}

// Get video info
async function getVideoInfo(videoBlob) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(videoBlob);

        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Video metadata timeout'));
        }, 10000);

        const cleanup = () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(url);
            video.remove();
        };

        video.onloadedmetadata = () => {
            const info = {
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight
            };
            cleanup();
            resolve(info);
        };

        video.onerror = () => {
            cleanup();
            reject(new Error('Failed to load video metadata'));
        };

        video.src = url;
    });
}

// Cleanup files
async function cleanupFiles(filenames) {
    for (const filename of filenames) {
        try {
            await ffmpeg.deleteFile(filename);
        } catch (error) {
            // Ignore cleanup errors
        }
    }
}

// Global error handlers
self.onerror = (event) => {
    sendError({
        message: event.message || 'Unknown worker error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    }, 'worker.onerror');
};

self.addEventListener('unhandledrejection', (event) => {
    sendError(event.reason || 'Unhandled promise rejection', 'unhandledrejection');
});

// Send ready signal
sendLog('👷 Worker initialized and ready');





