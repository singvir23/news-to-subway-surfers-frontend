import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const maxDuration = 10; // Quick response

interface JobMetadata {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  text: string;
  createdAt: number;
  videoUrl?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create job metadata
    const jobMetadata: JobMetadata = {
      id: jobId,
      status: 'pending',
      text,
      createdAt: Date.now(),
    };

    // Store job metadata in Vercel Blob
    await put(`jobs/${jobId}.json`, JSON.stringify(jobMetadata), {
      access: 'public',
      addRandomSuffix: false,
    });

    // Trigger background processing (non-blocking)
    const processUrl = new URL('/api/process-job', req.url);
    fetch(processUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, text }),
    }).catch(err => console.error('Failed to trigger processing:', err));

    return NextResponse.json({
      jobId,
      message: 'Job submitted successfully. Check status using /api/job-status',
    });
  } catch (error) {
    console.error('Submit job error:', error);
    return NextResponse.json(
      { error: 'Failed to submit job' },
      { status: 500 }
    );
  }
}
