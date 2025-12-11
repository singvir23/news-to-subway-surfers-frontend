import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';

export const Background: React.FC = () => {
  // Background video is stored locally in public directory
  // Place your subway_surfers.mp4 (or other background video) in the public folder
  const videoSrc = staticFile('subway_surfers.mp4');

  return (
    <OffthreadVideo
      src={videoSrc}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
      // Mute the background video (we only want our TTS audio)
      muted
      volume={0}
      // Increase timeout for large video files
      delayRenderTimeoutInMilliseconds={60000}
      onError={(e) => {
        console.error('Video load error:', e);
        console.error('Attempted to load video from:', videoSrc);
        console.error('Make sure subway_surfers.mp4 exists in the public directory');
      }}
    />
  );
};
