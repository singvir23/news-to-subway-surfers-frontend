import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Fetch job metadata from Vercel Blob
    const jobUrl = `https://${process.env.BLOB_READ_WRITE_TOKEN?.split('_')[2]}.public.blob.vercel-storage.com/jobs/${jobId}.json`;

    const response = await fetch(jobUrl);

    if (!response.ok) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobMetadata = await response.json();

    return NextResponse.json(jobMetadata);
  } catch (error) {
    console.error('Job status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
