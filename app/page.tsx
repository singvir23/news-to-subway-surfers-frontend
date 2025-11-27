'use client';

import React, { useState } from 'react';
import { WordTiming } from '@/lib/tts';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<{
    audioPath: string;
    timings: WordTiming[];
    duration: number;
  } | null>(null);
  const [renderedVideoPath, setRenderedVideoPath] = useState<string | null>(null);

  const handleGenerateAndRender = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError(null);
    setVideoData(null);
    setRenderedVideoPath(null);

    try {
      // Step 1: Generate audio
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioData = await audioResponse.json();
      const tempVideoData = {
        audioPath: audioData.audioPath,
        timings: audioData.timings,
        duration: audioData.duration,
      };
      setVideoData(tempVideoData);
      setLoading(false);

      // Step 2: Render video
      setRendering(true);
      const renderResponse = await fetch('/api/render-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          audioPath: tempVideoData.audioPath,
          timings: tempVideoData.timings,
          duration: tempVideoData.duration,
        }),
      });

      if (!renderResponse.ok) {
        const errorData = await renderResponse.json();
        throw new Error(errorData.error || 'Failed to render video');
      }

      const renderData = await renderResponse.json();
      setRenderedVideoPath(renderData.videoPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRendering(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold mb-2">
            Subway Surfers Video Generator
          </h1>
          <p className="text-zinc-400">
            Text to video with TTS and synchronized captions
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3 text-zinc-300">Text</label>

          <textarea
            className="w-full h-64 p-4 bg-zinc-900 text-white border border-zinc-800 focus:border-zinc-600 focus:outline-none resize-none font-mono text-sm"
            placeholder="Paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading || rendering}
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              {text.split(/\s+/).filter(w => w.length > 0).length} words
            </span>

            <button
              onClick={handleGenerateAndRender}
              disabled={loading || rendering || !text.trim()}
              className={`px-5 py-2 text-sm font-medium transition ${
                loading || rendering || !text.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating audio
                </span>
              ) : rendering ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Rendering video
                </span>
              ) : (
                'Create video'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-950/50 border border-red-900 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {videoData && (
          <div className="mb-8">
            <div className="border border-zinc-800 p-4 text-sm space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Duration</span>
                <span>{videoData.duration.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Resolution</span>
                <span>1080x1920</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Words</span>
                <span>{videoData.timings.length}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Status</span>
                <span>
                  {rendering ? 'Rendering...' : renderedVideoPath ? 'Complete' : 'Ready'}
                </span>
              </div>
            </div>

            {renderedVideoPath && (
              <div className="mt-4">
                <a
                  href={renderedVideoPath}
                  download
                  className="block w-full px-5 py-2 bg-white text-black text-center text-sm font-medium hover:bg-zinc-200 transition"
                >
                  Download video
                </a>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="border-t border-zinc-800 pt-8">
          <div className="text-sm text-zinc-500 space-y-1">
            <p>• Generates 9:16 vertical videos for social media</p>
            <p>• Uses Microsoft Edge TTS for voice narration</p>
            <p>• Karaoke-style word highlighting</p>
            <p>• Rendering typically takes 30-60 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
