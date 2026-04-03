import React from "react";

import { ButterflyWebGL } from "../ButterflyWebGL";
import type { ButterflyConfig } from "./types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ButterflyInstanceProps {
  config: ButterflyConfig;
  opacityRef: React.MutableRefObject<number>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ButterflyInstance({
  config,
  opacityRef,
}: ButterflyInstanceProps): React.JSX.Element {
  return (
    <ButterflyWebGL
      animation={{
        flapDurationMs:
          (config.flapDuration.left + config.flapDuration.right) / 2,
        timeOffset: config.wave.phaseOffset,
      }}
      visual={{
        flipPetals: false,
        mirrorX: false,
        useDecorativePose: true,
      }}
      opacityRef={opacityRef}
    />
  );
}
