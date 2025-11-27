import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { existsSync, unlinkSync, readdirSync, statSync, readFileSync } from 'fs';
import os from 'os';
import { put } from '@vercel/blob';

// Cleanup old files (older than 1 hour)
function cleanupOldFiles(directory: string, maxAgeMs: number = 3600000) {
  try {
    if (!existsSync(directory)) return;

    const files = readdirSync(directory);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(directory, file);
      try {
        const stats = statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          unlinkSync(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      } catch (err) {
        // Skip files we can't access
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, audioPath, timings, duration } = await request.json();

    if (!text || !audioPath || !timings) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Starting video render...');

    // Cleanup old temporary files
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    cleanupOldFiles(audioDir, 3600000); // 1 hour
    cleanupOldFiles(videosDir, 3600000); // 1 hour

    // Create output filename
    const timestamp = Date.now();
    const outputFileName = `video_${timestamp}.mp4`;
    const outputPath = path.join(process.cwd(), 'public', 'videos', outputFileName);

    // Ensure videos directory exists
    if (!existsSync(videosDir)) {
      const { mkdirSync } = await import('fs');
      mkdirSync(videosDir, { recursive: true });
    }

    // Bundle the Remotion project
    console.log('Bundling Remotion project...');
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'Root.tsx'),
      publicDir: path.join(process.cwd(), 'public'),
      webpackOverride: (config) => {
        // Configure webpack to understand Next.js path aliases and inject env vars
        return {
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...config.resolve?.alias,
              '@': process.cwd(),
            },
          },
          plugins: [
            ...(config.plugins || []),
            new (require('webpack')).DefinePlugin({
              'process.env.NEXT_PUBLIC_BACKGROUND_VIDEO_URL': JSON.stringify(
                process.env.NEXT_PUBLIC_BACKGROUND_VIDEO_URL
              ),
            }),
          ],
        };
      },
    });

    console.log('Bundle created at:', bundleLocation);

    // Get composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'SubwaySurfersVideo',
      inputProps: {
        text,
        audioPath,
        timings,
        durationInSeconds: duration,
      },
    });

    console.log('Composition selected:', composition.id);

    // Calculate duration in frames
    const durationInFrames = Math.ceil(duration * 30);

    // Render the video with performance optimizations
    console.log('Rendering video...');
    const cpuCount = os.cpus().length;
    const concurrency = Math.max(1, Math.floor(cpuCount * 0.75)); // Use 75% of CPUs
    console.log(`Using ${concurrency} concurrent threads`);

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
        props: {
          text,
          audioPath,
          timings,
          durationInSeconds: duration,
        },
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      imageFormat: 'jpeg',
      // Performance optimizations
      concurrency,
      // Faster encoding preset (trades file size for speed)
      videoBitrate: '2M',
      encodingMaxRate: '2.5M',
      encodingBufferSize: '4M',
      // Increase timeout to handle large video downloads
      timeoutInMilliseconds: 120000, // 2 minutes
    });

    console.log('Video rendered successfully:', outputPath);

    // Upload to Vercel Blob storage
    console.log('Uploading video to cloud storage...');
    const videoBuffer = readFileSync(outputPath);
    const blob = await put(outputFileName, videoBuffer, {
      access: 'public',
      contentType: 'video/mp4',
    });
    console.log('Video uploaded to cloud:', blob.url);

    // Clean up local video file after upload
    try {
      unlinkSync(outputPath);
      console.log('Cleaned up local video file');
    } catch (err) {
      console.error('Error cleaning up local video file:', err);
    }

    // Clean up the audio file
    const audioFilePath = path.join(process.cwd(), 'public', audioPath);
    try {
      if (existsSync(audioFilePath)) {
        unlinkSync(audioFilePath);
        console.log('Cleaned up audio file:', audioPath);
      }
      // Also clean up subtitle file if it exists
      const subtitlePath = audioFilePath + '.json';
      if (existsSync(subtitlePath)) {
        unlinkSync(subtitlePath);
        console.log('Cleaned up subtitle file');
      }
    } catch (err) {
      console.error('Error cleaning up audio file:', err);
    }

    return NextResponse.json({
      success: true,
      videoPath: blob.url,
      downloadUrl: blob.downloadUrl,
      message: 'Video rendered and uploaded successfully',
    });
  } catch (error) {
    console.error('Error rendering video:', error);
    return NextResponse.json(
      {
        error: 'Failed to render video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
