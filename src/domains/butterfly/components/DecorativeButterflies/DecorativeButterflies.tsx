"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

import { ANIMATION_TIME_SCALE } from "../../../../components/3d/ForestScene/butterfly/constants";
import { useAppContext } from "../../../../shared/contexts/AppContext";
import ButterflyInstance from "./ButterflyInstance";
import type { ButterflyRuntime, DecorativeButterfliesProps } from "./types";
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

  const bounds = BOUNDS[device.toUpperCase() as keyof typeof BOUNDS];

  const spawnAnchorVec = useMemo(
    () => new THREE.Vector3(spawnAnchor[0], spawnAnchor[1], spawnAnchor[2]),
    [spawnAnchor[0], spawnAnchor[1], spawnAnchor[2]]
  );

  const configs = useMemo(
    () => createButterflyConfigs(count, bounds),
    [count, device]
  );

  const allRuntimes = useRef<ButterflyRuntime[]>(
    configs.map((cfg) =>
      createButterflyRuntime(
        cfg,
        bounds,
        cameraPositions,
        cameraTransitionDurationMs,
        spawnAnchorVec,
        cameraFov,
        leadSteps
      )
    )
  );

  const groupRefs = useRef<(THREE.Group | null)[]>(Array(count).fill(null));
  const opacityRefs = useRef<React.MutableRefObject<number>[]>(
    configs.map(() => ({ current: 0 }))
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

  if (goneIds.size >= count) return null;

  return (
    <>
      {configs
        .filter((cfg) => !goneIds.has(cfg.id))
        .map((cfg) => (
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
