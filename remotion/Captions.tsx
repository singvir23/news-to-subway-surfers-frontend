import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { timingsToFrames, getCurrentWord } from '@/lib/subtitles';
import { WordTiming } from '@/lib/tts';

interface CaptionsProps {
  timings: WordTiming[];
}

export const Captions: React.FC<CaptionsProps> = ({ timings }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Convert timings to frame-based segments
  const segments = timingsToFrames(timings, fps);

  // Find the current segment that should be displayed
  const currentSegment = segments.find(
    (segment) => frame >= segment.startFrame && frame < segment.endFrame
  );

  if (!currentSegment) {
    return null;
  }

  // Get the index of the current word being spoken
  const currentWordIndex = getCurrentWord(currentSegment, frame);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        textAlign: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px',
      }}
    >
      {currentSegment.words.map((wordData, index) => {
        // Determine the opacity and styling based on word position
        let opacity = 0.4; // Default: past words are dimmed
        let color = '#999999'; // Gray for past words
        let scale = 1;

        if (index === currentWordIndex) {
          // Current word: full brightness and highlighted
          opacity = 1;
          color = '#FFFFFF'; // White
          scale = 1.1; // Slightly larger
        } else if (index > currentWordIndex) {
          // Future words: hidden
          opacity = 0;
        }

        return (
          <div
            key={index}
            style={{
              display: 'inline-block',
              fontSize: '48px',
              fontWeight: 'bold',
              color: color,
              opacity: opacity,
              transform: `scale(${scale})`,
              transition: 'all 0.2s ease',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), -1px -1px 2px rgba(0, 0, 0, 0.9)',
              WebkitTextStroke: '2px black',
              letterSpacing: '1px',
            }}
          >
            {wordData.word}
          </div>
        );
      })}
    </div>
  );
};
