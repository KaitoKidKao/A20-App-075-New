"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { HandsSignGloss } from "@/lib/api";

interface Props {
  vslData: HandsSignGloss[];
  currentTime: number;
}

const HAND_SCALE = 1.5;

// Mapping HamNoSys → sprite / transform (bổ sung dần theo từ điển VSL)
const HAND_MAPPING: Record<string, Record<string, Record<string, number | string>>> = {
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
    hamshoulders: { top: "60%", left: "50%" },
    hamchest: { top: "75%", left: "50%" },
    hamhead: { top: "25%", left: "50%" },
    hamforehead: { top: "20%", left: "50%" },
    hamnose: { top: "30%", left: "50%" },
    hammouth: { top: "35%", left: "50%" },
    hamchin: { top: "40%", left: "50%" },
    hamwrist: { top: "68%", left: "52%" },
    hamear: { top: "28%", left: "38%" },
    hamcheek: { top: "34%", left: "44%" },
  },
};

function LiveCaption({ text }: { text: string }) {
  return (
    <span className="sr-only" aria-live="polite" aria-atomic="true">
      {text}
    </span>
  );
}

export default function SignAvatar2D({ vslData, currentTime }: Props) {
  const currentGloss = useMemo(() => {
    if (!vslData.length) return null;
    const active = vslData.find((g, i) => {
      const nextTime = vslData[i + 1]?.time ?? Infinity;
      return currentTime >= g.time && currentTime < nextTime;
    });
    return active ?? null;
  }, [currentTime, vslData]);

  const ariaLabel = useMemo(() => {
    if (!currentGloss) return "Không có gloss thủ ngữ tại mốc thời gian hiện tại.";
    const w = currentGloss.word.replace(/_/g, " ");
    if (!currentGloss.vsl_info?.hand) return `Gloss: ${w}. Chưa có mã tư thế tay trong từ điển.`;
    return `Gloss thủ ngữ: ${w}. Minh họa tư thế tay 2D.`;
  }, [currentGloss]);

  if (!currentGloss) {
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

  if (!currentGloss.vsl_info?.hand) {
    const display = currentGloss.word.replace(/_/g, " ");
    return (
      <figure
        className="relative w-64 h-80 bg-white rounded-xl overflow-hidden border-2 border-indigo-100 shadow-lg m-0"
        aria-label={`Gloss VSL: ${display}`}
      >
        <LiveCaption text={ariaLabel} />
        <Image src="/assets/avatar/body_base.png" alt="" fill className="object-contain opacity-90" />
        <figcaption className="absolute bottom-2 left-2 right-2 space-y-1">
          <div className="bg-indigo-600/90 text-white text-xs py-1 px-2 rounded-full text-center font-medium shadow-sm">
            {display}
          </div>
          <p className="text-[10px] text-center text-slate-500 px-1">
            Gloss chưa có mã tư thế trong từ điển — chỉ hiển thị từ khóa.
          </p>
        </figcaption>
      </figure>
    );
  }

  const info = currentGloss.vsl_info;
  const handTags = info.hand?.split(",") || [];

  const shapeTag = handTags.find((t) => t in HAND_MAPPING.shapes);
  const orientTag = handTags.find((t) => t in HAND_MAPPING.orientations);
  const palmTag = handTags.find((t) => t in HAND_MAPPING.palm);
  const locTag = handTags.find((t) => t in HAND_MAPPING.locations);

  const shapeConfig = HAND_MAPPING.shapes[shapeTag || "hamflathand"] as { x: number; y: number };
  const orientConfig = HAND_MAPPING.orientations[orientTag || "hamextfingeru"] as { rotate: number };
  const palmConfig = HAND_MAPPING.palm[palmTag || "hampalmd"] as { scaleX: number; scaleY: number };
  const locConfig = HAND_MAPPING.locations[locTag || "hamshoulders"] as { top: string; left: string };

  const displayWord = currentGloss.word.replace(/_/g, " ");

  return (
    <figure
      className="relative w-64 h-80 bg-white rounded-xl overflow-hidden border-2 border-indigo-100 shadow-lg m-0"
      aria-label={`Minh họa tay ký hiệu cho gloss: ${displayWord}`}
    >
      <LiveCaption text={ariaLabel} />
      <Image src="/assets/avatar/body_base.png" alt="" fill className="object-contain" />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentGloss.word}-${currentGloss.time}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            top: locConfig.top,
            left: locConfig.left,
            rotate: orientConfig.rotate,
            scaleX: palmConfig.scaleX * HAND_SCALE,
            scaleY: palmConfig.scaleY * HAND_SCALE,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none overflow-hidden will-change-transform"
        >
          <div
            className="w-20 h-20 bg-no-repeat mix-blend-multiply"
            role="presentation"
            style={{
              backgroundImage: "url('/assets/avatar/hand_sprites.png')",
              backgroundSize: "400% 400%",
              backgroundPosition: `${(shapeConfig.x * 100) / 3}% ${(shapeConfig.y * 100) / 3}%`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      <figcaption className="absolute bottom-2 left-2 right-2 bg-indigo-600/90 text-white text-xs py-1 px-2 rounded-full text-center font-medium shadow-sm">
        {displayWord}
      </figcaption>
    </figure>
  );
}
