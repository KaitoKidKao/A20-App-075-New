import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import { Readable } from 'stream';
import { join, resolve } from 'path';

const VIDEO_DIR = resolve(process.cwd(), '..', '..', 'data', 'uploads', 'videos');
const CHUNK_SIZE = 1024 * 1024; // 1 MB

function getVideoContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    webm: 'video/webm',
  };
  return mimeMap[ext || ''] || 'video/mp4';
}

function parseRange(rangeHeader: string, fileSize: number): { start: number; end: number } | null {
  const matches = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!matches) return null;

  const startStr = matches[1];
  const endStr = matches[2];

  if (!startStr && !endStr) return null;

  if (!startStr) {
    const suffixLength = Number(endStr);
    if (Number.isNaN(suffixLength) || suffixLength <= 0) return null;
    const start = Math.max(fileSize - suffixLength, 0);
    return { start, end: fileSize - 1 };
  }

  const start = Number(startStr);
  if (Number.isNaN(start) || start < 0 || start >= fileSize) return null;

  let end = endStr ? Number(endStr) : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
  if (Number.isNaN(end) || end < start) return null;
  end = Math.min(end, fileSize - 1);

  return { start, end };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  if (!fs.existsSync(VIDEO_DIR)) {
    return NextResponse.json({ error: 'Video directory not found' }, { status: 404 });
  }

  const files = fs.readdirSync(VIDEO_DIR);
  let videoFile = files.find((f) => f.startsWith(videoId));

  if (!videoFile && files.length > 0) {
    videoFile = files.find((f) => f.endsWith('.mp4') || f.endsWith('.mkv') || f.endsWith('.avi'));
  }

  if (!videoFile) {
    return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
  }

  const filePath = join(VIDEO_DIR, videoFile);
  const contentType = getVideoContentType(videoFile);

  try {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    if (!rangeHeader) {
      const stream = fs.createReadStream(filePath);
      return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    const range = parseRange(rangeHeader, fileSize);
    if (!range) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${fileSize}`,
          'Accept-Ranges': 'bytes',
        },
      });
    }

    const { start, end } = range;
    const contentLength = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength.toString(),
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (err) {
    console.error('Error serving video:', err);
    return NextResponse.json({ error: 'Failed to stream video file' }, { status: 500 });
  }
}

