'use client';

import React, { useState, useEffect } from 'react';

interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  text: string;
  createdAt: number;
  videoUrl?: string;
  error?: string;
  progress?: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/job-status?jobId=${jobId}`);
        if (response.ok) {
          const status: JobStatus = await response.json();
          setJobStatus(status);

          // Stop polling if job is completed or failed
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollInterval);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError(null);
    setJobId(null);
    setJobStatus(null);

    try {
      const response = await fetch('/api/submit-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit job');
      }

      const data = await response.json();
      setJobId(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!jobStatus) return 'Submitting...';

    switch (jobStatus.status) {
      case 'pending':
        return 'Queued';
      case 'processing':
        return jobStatus.progress || 'Processing...';
      case 'completed':
        return 'Completed!';
      case 'failed':
        return 'Failed';
      default:
        return jobStatus.status;
    }
  };

  const isProcessing = loading && jobStatus?.status !== 'completed' && jobStatus?.status !== 'failed';

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
            disabled={loading}
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              {text.split(/\s+/).filter(w => w.length > 0).length} words
            </span>

            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              className={`px-5 py-2 text-sm font-medium transition ${
                loading || !text.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {getStatusDisplay()}
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

        {/* Status Section */}
        {jobStatus && (
          <div className="mb-8">
            <div className="border border-zinc-800 p-4 text-sm space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Job ID</span>
                <span className="font-mono text-xs">{jobStatus.id.slice(0, 20)}...</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Status</span>
                <span className={
                  jobStatus.status === 'completed' ? 'text-green-400' :
                  jobStatus.status === 'failed' ? 'text-red-400' :
                  jobStatus.status === 'processing' ? 'text-blue-400' :
                  'text-zinc-400'
                }>
                  {getStatusDisplay()}
                </span>
              </div>
              {jobStatus.progress && (
                <div className="flex justify-between text-zinc-400">
                  <span>Progress</span>
                  <span>{jobStatus.progress}</span>
                </div>
              )}
              {jobStatus.error && (
                <div className="col-span-2 p-2 bg-red-950/30 border border-red-900/50 text-red-400 text-xs">
                  {jobStatus.error}
                </div>
              )}
            </div>

            {jobStatus.status === 'completed' && jobStatus.videoUrl && (
              <div className="mt-4 space-y-2">
                <a
                  href={jobStatus.videoUrl}
                  download
                  className="block w-full px-5 py-2 bg-white text-black text-center text-sm font-medium hover:bg-zinc-200 transition"
                >
                  Download video
                </a>
                <button
                  onClick={() => {
                    setJobId(null);
                    setJobStatus(null);
                    setLoading(false);
                    setText('');
                  }}
                  className="block w-full px-5 py-2 bg-zinc-800 text-white text-center text-sm font-medium hover:bg-zinc-700 transition"
                >
                  Create another video
                </button>
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
            <p>• Processing happens in the background (1-3 minutes)</p>
            <p>• You can close this page and come back later</p>
          </div>
        </div>
      </div>
    </div>
  );
}
