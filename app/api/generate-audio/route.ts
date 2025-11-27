import { NextRequest, NextResponse } from 'next/server';
import { generateSpeechWithTimings } from '@/lib/tts';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Generate speech and get word timings
    const result = await generateSpeechWithTimings(text);

    return NextResponse.json({
      success: true,
      audioPath: result.audioPath,
      timings: result.timings,
      duration: result.duration,
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
