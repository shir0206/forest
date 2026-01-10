("use client");
import { useEffect, useRef } from "react";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";

type Props = {
  isAboutOpen: boolean;
};

export default function CinematicEffects({ isAboutOpen }: Props) {
  const dofRef = useRef<any>(null);
  const { camera } = useThree();

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
        focusDistance={0.02} // lock focus
        focalLength={0.01} // animated via GSAP
        bokehScale={0} // animated via GSAP
        height={480}
      />
    </EffectComposer>
  );
}
