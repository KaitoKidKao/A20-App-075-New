"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { HandsSignGloss } from "@/lib/api";
import { expandHandsSignSegments } from "@/lib/handsignSegments";
import {
  resolveNumericPose,
  poseForTimeInSegment,
} from "@/lib/handsignPose";

interface Props {
  vslData: HandsSignGloss[];
  currentTime: number;
}

function LiveCaption({ text }: { text: string }) {
  return (
    <span className="sr-only" aria-live="polite" aria-atomic="true">
      {text}
    </span>
  );
}

export default function SignAvatar2D({ vslData, currentTime }: Props) {
  const segments = useMemo(() => expandHandsSignSegments(vslData), [vslData]);

  const activeIdx = useMemo(() => {
    if (!segments.length) return -1;
    const i = segments.findIndex((s) => currentTime >= s.start && currentTime < s.end);
    return i;
  }, [currentTime, segments]);

  const blendedPose = useMemo(() => {
    if (activeIdx < 0) return null;
    const seg = segments[activeIdx];
    const prevVi = activeIdx > 0 ? segments[activeIdx - 1].vsl_info : null;
    const posePrev = resolveNumericPose(prevVi ?? undefined);
    const poseCurr = resolveNumericPose(seg.vsl_info ?? undefined);
    if (!poseCurr.hasHand) return { pose: poseCurr, seg, hasHand: false as const };
    const pose = poseForTimeInSegment(currentTime, seg, posePrev, poseCurr);
    return { pose, seg, hasHand: true as const };
  }, [activeIdx, currentTime, segments]);

  const ariaLabel = useMemo(() => {
    if (!blendedPose) return "Không có gloss thủ ngữ tại mốc thời gian hiện tại.";
    const w = blendedPose.seg.word.replace(/_/g, " ");
    if (!blendedPose.hasHand) return `Gloss: ${w}. Chưa có mã tư thế tay trong từ điển.`;
    return `Gloss thủ ngữ: ${w}. Minh họa tư thế tay 2D (nội suy mượt).`;
  }, [blendedPose]);

  if (!blendedPose) {
    return (
      <figure
        className="relative w-64 h-80 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner m-0"
        aria-label="Nhận vật thủ ngữ VSL — trạng thái nghỉ"
      >
        <LiveCaption text={ariaLabel} />
        <Image src="/assets/avatar/body_base.png" alt="" fill className="object-contain opacity-50" />
        <figcaption className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-400 italic px-2">
          Avatar Neutral State
        </figcaption>
      </figure>
    );
  }

  const displayWord = blendedPose.seg.word.replace(/_/g, " ");

  if (!blendedPose.hasHand) {
    return (
      <figure
        className="relative w-64 h-80 bg-white rounded-xl overflow-hidden border-2 border-indigo-100 shadow-lg m-0"
        aria-label={`Gloss VSL: ${displayWord}`}
      >
        <LiveCaption text={ariaLabel} />
        <Image src="/assets/avatar/body_base.png" alt="" fill className="object-contain opacity-90" />
        <figcaption className="absolute bottom-2 left-2 right-2 space-y-1">
          <div className="bg-indigo-600/90 text-white text-xs py-1 px-2 rounded-full text-center font-medium shadow-sm">
            {displayWord}
          </div>
          <p className="text-[10px] text-center text-slate-500 px-1">
            Gloss chưa có mã tư thế trong từ điển — chỉ hiển thị từ khóa.
          </p>
        </figcaption>
      </figure>
    );
  }

  const p = blendedPose.pose;
  const bgX = (p.shapeX * 100) / 3;
  const bgY = (p.shapeY * 100) / 3;

  return (
    <figure
      className="relative w-64 h-80 bg-white rounded-xl overflow-hidden border-2 border-indigo-100 shadow-lg m-0"
      aria-label={`Minh họa tay ký hiệu cho gloss: ${displayWord}`}
    >
      <LiveCaption text={ariaLabel} />
      <Image src="/assets/avatar/body_base.png" alt="" fill className="object-contain" />

      <motion.div
        key={blendedPose.seg.start}
        initial={false}
        animate={{
          opacity: 1,
          top: `${p.topPct}%`,
          left: `${p.leftPct}%`,
          rotate: p.rotate,
          scaleX: p.scaleX,
          scaleY: p.scaleY,
        }}
        transition={{ type: 'tween', duration: 0.08, ease: 'linear' }}
        className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none overflow-hidden will-change-transform"
      >
        <div
          className="w-20 h-20 bg-no-repeat mix-blend-multiply"
          role="presentation"
          style={{
            backgroundImage: "url('/assets/avatar/hand_sprites.png')",
            backgroundSize: '400% 400%',
            backgroundPosition: `${bgX}% ${bgY}%`,
          }}
        />
      </motion.div>

      <figcaption className="absolute bottom-2 left-2 right-2 bg-indigo-600/90 text-white text-xs py-1 px-2 rounded-full text-center font-medium shadow-sm">
        {displayWord}
      </figcaption>
    </figure>
  );
}
