import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

import type {
  ButterflyConfig,
  ButterflyRuntime,
  DecorativeButterfliesProps,
} from "./types";
import { BOUNDS, PHASE } from "./types";
import {
  applyOpacity,
  applyScale,
  tickFlyingAway,
  tickGathering,
  tickSpawning,
  tickSwarming,
  tickWandering,
} from "./useButterfliesPhase";
import {
  createButterflyConfigs,
  createButterflyRuntime,
} from "./useButterflyRuntime";

interface UseAnimationManagerProps {
  count: number;
  flyAwayAfterMs: number;
  cameraPositions: DecorativeButterfliesProps["cameraPositions"];
  spawnAnchor: DecorativeButterfliesProps["spawnAnchor"];
  cameraFov: number;
  cameraTransitionDurationMs: number;
  leadSteps: number;
  device: string;
}

/**
 * Dedicated animation manager hook for decorative butterflies
 * Handles all animation phases, fly-away triggers, and frame updates
 */
export function useAnimationManager({
  count,
  flyAwayAfterMs,
  cameraPositions,
  spawnAnchor,
  cameraFov,
  cameraTransitionDurationMs,
  leadSteps,
  device,
}: UseAnimationManagerProps) {
  const bounds = BOUNDS[device.toUpperCase() as keyof typeof BOUNDS];

  const spawnAnchorVec = useRef(
    new THREE.Vector3(spawnAnchor[0], spawnAnchor[1], spawnAnchor[2])
  );

  // Update spawn anchor if it changes
  useEffect(() => {
    spawnAnchorVec.current.set(spawnAnchor[0], spawnAnchor[1], spawnAnchor[2]);
  }, [spawnAnchor]);

  const configs = useRef<ButterflyConfig[]>(
    createButterflyConfigs(count, bounds)
  );

  const allRuntimes = useRef<ButterflyRuntime[]>(
    configs.current.map((cfg) =>
      createButterflyRuntime(
        cfg,
        bounds,
        cameraPositions,
        cameraTransitionDurationMs,
        spawnAnchorVec.current,
        cameraFov,
        leadSteps
      )
    )
  );

  const groupRefs = useRef<(THREE.Group | null)[]>(Array(count).fill(null));
  const opacityRefs = useRef<React.MutableRefObject<number>[]>(
    configs.current.map(() => ({ current: 0 }))
  );

  const [goneIds, setGoneIds] = useState<Set<number>>(new Set());

  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  // ─── Fly-away trigger ──────────────────────────────────────────────────────

  useEffect(() => {
    const outerTimer = setTimeout(() => {
      allRuntimes.current.forEach((runtime) => {
        if (!runtime.active) return;

        const innerTimer = setTimeout(() => {
          const group = groupRefs.current[runtime.config.id];
          if (!group || !runtime.active) return;

          runtime.flyAwayOrigin = group.position.clone();
          runtime.flyAwayElapsed = 0;
          runtime.currentPhase = PHASE.FLY_AWAY;
          runtime.phaseElapsed = 0;
        }, runtime.config.flyAwayDelay * 1000);

        runtime.flyAwayTimer = innerTimer;
      });
    }, flyAwayAfterMs);

    return () => {
      clearTimeout(outerTimer);
      allRuntimes.current.forEach((runtime) => {
        if (runtime.flyAwayTimer !== undefined) {
          clearTimeout(runtime.flyAwayTimer);
        }
      });
    };
  }, [flyAwayAfterMs]);

  // ─── Single frame loop ─────────────────────────────────────────────────────

  useFrame(({ camera }, delta) => {
    for (let i = 0; i < allRuntimes.current.length; i++) {
      const runtime = allRuntimes.current[i];
      if (!runtime.active) continue;

      const group = groupRefs.current[i];
      if (!group) continue;

      runtime.totalElapsed += delta;
      runtime.phaseElapsed += delta;

      const opRef = opacityRefs.current[i];
      const bds = boundsRef.current;

      switch (runtime.currentPhase) {
        case PHASE.SPAWN: {
          const done = tickSpawning(
            group,
            runtime.phaseElapsed,
            runtime.spawnOrigin,
            runtime.wanderTarget,
            runtime.config.wave,
            runtime.config.visualScale,
            (v) => applyOpacity(v, runtime, opRef),
            (v) => applyScale(v, runtime, group)
          );
          if (done) {
            applyScale(runtime.config.visualScale, runtime, group);
            runtime.currentPhase = PHASE.WANDER;
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case PHASE.WANDER: {
          const done = tickWandering(
            group,
            runtime.phaseElapsed,
            runtime.wanderTarget,
            runtime.config.wave,
            bds.wanderOrbitRadius,
            runtime.wanderYRange,
            (v) => applyOpacity(v, runtime, opRef)
          );
          if (done) {
            runtime.currentPhase = PHASE.GATHER;
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case PHASE.GATHER: {
          const done = tickGathering(
            group,
            runtime.phaseElapsed,
            runtime.swarmCenter,
            runtime.config.wave
          );
          if (done) {
            runtime.currentPhase = PHASE.SWARM;
            runtime.phaseElapsed = 0;
          }
          break;
        }

        case PHASE.SWARM: {
          tickSwarming(
            group,
            runtime.phaseElapsed,
            runtime.totalElapsed,
            runtime.swarmCenter,
            runtime.config.swarmSlot,
            runtime.config.wave,
            runtime.config.bobFrequency,
            runtime.config.bobAmplitude
          );
          break;
        }

        case PHASE.FLY_AWAY: {
          if (!runtime.flyAwayOrigin) break;
          runtime.flyAwayElapsed += delta;
          tickFlyingAway({
            group,
            flyAwayElapsed: runtime.flyAwayElapsed,
            flyAwayDuration: runtime.flyAwayDuration,
            flyAwayStart: runtime.flyAwayOrigin,
            flyAwayTarget: runtime.flyAwayDestination,
            wave: runtime.config.wave,
            setSmoothedOpacity: (next) => applyOpacity(next, runtime, opRef),
            onComplete: () => {
              runtime.active = false;
              setGoneIds((prev) => new Set(prev).add(runtime.config.id));
            },
          });
          break;
        }
      }

      // ── Billboard: always face the camera ────────────────────────────────
      group.quaternion.copy(camera.quaternion);
    }
  });

  // Filter out gone butterflies
  const activeConfigs = configs.current.filter((cfg) => !goneIds.has(cfg.id));

  return {
    activeConfigs,
    groupRefs,
    opacityRefs,
    goneIds,
    allGone: goneIds.size >= count,
  };
}
