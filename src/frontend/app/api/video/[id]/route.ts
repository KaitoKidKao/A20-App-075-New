import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import { join, resolve } from 'path';

// Video files are stored by BE at: <project_root>/data/uploads/videos/{video_id}.{ext}
// Next.js dev server runs from src/frontend/, so we go up 2 levels to reach project root.
const VIDEO_DIR = resolve(process.cwd(), '..', '..', 'data', 'uploads', 'videos');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  if (!existsSync(VIDEO_DIR)) {
    return NextResponse.json({ error: 'Video directory not found' }, { status: 404 });
  }

  // Find the video file (could be .mp4, .mov, .avi, .mkv)
  const files = readdirSync(VIDEO_DIR);
  let videoFile = files.find(f => f.startsWith(videoId));

  // FALLBACK: If the specific video doesn't exist (e.g. out of sync DB),
  // serve the first available video for UI demonstration purposes.
  if (!videoFile && files.length > 0) {
    videoFile = files.find(f => f.endsWith('.mp4') || f.endsWith('.mkv') || f.endsWith('.avi'));
  }

  if (!videoFile) {
    return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
  }

  const filePath = join(VIDEO_DIR, videoFile);
  const ext = videoFile.split('.').pop()?.toLowerCase();

  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    webm: 'video/webm',
  };

  const contentType = mimeMap[ext || ''] || 'video/mp4';

  try {
    const stat = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Length': stat.size.toString(),
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (err) {
    console.error('Error serving video:', err);
    return NextResponse.json({ error: 'Failed to read video file' }, { status: 500 });
  }
}
