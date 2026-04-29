import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'http://localhost:8000';

// Convert seconds to VTT timestamp format: HH:MM:SS.mmm
function toVTTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  try {
    // Fetch transcript from BE
    const res = await fetch(`${API_BASE}/api/videos/${videoId}/transcript`);
    const data = await res.json();

    if (!data.segments || data.segments.length === 0) {
      // Return empty VTT if no transcript
      const emptyVTT = 'WEBVTT\n\n';
      return new NextResponse(emptyVTT, {
        status: 200,
        headers: { 'Content-Type': 'text/vtt; charset=utf-8' },
      });
    }

    // Build WebVTT content
    let vtt = 'WEBVTT\n\n';

    data.segments.forEach((seg: { start: number; end: number; text: string }, i: number) => {
      vtt += `${i + 1}\n`;
      vtt += `${toVTTTime(seg.start)} --> ${toVTTTime(seg.end)}\n`;
      vtt += `${seg.text.trim()}\n\n`;
    });

    return new NextResponse(vtt, {
      status: 200,
      headers: {
        'Content-Type': 'text/vtt; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Error generating VTT:', err);
    const fallback = 'WEBVTT\n\n';
    return new NextResponse(fallback, {
      status: 200,
      headers: { 'Content-Type': 'text/vtt; charset=utf-8' },
    });
  }
}
