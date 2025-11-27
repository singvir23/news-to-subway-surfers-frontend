# Cloud Storage Setup for Video Generation

This project uses **Vercel Blob Storage** to store generated videos in the cloud. This means:
- ✅ Generated videos are automatically uploaded to the cloud
- ✅ Only the final video is stored (all temp files are cleaned up)
- ✅ The only local video file is `public/subway_surfers.mp4` (the background gameplay)

## Setup Instructions

### 1. Create a Vercel Blob Store

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Create Database**
3. Select **Blob** storage
4. Name it (e.g., "subway-surfers-videos")
5. Click **Create**

### 2. Get Your Blob Token

1. In your newly created Blob store, click on the **.env.local** tab
2. Copy the `BLOB_READ_WRITE_TOKEN` value
3. Create a `.env.local` file in the `subway-surfers-frontend` directory
4. Add the token:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX
```

### 3. Add the Background Video

You need to add a Subway Surfers gameplay video:

1. Download a Subway Surfers gameplay video (vertical format recommended, 1080x1920)
2. Name it exactly: `subway_surfers.mp4`
3. Place it in: `subway-surfers-frontend/public/subway_surfers.mp4`

**Download options:**
- Use `yt-dlp` to download from YouTube
- Use an online YouTube downloader
- Find "subway surfers gameplay no copyright" on YouTube

### 4. File Structure

```
subway-surfers-frontend/
├── public/
│   ├── subway_surfers.mp4     # ← Your background video (KEEP THIS)
│   ├── audio/                  # ← Temp audio files (auto-deleted)
│   └── videos/                 # ← Temp rendered videos (auto-deleted)
├── .env.local                  # ← Your Vercel Blob token (DO NOT COMMIT)
└── .env.example               # ← Template for .env.local
```

## How It Works

1. **Audio Generation**: TTS audio is generated and saved to `public/audio/`
2. **Video Rendering**: Video is rendered using the audio + subway surfers background
3. **Cloud Upload**: Final video is uploaded to Vercel Blob storage
4. **Cleanup**: Audio files and local video file are deleted
5. **Response**: The API returns the cloud URL of the uploaded video

## Testing

After setup, test the endpoint:

```bash
curl -X POST http://localhost:3000/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test of the text to speech system."}'

# Then use the returned audioPath to render the video
curl -X POST http://localhost:3000/api/render-video \
  -H "Content-Type: application/json" \
  -d '{"text": "...", "audioPath": "...", "timings": [...], "duration": 10}'
```

## Cost

Vercel Blob free tier includes:
- **1 GB** storage
- **100 GB** bandwidth per month
- Perfect for testing and small-scale use

For production, upgrade to a paid plan as needed.
