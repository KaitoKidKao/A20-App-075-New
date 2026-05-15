import type { HandsSignGloss, HandsSignSegment, VSLInfo } from '@/lib/api';

/**
 * Khớp logic backend `expand_handsign_segments`.
 */
export function expandHandsSignSegments(
  glosses: HandsSignGloss[],
  tailHoldSeconds = 1.5,
  minSegmentSeconds = 0.35
): HandsSignSegment[] {
  if (!glosses.length) return [];
  const items = [...glosses].sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
  return items.map((g, i) => {
    const t0 = Number(g.time) || 0;
    let t1: number;
    if (i + 1 < items.length) {
      t1 = Number(items[i + 1].time) || 0;
    } else {
      t1 = t0 + tailHoldSeconds;
    }
    if (t1 <= t0) t1 = t0 + minSegmentSeconds;
    const vi = g.vsl_info;
    const hand = vi && typeof vi === 'object' && 'hand' in vi ? (vi as VSLInfo).hand : undefined;
    return {
      start: t0,
      end: t1,
      word: g.word,
      vsl_info: g.vsl_info,
      hamnosys_hand: hand ?? null,
    };
  });
}
