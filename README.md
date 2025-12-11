# Subway Surfers Video Generator

Automated video generator that creates "Subway Surfers" style videos with TTS narration and karaoke captions. All processing and storage done locally.

## Features

- **AI-Powered Text Processing**: Convert raw news articles to engaging storytelling format using AWS SageMaker fine-tuned LLM
- **Free TTS**: Microsoft Edge TTS with natural voices
- **Karaoke Captions**: Word-by-word synchronized highlighting with cyan highlighting
- **Local Storage**: Videos stored in local filesystem
- **Vertical Format**: 1080x1920 for TikTok/Instagram/YouTube Shorts
- **Auto Cleanup**: Old temporary files deleted automatically
- **Async Processing**: Background job processing with real-time status updates

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Add Background Video

Place your `subway_surfers.mp4` background video in the `public/` directory:

```bash
public/
└── subway_surfers.mp4
```

### 3. Environment Variables

Create `.env.local`:

```bash
# Site URL for API calls
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AWS Credentials for SageMaker (for AI text processing)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-2
SAGEMAKER_ENDPOINT_NAME=subway-surfers-fine-tuned
```

### 4. Run

```bash
npm run dev
```

Visit http://localhost:3000

## How It Works

**AI-Powered Workflow**

1. **Optional**: User pastes raw news article → Clicks "Process with AI"
2. AWS SageMaker LLM converts article to engaging storytelling format
3. User can edit the processed text
4. User clicks "Create video" → Receives job ID instantly
5. Frontend polls job status every 2 seconds
6. Background processing:
   - Generate audio with Edge TTS
   - Render video with Remotion
   - Save to local filesystem
   - Clean up temp audio files
7. Status updates in real-time (Generating audio → Rendering → Done)
8. Download link appears when complete (1-3 minutes)

## Tech Stack

- Next.js 14
- AWS SageMaker (fine-tuned Llama 3.1 8B for text processing)
- Remotion (video rendering)
- Edge TTS (text-to-speech)
- TypeScript

## Project Structure

```
app/
├── api/
│   ├── process-text/      # AI text processing with SageMaker
│   ├── generate-audio/    # TTS generation
│   ├── submit-job/        # Job submission (returns instantly)
│   ├── process-job/       # Background video processing
│   └── job-status/        # Status polling endpoint
└── page.tsx               # Main UI with AI processing and polling
remotion/
├── Background.tsx         # Background video layer
├── Captions.tsx          # Karaoke captions (cyan highlighting)
├── Audio.tsx             # Audio layer
└── Root.tsx              # Remotion composition
lib/
├── tts.ts                # TTS utilities
├── subtitles.ts          # Timing calculations
└── localJobStorage.ts    # Local job metadata storage
public/
├── subway_surfers.mp4    # Background video (you provide)
├── jobs/                 # Job metadata (auto-created)
├── videos/               # Output videos (auto-created)
└── audio/                # Temporary audio files (auto-cleaned)
```

## Troubleshooting

### Video not rendering
- Ensure `subway_surfers.mp4` exists in the `public/` directory
- Check browser console for errors

### Job stuck in processing
- Check browser console for polling errors
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check terminal logs for errors

### Background video not loading
- Ensure video is compressed (use FFmpeg, ~60-70MB max)
- Check that the file is named exactly `subway_surfers.mp4`
- Place it directly in the `public/` directory

## File Storage

- **Job metadata**: `public/jobs/*.json`
- **Output videos**: `public/videos/*.mp4` (kept permanently)
- **Audio files**: `public/audio/*.mp3` (deleted after processing)
- **Old files**: Automatically cleaned after 1 hour

## License

Educational and personal use.
