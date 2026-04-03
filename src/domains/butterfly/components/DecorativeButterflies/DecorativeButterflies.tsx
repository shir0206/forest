"use client";

import { useAppContext } from "../../../context";
import { ANIMATION_TIME_SCALE } from "../../core/constants";
import ButterflyInstance from "./ButterflyInstance";
import type { DecorativeButterfliesProps } from "./types";
import { useAnimationManager } from "./useAnimationManager";

// ─── Component ────────────────────────────────────────────────────────────────

export default function DecorativeButterflies({
  count = 9,
  flyAwayAfterMs = 9000 / ANIMATION_TIME_SCALE,
  cameraPositions,
  spawnAnchor,
  cameraFov = 60,
  cameraTransitionDurationMs = 1000,
  leadSteps = 2,
}: DecorativeButterfliesProps) {
  const appContext = useAppContext();
  if (!appContext) {
    console.error("Decorative Butterflies: AppContext not found");
    return null;
  }
  const { device } = appContext;

  // Use dedicated animation manager hook
  const { activeConfigs, groupRefs, opacityRefs, allGone } =
    useAnimationManager({
      count,
      flyAwayAfterMs,
      cameraPositions,
      spawnAnchor,
      cameraFov,
      cameraTransitionDurationMs,
      leadSteps,
      device,
    });

  if (allGone) return null;

  return (
    <>
      {activeConfigs.map((cfg) => (
        <group
          key={cfg.id}
          ref={(el) => {
            groupRefs.current[cfg.id] = el;
            if (el) el.scale.setScalar(0);
          }}
        >
          <ButterflyInstance
            config={cfg}
            opacityRef={opacityRefs.current[cfg.id]}
          />
        </group>
      ))}
    </>
  );
}
