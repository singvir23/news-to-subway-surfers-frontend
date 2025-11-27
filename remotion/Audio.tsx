import React from 'react';
import { Audio as RemotionAudio, staticFile } from 'remotion';

interface AudioProps {
  audioPath: string;
}

export const Audio: React.FC<AudioProps> = ({ audioPath }) => {
  // Remove leading slash for staticFile
  // audioPath comes as "/audio/speech_xxx.mp3", we need "audio/speech_xxx.mp3"
  const cleanPath = audioPath.startsWith('/') ? audioPath.slice(1) : audioPath;

  return (
    <RemotionAudio
      src={staticFile(cleanPath)}
      startFrom={0}
      volume={1.0}
    />
  );
};
