# Subway Surfers Video Generator

Automated video generator that creates "Subway Surfers" style videos with TTS narration and karaoke captions. All videos stored in Vercel Blob cloud storage.

## Features

- **Free TTS**: Microsoft Edge TTS with natural voices
- **Karaoke Captions**: Word-by-word synchronized highlighting
- **Cloud Storage**: Videos automatically uploaded to Vercel Blob
- **Vertical Format**: 1080x1920 for TikTok/Instagram/YouTube Shorts
- **Auto Cleanup**: Temporary files deleted after processing
- **Async Processing**: Background job processing with real-time status updates
- **Free Tier Compatible**: Works on Vercel Hobby plan (no timeouts!)

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Set Up Vercel Blob

1. Create Blob store: https://vercel.com/dashboard/stores
2. Upload your `subway_surfers.mp4` background video
3. Connect the Blob store to your Vercel project (auto-adds token)
4. Copy the background video's public URL

### 3. Environment Variables

Create `.env.local`:

```bash
# Auto-injected when you connect Blob store to Vercel project
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# URL of your uploaded background video
NEXT_PUBLIC_BACKGROUND_VIDEO_URL=https://xxxxx.blob.vercel-storage.com/subway_surfers.mp4

# Site URL for API calls (update for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run

```bash
npm run dev
```

Visit http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set **Root Directory**: `subway-surfers-frontend`
4. Connect Blob store to project
5. Add environment variables:
   - `NEXT_PUBLIC_BACKGROUND_VIDEO_URL` (your video URL)
   - `NEXT_PUBLIC_SITE_URL` (your Vercel app URL, e.g., `https://yourapp.vercel.app`)
6. Deploy

**Works on Free Tier!** The async architecture bypasses timeout limits.

## How It Works

**Async Architecture (No Timeouts!)**

1. User submits text → Receives job ID instantly
2. Frontend polls job status every 2 seconds
3. Background processing:
   - Generate audio with Edge TTS
   - Render video with Remotion
   - Upload to Vercel Blob
   - Clean up temp files
4. Status updates in real-time (Generating audio → Rendering → Uploading)
5. Download link appears when complete (1-3 minutes)

## Tech Stack

- Next.js 14
- Remotion (video rendering)
- Edge TTS (text-to-speech)
- Vercel Blob (cloud storage)
- TypeScript

## Project Structure

```
app/
├── api/
│   ├── generate-audio/    # TTS generation
│   ├── submit-job/        # Job submission (returns instantly)
│   ├── process-job/       # Background video processing
│   ├── job-status/        # Status polling endpoint
│   └── render-video/      # Legacy (not used in async flow)
└── page.tsx               # Main UI with polling
remotion/
├── Background.tsx         # Background video layer
├── Captions.tsx          # Karaoke captions
├── Audio.tsx             # Audio layer
└── Root.tsx              # Remotion composition
lib/
├── tts.ts                # TTS utilities
└── subtitles.ts          # Timing calculations
```

## Troubleshooting

### Build fails
- Verify Root Directory: `subway-surfers-frontend`
- Clear build cache in Vercel

### Video not loading
- Check `NEXT_PUBLIC_BACKGROUND_VIDEO_URL` is set
- Verify URL is publicly accessible

### Job stuck in processing
- Check browser console for polling errors
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check Vercel function logs for errors

### Background video not loading
- Ensure video is compressed (use FFmpeg, ~60-70MB max)
- Check `NEXT_PUBLIC_BACKGROUND_VIDEO_URL` points to compressed version

## Cost

- **Completely FREE!** Works on Vercel Hobby tier
- Uses async processing to bypass timeout limits
- Vercel Blob: 500GB storage free
- Vercel Functions: 1M invocations/month free

## License

Educational and personal use.
