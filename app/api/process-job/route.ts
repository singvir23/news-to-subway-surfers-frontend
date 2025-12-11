import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { existsSync, unlinkSync, readdirSync, statSync, mkdirSync } from 'fs';
import os from 'os';
import { updateJobMetadata } from '@/lib/localJobStorage';

export const maxDuration = 300; // 5 minutes max for processing

// Cleanup old files
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
        }
      } catch (err) {
        // Skip
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

export async function POST(req: NextRequest) {
  const { jobId, text } = await req.json();

  if (!jobId || !text) {
    return NextResponse.json({ error: 'Missing jobId or text' }, { status: 400 });
  }

  // Run processing asynchronously (don't await in the main flow)
  processVideo(jobId, text).catch(err => {
    console.error(`Job ${jobId} failed:`, err);
    updateJobMetadata(jobId, {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  });

  return NextResponse.json({ message: 'Processing started' });
}

async function processVideo(jobId: string, text: string) {
  try {
    updateJobMetadata(jobId, { status: 'processing', progress: 'Generating audio...' });

    // Step 1: Generate audio
    console.log(`[${jobId}] Generating audio...`);
    const audioResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/generate-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!audioResponse.ok) {
      throw new Error('Failed to generate audio');
    }

    const { audioPath, timings, duration } = await audioResponse.json();
    console.log(`[${jobId}] Audio generated: ${audioPath}`);

    updateJobMetadata(jobId, { progress: 'Rendering video...' });

    // Step 2: Setup directories
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    cleanupOldFiles(audioDir, 3600000);
    cleanupOldFiles(videosDir, 3600000);

    if (!existsSync(videosDir)) {
      mkdirSync(videosDir, { recursive: true });
    }

    const timestamp = Date.now();
    const outputFileName = `video_${timestamp}.mp4`;
    const outputPath = path.join(process.cwd(), 'public', 'videos', outputFileName);

    // Step 3: Bundle Remotion
    console.log(`[${jobId}] Bundling Remotion...`);
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'Root.tsx'),
      publicDir: path.join(process.cwd(), 'public'),
      webpackOverride: (config) => {
        return {
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...config.resolve?.alias,
              '@': process.cwd(),
            },
          },
        };
      },
    });

    // Step 4: Select composition
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

    const durationInFrames = Math.ceil(duration * 30);

    // Step 5: Render video
    console.log(`[${jobId}] Rendering video...`);
    const cpuCount = os.cpus().length;
    const concurrency = Math.max(1, Math.floor(cpuCount * 0.75));

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
      concurrency,
      videoBitrate: '2M',
      encodingMaxRate: '2.5M',
      encodingBufferSize: '4M',
      timeoutInMilliseconds: 240000, // 4 minutes
    });

    console.log(`[${jobId}] Video rendered at ${outputPath}`);

    // Step 6: Cleanup audio files (keep video local)
    try {
      const audioFilePath = path.join(process.cwd(), 'public', audioPath);
      if (existsSync(audioFilePath)) {
        unlinkSync(audioFilePath);
      }
      const subtitlePath = audioFilePath + '.json';
      if (existsSync(subtitlePath)) {
        unlinkSync(subtitlePath);
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }

    // Step 7: Mark as completed with local video URL
    const videoUrl = `/videos/${outputFileName}`;
    updateJobMetadata(jobId, {
      status: 'completed',
      videoUrl: videoUrl,
      progress: 'Done!',
    });

    console.log(`[${jobId}] Job completed successfully`);
  } catch (error) {
    console.error(`[${jobId}] Processing failed:`, error);
    updateJobMetadata(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
