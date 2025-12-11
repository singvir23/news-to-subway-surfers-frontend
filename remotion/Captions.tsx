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
        gap: '16px',
        padding: '20px',
      }}
    >
      {currentSegment.words.map((wordData, index) => {
        // Determine the color based on word position
        let color = '#FFFFFF'; // White for all words
        let scale = 1;

        if (index === currentWordIndex) {
          // Current word: cyan color
          color = '#00FFFF'; // Cyan
          scale = 1.15; // Slightly larger for emphasis
        }

        return (
          <div
            key={index}
            style={{
              display: 'inline-block',
              fontSize: '64px',
              fontWeight: '900',
              color: color,
              opacity: 1,
              transform: `scale(${scale})`,
              transition: 'all 0.15s ease-out',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), -1px -1px 2px rgba(0, 0, 0, 0.9)',
              WebkitTextStroke: '3px black',
              letterSpacing: '2px',
              fontFamily: 'Arial Black, sans-serif',
              textTransform: 'uppercase',
            }}
          >
            {wordData.word}
          </div>
        );
      })}
    </div>
  );
};
