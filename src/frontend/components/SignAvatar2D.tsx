"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VSLInfo {
  mouth?: string;
  body?: string;
  head?: string;
  shoulder?: string;
  eyegaze?: string;
  eyebrow?: string;
  eyelids?: string;
  hand?: string;
}

interface Gloss {
  time: number;
  word: string;
  vsl_info: VSLInfo | null;
}

interface Props {
  vslData: Gloss[];
  currentTime: number;
}

// Mapping from HamNoSys to CSS/Transform properties
const HAND_MAPPING: any = {
  shapes: {
    "hamflathand": { x: 0, y: 0 },
    "hamfinger2345": { x: 1, y: 0 },
    "hamfinger2": { x: 2, y: 0 },
    "hamfist": { x: 3, y: 0 },
    "hamindexfinger": { x: 0, y: 1 },
    "hampinchall": { x: 1, y: 1 },
    // Fallback for missing shapes
    "default": { x: 0, y: 0 }
  },
  orientations: {
    "hamextfingeru": { rotate: 0 },
    "hamextfingero": { rotate: 90 },
    "hamextfingerl": { rotate: -90 },
    "hamextfingerr": { rotate: 90 },
    "hamextfingerd": { rotate: 180 },
  },
  palm: {
    "hampalmd": { scaleX: 1, scaleY: 1 },
    "hampalml": { scaleX: -1, scaleY: 1 },
    "hampalmu": { scaleX: 1, scaleY: -1 },
  },
  locations: {
    "hamshoulders": { top: "60%", left: "50%" },
    "hamchest": { top: "75%", left: "50%" },
    "hamhead": { top: "25%", left: "50%" },
    "hamforehead": { top: "20%", left: "50%" },
    "hamnose": { top: "30%", left: "50%" },
    "hammouth": { top: "35%", left: "50%" },
    "hamchin": { top: "40%", left: "50%" },
  }
};

export default function SignAvatar2D({ vslData, currentTime }: Props) {
  const [currentGloss, setCurrentGloss] = useState<Gloss | null>(null);

  useEffect(() => {
    // Find the gloss that matches the current time
    const active = vslData.find((g, i) => {
      const nextTime = vslData[i + 1]?.time || Infinity;
      return currentTime >= g.time && currentTime < nextTime;
    });
    
    if (active && active.vsl_info) {
      setCurrentGloss(active);
    } else {
      if (currentTime > (vslData[vslData.length - 1]?.time || 0) + 1) {
          setCurrentGloss(null);
      }
    }
  }, [currentTime, vslData]);

  if (!currentGloss || !currentGloss.vsl_info) {
    return (
      <div className="relative w-64 h-80 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
         <img src="/assets/avatar/body_base.png" alt="Avatar Body" className="absolute inset-0 w-full h-full object-contain opacity-50" />
         <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-400 italic">Avatar Neutral State</div>
      </div>
    );
  }

  const info = currentGloss.vsl_info;
  const handTags = info.hand?.split(",") || [];
  
  const shapeTag = handTags.find(t => HAND_MAPPING.shapes[t]);
  const orientTag = handTags.find(t => HAND_MAPPING.orientations[t]);
  const palmTag = handTags.find(t => HAND_MAPPING.palm[t]);
  const locTag = handTags.find(t => HAND_MAPPING.locations[t]);

  const shapeConfig = HAND_MAPPING.shapes[shapeTag || "hamflathand"];
  const orientConfig = HAND_MAPPING.orientations[orientTag || "hamextfingeru"];
  const palmConfig = HAND_MAPPING.palm[palmTag || "hampalmd"];
  const locConfig = HAND_MAPPING.locations[locTag || "hamshoulders"];

  return (
    <div className="relative w-64 h-80 bg-white rounded-xl overflow-hidden border-2 border-indigo-100 shadow-lg">
      <img 
        src="/assets/avatar/body_base.png" 
        alt="Avatar Body" 
        className="absolute inset-0 w-full h-full object-contain"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentGloss.word}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1.5, // Larger hands for clarity
            top: locConfig.top,
            left: locConfig.left,
            rotate: orientConfig.rotate,
            scaleX: palmConfig.scaleX,
            scaleY: palmConfig.scaleY
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none overflow-hidden"
        >
          <div 
            className="w-20 h-20 bg-no-repeat mix-blend-multiply" // Use multiply to hide white background
            style={{
              backgroundImage: "url('/assets/avatar/hand_sprites.png')",
              backgroundSize: "400% 400%", // EXACT 4x4 grid
              backgroundPosition: `${(shapeConfig.x * 100) / 3}% ${(shapeConfig.y * 100) / 3}%`
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-2 left-2 right-2 bg-indigo-600/90 text-white text-xs py-1 px-2 rounded-full text-center font-medium shadow-sm">
        {currentGloss.word}
      </div>
    </div>
  );
}
