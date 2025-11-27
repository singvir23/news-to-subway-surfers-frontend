# Subway Surfers Video Generator

An automated video generator that creates engaging "Subway Surfers Reddit stories" style videos with synchronized TTS narration and karaoke-style captions. Videos are automatically uploaded to Vercel Blob cloud storage.

## Features

- **Free TTS**: Uses Edge-TTS with expressive voices (no API keys required)
- **Karaoke Captions**: Word-by-word highlighting synchronized with audio
- **Vertical Format**: 1080x1920 (9:16) optimized for TikTok, Instagram Reels, YouTube Shorts
- **Cloud Storage**: Automatic upload to Vercel Blob (no local storage needed)
- **Simple Interface**: Just paste text and generate
- **Auto Cleanup**: Temporary files are automatically deleted after upload

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Remotion**: React-based video rendering
- **Edge-TTS**: Free, natural-sounding text-to-speech
- **Vercel Blob**: Cloud storage for generated videos
- **Tailwind CSS**: Styling

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account (free tier works great)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up Vercel Blob storage (see [CLOUD_STORAGE_SETUP.md](CLOUD_STORAGE_SETUP.md))

3. Create `.env.local` file:

```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

4. Add the Subway Surfers background video:
   - Download a Subway Surfers gameplay video (vertical format recommended)
   - Save it as `public/subway_surfers.mp4`

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Enter Your Text**: Paste your Reddit story, script, or any text in the input area
2. **Generate Video**: Click the "Create video" button
3. **Wait**: The app will generate audio and render the video (typically 30-60 seconds)
4. **Download**: Click the download link to get your video from cloud storage

## Project Structure

```
subway-surfers-frontend/
├── app/
│   ├── api/
│   │   ├── generate-audio/    # TTS generation endpoint
│   │   └── render-video/      # Video rendering + cloud upload
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main UI
├── remotion/
│   ├── Root.tsx               # Remotion root
│   ├── Composition.tsx        # Main video composition
│   ├── Background.tsx         # Background video layer
│   ├── Captions.tsx           # Caption layer with karaoke effect
│   └── Audio.tsx              # Audio layer
├── lib/
│   ├── tts.ts                 # Edge-TTS utilities
│   └── subtitles.ts           # Subtitle timing utilities
├── public/
│   ├── subway_surfers.mp4     # Background video (YOU MUST ADD THIS)
│   ├── audio/                 # Temp audio (auto-deleted)
│   └── videos/                # Temp videos (auto-deleted)
├── .env.local                 # Your Vercel Blob token (create this)
└── package.json
```

## How It Works

1. **Text Input**: User enters text in the textarea
2. **TTS Generation**: API route uses Edge-TTS to generate speech with word-level timing
3. **Video Rendering**: Remotion renders video combining:
   - Background: Looping Subway Surfers gameplay
   - Audio: Generated TTS narration
   - Captions: Synchronized text with karaoke highlighting effect
4. **Cloud Upload**: Video is uploaded to Vercel Blob storage
5. **Cleanup**: All temporary audio and video files are deleted
6. **Response**: User gets a download link to the cloud-hosted video

## Caption Styling

Captions use a karaoke-style effect:
- **Current word**: White, 100% opacity, slightly larger
- **Past words**: Gray, 40% opacity
- **Future words**: Hidden (0% opacity)
- **Styling**: Bold font with black stroke outline for readability

## Voice Settings

Currently using `en-US-AriaNeural` (expressive female voice). You can change the voice in [lib/tts.ts](lib/tts.ts):

```typescript
const voice = 'en-US-AriaNeural'; // or 'en-US-GuyNeural' for male
```

Available voices: en-US-AriaNeural, en-US-GuyNeural, en-US-JennyNeural, and more.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel dashboard
3. Add environment variable: `BLOB_READ_WRITE_TOKEN`
4. Deploy!

**Important**: Make sure `public/subway_surfers.mp4` is committed to your repo.

## Storage Costs

Vercel Blob free tier includes:
- 1 GB storage
- 100 GB bandwidth per month

This is enough for testing and small-scale use. For production, upgrade as needed.

## Troubleshooting

### Server won't start
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Audio not generating
- Check that the `public/audio/` directory exists
- Ensure Edge-TTS is installed: `npm install node-edge-tts`

### Video not loading
- Make sure `public/subway_surfers.mp4` exists
- Check that the file is a valid MP4 video

### Upload fails
- Verify your `BLOB_READ_WRITE_TOKEN` in `.env.local`
- Check Vercel Blob storage quota

## License

This project is for educational and personal use.
