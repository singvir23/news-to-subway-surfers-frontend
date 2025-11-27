# How to Upload Background Video to Vercel Blob

The subway_surfers.mp4 background video is too large for GitHub (102MB). Instead, we host it on Vercel Blob storage.

## Step 1: Upload Video to Vercel Blob

### Option A: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard/stores
2. Click on your Blob store (or create one if you haven't)
3. Click **Upload** button
4. Select your `subway_surfers.mp4` file
5. Once uploaded, click on the file
6. **Copy the URL** - it will look like: `https://xxxxxxxxxx.public.blob.vercel-storage.com/subway_surfers-xxxxx.mp4`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Upload the video
vercel blob upload subway-surfers-frontend/public/subway_surfers.mp4 --token YOUR_BLOB_READ_WRITE_TOKEN
```

This will output a URL like: `https://xxxxxxxxxx.public.blob.vercel-storage.com/subway_surfers-xxxxx.mp4`

## Step 2: Add URL to Environment Variables

### For Local Development

Create `.env.local` in `subway-surfers-frontend/`:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
NEXT_PUBLIC_BACKGROUND_VIDEO_URL=https://xxxxxxxxxx.public.blob.vercel-storage.com/subway_surfers-xxxxx.mp4
```

### For Vercel Deployment

1. Go to your Vercel project → Settings → Environment Variables
2. Add a new variable:
   - **Name**: `NEXT_PUBLIC_BACKGROUND_VIDEO_URL`
   - **Value**: `https://xxxxxxxxxx.public.blob.vercel-storage.com/subway_surfers-xxxxx.mp4`
   - **Environments**: Check all (Production, Preview, Development)
3. Click **Save**
4. Redeploy your app

## Step 3: Test It Works

### Local Test
```bash
cd subway-surfers-frontend
npm run dev
```

Visit http://localhost:3000 and generate a video. The background should load from the cloud URL.

### Production Test
After deploying to Vercel, test video generation to confirm the background loads correctly.

## Troubleshooting

### Video doesn't load
- Check the URL is correct and publicly accessible
- Verify `NEXT_PUBLIC_BACKGROUND_VIDEO_URL` is set in environment variables
- Check browser console for CORS errors
- Ensure the Blob file is set to **public** access

### CORS Error
If you see CORS errors:
1. The Blob should be public by default
2. Verify in Blob settings that access is set to "public"

## Cost

Hosting the video on Vercel Blob:
- **Storage**: ~100MB (well within 1GB free tier)
- **Bandwidth**: Each video render downloads the video once (~100MB)
- Free tier includes 100GB bandwidth = ~1000 video renders/month

This is very cost-effective for development and moderate production use.

## Alternative: Host Elsewhere

You can also host the video on:
- AWS S3
- Cloudflare R2
- Any CDN with public access

Just update `NEXT_PUBLIC_BACKGROUND_VIDEO_URL` with the new URL.
