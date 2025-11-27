import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background } from './Background';
import { Captions } from './Captions';
import { Audio } from './Audio';
import { VideoProps } from './Root';

export const VideoComposition: React.FC<VideoProps> = ({
  text,
  audioPath,
  timings,
  durationInSeconds,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'black',
      }}
    >
      {/* Background layer: Subway Surfers gameplay */}
      <Background />

      {/* Caption layer: Karaoke-style text */}
      <Captions timings={timings} />

      {/* Audio layer: TTS narration */}
      <Audio audioPath={audioPath} />
    </AbsoluteFill>
  );
};
