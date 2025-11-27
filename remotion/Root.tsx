import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { VideoComposition } from './Composition';
import { WordTiming } from '@/lib/tts';

export interface VideoProps {
  text: string;
  audioPath: string;
  timings: WordTiming[];
  durationInSeconds: number;
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SubwaySurfersVideo"
        component={VideoComposition}
        durationInFrames={300} // Default 10 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          text: 'Sample text for preview',
          audioPath: '/audio/sample.mp3',
          timings: [],
          durationInSeconds: 10,
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
