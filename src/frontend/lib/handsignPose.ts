import type { VSLInfo } from '@/lib/api';

export const HAND_MAPPING: Record<string, Record<string, Record<string, number | string>>> = {
  shapes: {
    hamflathand: { x: 0, y: 0 },
    hamfinger2345: { x: 1, y: 0 },
    hamfinger2: { x: 2, y: 0 },
    hamfist: { x: 3, y: 0 },
    hamindexfinger: { x: 0, y: 1 },
    hampinchall: { x: 1, y: 1 },
    hampinch12: { x: 1, y: 1 },
    hamceeall: { x: 0, y: 0 },
    hamceep: { x: 0, y: 0 },
    hamspreadfinger: { x: 1, y: 0 },
    default: { x: 0, y: 0 },
  },
  orientations: {
    hamextfingeru: { rotate: 0 },
    hamextfingero: { rotate: 90 },
    hamextfingerl: { rotate: -90 },
    hamextfingerr: { rotate: 90 },
    hamextfingerd: { rotate: 180 },
    hamextfingeruo: { rotate: 45 },
    hamextfingerdo: { rotate: 135 },
    hamextfingerul: { rotate: -45 },
  },
  palm: {
    hampalmd: { scaleX: 1, scaleY: 1 },
    hampalml: { scaleX: -1, scaleY: 1 },
    hampalmu: { scaleX: 1, scaleY: -1 },
    hampalmdl: { scaleX: -1, scaleY: 1 },
    hampalmr: { scaleX: -1, scaleY: 1 },
  },
  locations: {
    hamshoulders: { top: '60%', left: '50%' },
    hamchest: { top: '75%', left: '50%' },
    hamhead: { top: '25%', left: '50%' },
    hamforehead: { top: '20%', left: '50%' },
    hamnose: { top: '30%', left: '50%' },
    hammouth: { top: '35%', left: '50%' },
    hamchin: { top: '40%', left: '50%' },
    hamwrist: { top: '68%', left: '52%' },
    hamear: { top: '28%', left: '38%' },
    hamcheek: { top: '34%', left: '44%' },
  },
};

const HAND_SCALE = 1.5;

export interface NumericHandPose {
  topPct: number;
  leftPct: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  shapeX: number;
  shapeY: number;
  hasHand: boolean;
}

function parsePct(s: string): number {
  const n = parseFloat(String(s).replace('%', '').trim());
  return Number.isFinite(n) ? n : 50;
}

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  let d = (((b - a) % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return a + d * t;
}

export function resolveNumericPose(vsl: VSLInfo | null | undefined): NumericHandPose {
  const empty: NumericHandPose = {
    topPct: 60,
    leftPct: 50,
    rotate: 0,
    scaleX: HAND_SCALE,
    scaleY: HAND_SCALE,
    shapeX: 0,
    shapeY: 0,
    hasHand: false,
  };
  if (!vsl?.hand) return empty;

  const handTags = vsl.hand.split(',');
  const shapeTag = handTags.find((x) => x in HAND_MAPPING.shapes) || 'hamflathand';
  const orientTag = handTags.find((x) => x in HAND_MAPPING.orientations) || 'hamextfingeru';
  const palmTag = handTags.find((x) => x in HAND_MAPPING.palm) || 'hampalmd';
  const locTag = handTags.find((x) => x in HAND_MAPPING.locations) || 'hamshoulders';

  const shape = HAND_MAPPING.shapes[shapeTag] as { x: number; y: number };
  const orient = HAND_MAPPING.orientations[orientTag] as { rotate: number };
  const palm = HAND_MAPPING.palm[palmTag] as { scaleX: number; scaleY: number };
  const loc = HAND_MAPPING.locations[locTag] as { top: string; left: string };

  return {
    topPct: parsePct(loc.top),
    leftPct: parsePct(loc.left),
    rotate: orient.rotate,
    scaleX: Number(palm.scaleX) * HAND_SCALE,
    scaleY: Number(palm.scaleY) * HAND_SCALE,
    shapeX: shape.x,
    shapeY: shape.y,
    hasHand: true,
  };
}

export function lerpNumericPose(a: NumericHandPose, b: NumericHandPose, t: number): NumericHandPose {
  const u = clamp01(t);
  return {
    topPct: lerp(a.topPct, b.topPct, u),
    leftPct: lerp(a.leftPct, b.leftPct, u),
    rotate: lerpAngle(a.rotate, b.rotate, u),
    scaleX: lerp(a.scaleX, b.scaleX, u),
    scaleY: lerp(a.scaleY, b.scaleY, u),
    shapeX: lerp(a.shapeX, b.shapeX, u),
    shapeY: lerp(a.shapeY, b.shapeY, u),
    hasHand: a.hasHand || b.hasHand,
  };
}

/**
 * Giai đoạn 0: trong đoạn [start,end], phần đầu (transitionRatio) nội suy từ pose trước → pose hiện tại.
 */
export function poseForTimeInSegment(
  currentTime: number,
  seg: { start: number; end: number },
  posePrev: NumericHandPose,
  poseCurr: NumericHandPose,
  transitionRatio = 0.28
): NumericHandPose {
  const dur = seg.end - seg.start || 0.001;
  const u = clamp01((currentTime - seg.start) / dur);
  if (u <= transitionRatio) {
    const k = transitionRatio < 1e-6 ? 1 : smoothstep(u / transitionRatio);
    return lerpNumericPose(posePrev, poseCurr, k);
  }
  return poseCurr;
}
