// src/utils/ffmpegUtils.js
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

export class FFmpegWrapper {
  constructor() {
    this.ffmpeg = new FFmpeg();
    this.isLoaded = false;
    this.progressCallback = null;
    this.logCallback = null;
  }

  async load() {
    if (this.isLoaded) return;

    try {
      this.ffmpeg.on('log', ({ message }) => {
        if (this.logCallback) {
          this.logCallback(message);
        }
      });

      this.ffmpeg.on('progress', ({ progress }) => {
        if (this.progressCallback) {
          this.progressCallback(progress);
        }
      });

      await this.ffmpeg.load({
        coreURL: await toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js',
          'text/javascript'
        ),
        wasmURL: await toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm',
          'application/wasm'
        ),
        workerURL: await toBlobURL(
          'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/worker.js',
          'text/javascript'
        ),
      });

      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('FFmpeg load error:', error);
      throw error;
    }
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  setLogCallback(callback) {
    this.logCallback = callback;
  }

  async writeFile(filename, data) {
    if (!this.isLoaded) {
      await this.load();
    }
    return await this.ffmpeg.writeFile(filename, data);
  }

  async readFile(filename) {
    if (!this.isLoaded) {
      await this.load();
    }
    return await this.ffmpeg.readFile(filename);
  }

  async deleteFile(filename) {
    if (!this.isLoaded) {
      await this.load();
    }
    return await this.ffmpeg.deleteFile(filename);
  }

  async exec(command) {
    if (!this.isLoaded) {
      await this.load();
    }
    return await this.ffmpeg.exec(command);
  }

  async createVideoFromSlides(slideFiles, audioFile = null, options = {}) {
    const {
      outputFile = 'output.mp4',
      resolution = '1280:720',
      fps = 30,
      crf = 23,
      preset = 'medium'
    } = options;

    // Create concat file
    let concatContent = '';
    slideFiles.forEach((slide, index) => {
      concatContent += `file ${slide.filename}\n`;
      concatContent += `duration ${slide.duration || 3}\n`;
    });

    await this.writeFile('concat.txt', concatContent);

    // Build FFmpeg command
    let command;
    
    if (audioFile) {
      await this.writeFile('audio.mp3', await fetchFile(audioFile));
      
      command = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-i', 'audio.mp3',
        '-filter_complex', `[0:v]scale=${resolution},fps=${fps}[v];[v][1:a]concat=n=1:v=1:a=1[outv][outa]`,
        '-map', '[outv]',
        '-map', '[outa]',
        '-c:v', 'libx264',
        '-preset', preset,
        '-crf', crf.toString(),
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        outputFile
      ];
    } else {
      command = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-vf', `fps=${fps},scale=${resolution}`,
        '-c:v', 'libx264',
        '-preset', preset,
        '-crf', crf.toString(),
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        outputFile
      ];
    }

    await this.exec(command);

    // Read the output file
    const data = await this.readFile(outputFile);
    
    // Cleanup temporary files
    await this.cleanupFiles([
      'concat.txt',
      ...slideFiles.map(s => s.filename),
      ...(audioFile ? ['audio.mp3'] : []),
      outputFile
    ]);

    return new Blob([data.buffer], { type: 'video/mp4' });
  }

  async cleanupFiles(filenames) {
    for (const filename of filenames) {
      try {
        await this.deleteFile(filename);
      } catch (error) {
        console.warn(`Failed to delete ${filename}:`, error);
      }
    }
  }

  async getVideoInfo(videoBlob) {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoBlob);
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        const info = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          size: videoBlob.size
        };
        URL.revokeObjectURL(url);
        resolve(info);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = url;
    });
  }

  terminate() {
    if (this.ffmpeg && this.isLoaded) {
      this.ffmpeg.terminate();
      this.isLoaded = false;
    }
  }
}

// Utility functions
export const generateSlideImage = async (slideData, controls, index) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = controls.backgroundColor || 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Image if available
  if (slideData.image) {
    try {
      const img = await loadImage(slideData.image);
      ctx.save();
      ctx.filter = `blur(${Math.min(controls.blurAmount || 0, 10)}px) 
                    brightness(${controls.brightness || 100}%) 
                    contrast(${controls.contrast || 100}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } catch (error) {
      console.warn('Failed to load image:', error);
    }
  }

  // Text
  ctx.fillStyle = controls.textColor || '#ffffff';
  const fontSize = Math.min(controls.fontSize || 36, 42);
  ctx.font = `bold ${fontSize}px ${controls.fontFamily || 'Arial, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  const maxWidth = canvas.width * 0.8;
  const lineHeight = fontSize * 1.4;
  const words = slideData.text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  
  if (line.trim()) lines.push(line.trim());

  const totalHeight = lines.length * lineHeight;
  let startY = canvas.height / 2 - (totalHeight / 2) + (lineHeight / 2);

  lines.forEach((textLine, idx) => {
    ctx.fillText(textLine, canvas.width / 2, startY + (idx * lineHeight));
  });

  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob(blob => resolve({
      blob,
      index,
      duration: controls.slideDuration || 3,
      filename: `slide_${index}.png`
    }), 'image/png', 0.95);
  });
};

export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const dataURLToBlob = (dataURL) => {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
};