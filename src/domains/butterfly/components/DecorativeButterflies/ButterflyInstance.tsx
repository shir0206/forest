import React from "react";

import ButterflyWebGL from "../../../../components/3d/ForestScene/butterfly/ButterflyWebGL";
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
      flapDurationMs={
        (config.flapDuration.left + config.flapDuration.right) / 2
      }
      opacityRef={opacityRef}
      timeOffset={config.wave.phaseOffset}
      flipPetals={false}
      mirrorX={false}
      useDecorativePose
    />
  );
}
