import React from 'react';
import { OffthreadVideo } from 'remotion';

export const Background: React.FC = () => {
  // Background video is hosted on Vercel Blob
  // This prevents needing to commit large video files to git
  const videoSrc = process.env.NEXT_PUBLIC_BACKGROUND_VIDEO_URL ||
    'https://your-blob-url.vercel-storage.com/subway_surfers.mp4';

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
      onError={(e) => {
        console.error('Video load error:', e);
        console.error('Attempted to load video from:', videoSrc);
        console.error('Make sure NEXT_PUBLIC_BACKGROUND_VIDEO_URL is set in environment variables');
      }}
    />
  );
};
