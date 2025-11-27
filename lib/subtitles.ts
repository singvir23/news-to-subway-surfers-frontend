import { WordTiming } from './tts';

export interface CaptionSegment {
  text: string;
  startFrame: number;
  endFrame: number;
  words: {
    word: string;
    startFrame: number;
    endFrame: number;
  }[];
}

/**
 * Convert word timings to frame-based caption segments
 * Remotion works with frames, not seconds
 */
export function timingsToFrames(
  timings: WordTiming[],
  fps: number
): CaptionSegment[] {
  const segments: CaptionSegment[] = [];

  if (timings.length === 0) {
    return segments;
  }

  // Group words into sentences or reasonable chunks
  let currentSegment: CaptionSegment | null = null;
  const maxWordsPerSegment = 8; // Show 8 words at a time for readability
  let wordCount = 0;

  for (const timing of timings) {
    const startFrame = Math.floor(timing.startTime * fps);
    const endFrame = Math.floor(timing.endTime * fps);

    if (!currentSegment || wordCount >= maxWordsPerSegment) {
      // Start new segment
      if (currentSegment) {
        segments.push(currentSegment);
      }

      currentSegment = {
        text: timing.word,
        startFrame,
        endFrame,
        words: [{
          word: timing.word,
          startFrame,
          endFrame,
        }],
      };
      wordCount = 1;
    } else {
      // Add to existing segment
      currentSegment.text += ' ' + timing.word;
      currentSegment.endFrame = endFrame;
      currentSegment.words.push({
        word: timing.word,
        startFrame,
        endFrame,
      });
      wordCount++;
    }
  }

  // Add the last segment
  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * Get the current word that should be highlighted based on frame
 */
export function getCurrentWord(
  segment: CaptionSegment,
  currentFrame: number
): number {
  for (let i = 0; i < segment.words.length; i++) {
    if (currentFrame >= segment.words[i].startFrame &&
        currentFrame < segment.words[i].endFrame) {
      return i;
    }
  }

  // If we're past all words, highlight the last one
  if (currentFrame >= segment.endFrame) {
    return segment.words.length - 1;
  }

  // Not started yet
  return -1;
}

/**
 * Split text into words for manual timing (fallback if TTS doesn't provide timings)
 */
export function createFallbackTimings(
  text: string,
  duration: number
): WordTiming[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const timings: WordTiming[] = [];
  const timePerWord = duration / words.length;

  for (let i = 0; i < words.length; i++) {
    timings.push({
      word: words[i],
      startTime: i * timePerWord,
      endTime: (i + 1) * timePerWord,
    });
  }

  return timings;
}
