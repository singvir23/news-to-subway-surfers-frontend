import { NextRequest, NextResponse } from 'next/server';
import { getJobMetadata } from '@/lib/localJobStorage';

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Read job metadata from local filesystem
    const jobMetadata = getJobMetadata(jobId);

    if (!jobMetadata) {
      console.error(`[job-status] Job not found: ${jobId}`);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    console.log(`[job-status] Job ${jobId} status: ${jobMetadata.status}`);

    return NextResponse.json(jobMetadata);
  } catch (error) {
    console.error('Job status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
