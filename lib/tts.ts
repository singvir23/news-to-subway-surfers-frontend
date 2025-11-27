import { EdgeTTS } from 'node-edge-tts';
import { readFileSync, existsSync } from 'fs';

export interface WordTiming {
  word: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
}

interface SubtitleEntry {
  part: string;
  start: number; // in milliseconds
  end: number; // in milliseconds
}

export async function generateSpeechWithTimings(text: string): Promise<{
  audioPath: string;
  timings: WordTiming[];
  duration: number;
}> {
  // Use an expressive voice for natural-sounding narration
  // en-US-AriaNeural is female, expressive
  // en-US-GuyNeural is male, expressive
  const voice = 'en-US-AriaNeural';

  const tts = new EdgeTTS({
    voice,
    lang: 'en-US',
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    saveSubtitles: true, // Save subtitle timing data
    rate: '+0%', // Normal speed
    pitch: '+0Hz', // Normal pitch
    timeout: 60000, // 60 seconds timeout for longer texts
  });

  const timestamp = Date.now();
  const audioFileName = `speech_${timestamp}.mp3`;
  const audioPath = `public/audio/${audioFileName}`;
  const subtitlePath = `${audioPath}.json`;

  // Generate the audio file with subtitle data
  console.log('Starting TTS generation for text length:', text.length);
  try {
    await tts.ttsPromise(text, audioPath);
    console.log('TTS generation completed successfully');
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw new Error(`TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Read and parse the subtitle data
  let timings: WordTiming[] = [];
  if (existsSync(subtitlePath)) {
    const subtitleData = readFileSync(subtitlePath, 'utf-8');
    timings = parseSubtitleJSON(subtitleData);
  }

  // If no timings, create fallback based on word count
  if (timings.length === 0) {
    timings = createFallbackTimings(text);
  }

  // Calculate duration from timings or estimate
  const duration = timings.length > 0
    ? timings[timings.length - 1].endTime + 0.5
    : (text.split(/\s+/).length / 2.5) + 1;

  return {
    audioPath: `/audio/${audioFileName}`,
    timings,
    duration,
  };
}

function parseSubtitleJSON(jsonData: string): WordTiming[] {
  const timings: WordTiming[] = [];

  try {
    const subtitles: SubtitleEntry[] = JSON.parse(jsonData);

    for (const entry of subtitles) {
      timings.push({
        word: entry.part.trim(),
        startTime: entry.start / 1000, // Convert milliseconds to seconds
        endTime: entry.end / 1000, // Convert milliseconds to seconds
      });
    }
  } catch (error) {
    console.error('Error parsing subtitle JSON:', error);
  }

  return timings;
}

function createFallbackTimings(text: string): WordTiming[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const timings: WordTiming[] = [];
  const timePerWord = 0.4; // 2.5 words per second

  for (let i = 0; i < words.length; i++) {
    timings.push({
      word: words[i],
      startTime: i * timePerWord,
      endTime: (i + 1) * timePerWord,
    });
  }

  return timings;
}
