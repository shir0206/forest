("use client");
import { useEffect, useRef } from "react";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";

import gsap from "gsap";
import { DepthOfFieldEffect } from "postprocessing";

type Props = {
  isAboutOpen: boolean;
};

export default function CinematicEffects({ isAboutOpen }: Props) {
  const dofRef = useRef<DepthOfFieldEffect>(null);

  useEffect(() => {
    if (!dofRef.current) return;

    gsap.to(dofRef.current, {
      focalLength: isAboutOpen ? 0.06 : 0.01,
      bokehScale: isAboutOpen ? 6 : 0,
      duration: 0.8,
      ease: "power2.out",
    });
  }, [isAboutOpen]);

  return (
    <EffectComposer>
      <DepthOfField
        ref={dofRef}
        focusDistance={0.02}
        focalLength={0.01}
        bokehScale={0}
        height={480}
      />
    </EffectComposer>
  );
}
