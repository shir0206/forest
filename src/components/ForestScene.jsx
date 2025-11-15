// "use client";
// import React, { useRef, useEffect, Suspense, useState, useMemo } from "react";
// import { Canvas, useThree } from "@react-three/fiber";
// import {
//   OrbitControls,
//   Environment,
//   Html,
//   useProgress,
//   TransformControls,
// } from "@react-three/drei";
// import * as THREE from "three";
// import gsap from "gsap";

// function Loader() {
//   const { progress } = useProgress();
//   return <Html center>{progress.toFixed(0)} % loaded</Html>;
// }

// function useDynamicFov(controlsRef) {
//   const { camera } = useThree();
//   const [lastDistance, setLastDistance] = useState(null);

//   useEffect(() => {
//     const controls = controlsRef.current;
//     if (!controls) return;

//     const updateFov = () => {
//       const distance = controls.getDistance();
//       if (lastDistance === null) {
//         setLastDistance(distance);
//         return;
//       }

//       const delta = distance - lastDistance;
//       let newFov = camera.fov + delta * 1.2;
//       newFov = THREE.MathUtils.clamp(newFov, 10, 100);

//       camera.fov = newFov;
//       camera.updateProjectionMatrix();

//       setLastDistance(distance);
//     };

//     controls.addEventListener("change", updateFov);
//     return () => controls.removeEventListener("change", updateFov);
//   }, [camera, controlsRef, lastDistance]);
// }

// function CameraControls({ runIntro }) {
//   const controls = useRef();
//   const { camera, gl } = useThree();

//   useDynamicFov(controls);

//   useEffect(() => {
//     const c = controls.current;

//     const handleChange = () => {
//       console.log("📍 position:", camera.position.toArray());
//       console.log("🎥 fov:", camera.fov.toFixed(2));
//     };

//     c.addEventListener("change", handleChange);
//     return () => c.removeEventListener("change", handleChange);
//   }, [camera]);

//   useEffect(() => {
//     if (!runIntro) return;
//     const c = controls.current;
//     c.enabled = false;

//     const points = [
//       new THREE.Vector3(-0.0069, -0.9996, -0.0255),
//       new THREE.Vector3(-0.0386, -0.9987, -0.0331),
//       new THREE.Vector3(-0.7787, -0.056, -0.6249),
//       new THREE.Vector3(-0.5161, 0.1915, 0.8348),
//       new THREE.Vector3(0.593, 0.1627, 0.7885),
//     ];

//     const tl = gsap.timeline({
//       onComplete: () => {
//         c.enabled = true;
//         console.log("🎬 Intro animation finished — user control restored");
//       },
//     });

//     points.forEach((p) => {
//       tl.to(camera.position, {
//         x: p.x,
//         y: p.y,
//         z: p.z,
//         duration: 3,
//         ease: "power1.inOut",
//         onUpdate: () => {
//           camera.lookAt(0, 0, 0);
//           camera.updateProjectionMatrix();
//           c.update();
//         },
//       });
//     });
//   }, [runIntro]);

//   return (
//     <OrbitControls
//       ref={controls}
//       args={[camera, gl.domElement]}
//       enableZoom={true}
//       enablePan={true}
//       zoomSpeed={0.6}
//       rotateSpeed={0.8}
//       minDistance={1}
//       maxDistance={20}
//     />
//   );
// }
// function PositionedButton({ position }) {
//   const texture = useMemo(() => {
//     const canvas = document.createElement("canvas");
//     canvas.width = 256;
//     canvas.height = 128;
//     const ctx = canvas.getContext("2d");

//     // רקע של כפתור
//     ctx.fillStyle = "#ffffff";
//     ctx.roundRect(0, 0, 256, 128, 64);
//     ctx.fill();

//     // טקסט
//     ctx.fillStyle = "#000000";
//     ctx.font = "bold 40px sans-serif";
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.fillText("לחץ כאן", 128, 64);

//     const tex = new THREE.CanvasTexture(canvas);
//     tex.needsUpdate = true;
//     return tex;
//   }, []);

//   return (
//     <mesh
//       position={new THREE.Vector3(...position)}
//       onClick={() => alert("🎯 לחצת על הכפתור!")}
//     >
//       <planeGeometry args={[0.25, 0.12]} /> {/* גודל פיזי של הכפתור */}
//       <meshBasicMaterial map={texture} transparent={true} toneMapped={false} />
//     </mesh>
//   );
// }

// export default function ForestScene() {
//   const [runIntro, setRunIntro] = useState(true);

//   return (
//     <div className="w-full h-screen bg-black">
//       <Canvas
//         style={{ width: "100vw", height: "100vh" }}
//         camera={{
//           position: [-0.0069, -0.9996, -0.0255],
//           fov: 60,
//           aspect: window.innerWidth / window.innerHeight,
//         }}
//       >
//         <Suspense fallback={<Loader />}>
//           <Environment
//             files="./hdri/Gemini_Generated_Image_oo7v4roo7v4roo7v_upscayl_2x_digital-art-4x.done2(5).exr"
//             background={true}
//           />
//           <CameraControls runIntro={runIntro} />
//           <PositionedButton
//             position={[
//               -0.5727975959985635, 0.06083208113596738, -0.4365143508459205,
//             ]}
//           />
//         </Suspense>
//       </Canvas>
//     </div>
//   );
// }

"use client";
import React, { useRef, useEffect, Suspense, useState, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html, // ייבוא רכיב Html
  useProgress,
  TransformControls,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// קומפוננטת טעינה
function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)} % loaded</Html>;
}

// Hook לשינוי דינמי של שדה הראייה (FOV)
function useDynamicFov(controlsRef) {
  const { camera } = useThree();
  const [lastDistance, setLastDistance] = useState(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const updateFov = () => {
      const distance = controls.getDistance();
      if (lastDistance === null) {
        setLastDistance(distance);
        return;
      }

      const delta = distance - lastDistance;
      // נשנה את ה-FOV בהתאם לשינוי מרחק הזום
      let newFov = camera.fov + delta * 1.2;
      newFov = THREE.MathUtils.clamp(newFov, 10, 100);

      camera.fov = newFov;
      camera.updateProjectionMatrix();

      setLastDistance(distance);
    };

    controls.addEventListener("change", updateFov);
    return () => controls.removeEventListener("change", updateFov);
  }, [camera, controlsRef, lastDistance]);
}

// קומפוננטת השליטה במצלמה
function CameraControls({ runIntro }) {
  const controls = useRef();
  const { camera, gl } = useThree();

  // שימוש ב-Hook לשינוי FOV
  useDynamicFov(controls);

  // לוג של מיקום המצלמה וה-FOV
  useEffect(() => {
    const c = controls.current;

    const handleChange = () => {
      console.log("📍 position:", camera.position.toArray());
      console.log("🎥 fov:", camera.fov.toFixed(2));
    };

    c.addEventListener("change", handleChange);
    return () => c.removeEventListener("change", handleChange);
  }, [camera]);

  // אנימציית המבוא (Intro) באמצעות GSAP
  useEffect(() => {
    if (!runIntro) return;
    const c = controls.current;
    c.enabled = false; // השבתת שליטת המשתמש במהלך האנימציה

    const points = [
      new THREE.Vector3(-0.0069, -0.9996, -0.0255),
      new THREE.Vector3(-0.0386, -0.9987, -0.0331),
      new THREE.Vector3(-0.7787, -0.056, -0.6249),
      new THREE.Vector3(-0.5161, 0.1915, 0.8348),
      new THREE.Vector3(0.593, 0.1627, 0.7885),
    ];

    const tl = gsap.timeline({
      onComplete: () => {
        c.enabled = true; // החזרת שליטת המשתמש
        console.log("🎬 Intro animation finished — user control restored");
      },
    });

    points.forEach((p) => {
      tl.to(camera.position, {
        x: p.x,
        y: p.y,
        z: p.z,
        duration: 3,
        ease: "power1.inOut",
        onUpdate: () => {
          // לוודא שהמצלמה ממשיכה להסתכל על מרכז הסצנה
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          c.update();
        },
      });
    });
  }, [runIntro]);

  return (
    <OrbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableZoom={true}
      enablePan={true}
      zoomSpeed={0.6}
      rotateSpeed={0.8}
      minDistance={1}
      maxDistance={20}
    />
  );
}

/**
 * 🦋 קומפוננטת הפרפר המעוצב (מחליף את PositionedButton)
 * משתמש ב-Html מ-drei כדי להציג אלמנט HTML/CSS מורכב
 */
function PositionedButterfly({ position }) {
  // סגנונות CSS של הפרפר - מועבר כ-string
  const butterflyStyles1 = `
    .butterfly-container {
      /* הגדרות גודל ומיקום מותאמות ל-R3F Html */
      display: flex;
      justify-content: center;
      align-items: center;
      /* גודל קונטיינר, נדרש כדי שה-Html יעבוד */
      width: 150px; 
      height: 150px;
      /* אפשרות לבטל רקע ברירת מחדל של body ב-HTML המקורי */
      background: none;
    }
    
    .butterfly {
      animation: hover 750ms cubic-bezier(.48,.01,.54,1) infinite;
      animation-direction: alternate;
      animation-fill-mode: reverse;
      position: relative;
      transform-style: preserve-3d;
      /* התאמת סיבוב הפרפר ל-3D של הסצנה */
      transform: rotateX(50deg) rotateY(20deg) rotateZ(-50deg) translateY(0px) scaleX(-1);
      width: 30px;
      cursor: pointer;
    }
    
    .butterfly::before {
      background: #3d3422;
    background: linear-gradient(249deg, #d6d5ce, #b4afa6);
    border-radius: 50%;
    content: '';
    display: block;
    height: 110px;
    left: 50%;
    margin-left: -10px;
    outline: 1px solid transparent;
    position: absolute;
    top: -15px;
    transform: rotatey(100deg);
    width: 20px;
    z-index: 2;
    border: 1px solid #cfcfce;
    }

    .shadow {
      animation: shadow 750ms cubic-bezier(.48,.01,.54,1) infinite;
      animation-direction: alternate;
      animation-fill-mode: reverse;
      background: #000;
      border-radius: 50%;
      display: block;
      height: 10px;
      opacity: 0.1;
      transform-origin: 50% 50%;
      transform: translateX(-40px) translateY(100px);
      width: 100px;
    }

    .wing {
      display: block;
      opacity: 0.85;
      outline: 1px solid transparent;
      position: absolute;
      top: 0;
    }
    
    .wing:first-child {
      animation: leftflap 750ms cubic-bezier(.48,.01,.54,1) infinite;
      animation-direction: alternate;
      animation-fill-mode: reverse;
      height: 1px;
      left: 0;
      transform: rotateY(-20deg);
      transform-origin: 700% 50%;
      width: 1px;
      z-index: 3;
    }
    
    .wing:last-child {
      animation: rightflap 750ms cubic-bezier(.48,.01,.54,1) infinite;
      animation-direction: alternate;
      animation-fill-mode: reverse;
      right: 0;
      transform: rotateY(200deg);
      z-index: 1;
    }
    
    .wing .bit {
       background: linear-gradient(135deg, rgb(153 130 124) 0%, rgb(154 131 126) 25%, rgb(149 128 122) 50%, rgb(134 113 108) 75%, rgb(124 100 97) 100%);
    border: 1px solid #d3d3d3b5;
    box-shadow:  
inset 0px 7px 20px 4px rgb(214 213 207 / 59%), inset 0 0 40px rgba(214, 213, 207, 0.2), 0 2px 10px rgba(214, 213, 207, 0.1)

    .wing .bit::after {
      content: '';
      display: inline-block;
    background: inset 0 0 20px rgb(214 213 207), inset 0 0 40px rgba(214, 213, 207, 0.2), 0 2px 10px rgba(214, 213, 207, 0.1);
    }
    
    .wing .bit, .wing .bit::after {
      border-radius: 0% 100% 50% 50% / 0% 50% 50% 100% ;
      overflow: hidden;
      position: absolute;
      right: 0;
      top: 0;
      transform-origin: 100% 50%;
    }
    
    .wing .bit:first-child {
      height: 70px;
      text-align: center;
      top: 15px;
      transform: rotateZ(40deg);
      width: 130px;
    }
    
    .wing .bit:first-child::after {
      height: 60px;
      left: -30px;
      top: 5px;
      width: 100px;
    }
    
    .wing .bit:last-child {
      height: 55px;
      transform: rotateZ(-40deg);
      width: 100px;
    }
    
    .wing .bit:last-child::after {
      height: 45px;
      left: -24px;
      top: 5px;
      width: 60px;
      z-index: 1;
    }

    @keyframes hover {
      0% { transform: rotateX(50deg) rotateY(20deg) rotateZ(-50deg) translateZ(0px) scaleX(-1); }
      100% { transform: rotateX(50deg) rotateY(20deg) rotateZ(-50deg) translateZ(-3px) scaleX(-1); }
    }

    @keyframes shadow {
      0% { transform: translateX(-40px) translateY(100px) scale(1,1); }
      100% { transform: translateX(-40px) translateY(100px) scale(1.1,1.1); }
    }

    @keyframes leftflap {
      0% { transform: rotateY(-20deg); }
      100% { transform: rotateY(90deg); }
    }

    @keyframes rightflap {
      0% { transform: rotateY(200deg); }
      100% { transform: rotateY(90deg); }
    }
  `;
  const butterflyStyles = `
  .butterfly-container {
    /* הגדרות גודל ומיקום מותאמות ל-R3F Html */
    display: flex;
    justify-content: center;
    align-items: center;
    /* גודל קונטיינר, נדרש כדי שה-Html יעבוד */
    width: 150px; 
    height: 150px;
    /* אפשרות לבטל רקע ברירת מחדל של body ב-HTML המקורי */
    background: none;
  }
  
  .butterfly {
    animation: hover 750ms cubic-bezier(.48,.01,.54,1) infinite;
    animation-direction: alternate;
    animation-fill-mode: reverse;
    position: relative;
    transform-style: preserve-3d;
    /* התאמת סיבוב הפרפר ל-3D של הסצנה */
    transform: rotateX(50deg) rotateY(20deg) rotateZ(-50deg) translateY(0px) scaleX(-1);
    width: 30px;
    cursor: pointer;
  }
  
  .butterfly::before {
    background: linear-gradient(249deg, #d6d5ce, #b4afa6);
    border-radius: 50%;
    content: '';
    display: block;
    height: 110px;
    left: 50%;
    margin-left: -10px;
    outline: 1px solid transparent;
    position: absolute;
    top: -15px;
    transform: rotatey(100deg);
    width: 20px;
    z-index: 2;
    border: 1px solid #cfcfce;
  }

  .shadow {
    animation: shadow 750ms cubic-bezier(.48,.01,.54,1) infinite;
    animation-direction: alternate;
    animation-fill-mode: reverse;
    background: #000;
    border-radius: 50%;
    display: block;
    height: 10px;
    opacity: 0.1;
    transform-origin: 50% 50%;
    transform: translateX(-40px) translateY(100px);
    width: 100px;
  }

  .wing {
    display: block;
    opacity: 0.85;
    outline: 1px solid transparent;
    position: absolute;
    top: 0;
  }
  
  .wing:first-child {
    animation: leftflap 750ms cubic-bezier(.48,.01,.54,1) infinite;
    animation-direction: alternate;
    animation-fill-mode: reverse;
    height: 1px;
    left: 0;
    transform: rotateY(-20deg);
    transform-origin: 700% 50%;
    width: 1px;
    z-index: 3;
  }
  
  .wing:last-child {
    animation: rightflap 750ms cubic-bezier(.48,.01,.54,1) infinite;
    animation-direction: alternate;
    animation-fill-mode: reverse;
    right: 0;
    transform: rotateY(200deg);
    z-index: 1;
  }
  
  .wing .bit {
    background: linear-gradient(135deg, rgb(153 130 124) 0%, rgb(154 131 126) 25%, rgb(149 128 122) 50%, rgb(134 113 108) 75%, rgb(124 100 97) 100%);
    border: 1px solid #d3d3d3b5;
    box-shadow: inset 0px 7px 20px 4px rgb(214 213 207 / 59%), inset 0 0 40px rgba(214, 213, 207, 0.2), 0 2px 10px rgba(214, 213, 207, 0.1)
  }

  .wing .bit::after {
    content: '';
    display: inline-block;
    background: inset 0 0 20px rgb(214 213 207), inset 0 0 40px rgba(214, 213, 207, 0.2), 0 2px 10px rgba(214, 213, 207, 0.1);
  }
  
  .wing .bit, .wing .bit::after {
    border-radius: 0% 100% 50% 50% / 0% 50% 50% 100% ;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 0;
    transform-origin: 100% 50%;
  }
  
  .wing .bit:first-child {
    height: 70px;
    text-align: center;
    top: 15px;
    transform: rotateZ(40deg);
    width: 130px;
  }
  
  .wing .bit:first-child::after {
    height: 60px;
    left: -30px;
    top: 5px;
    width: 100px;
  }
  
  .wing .bit:last-child {
    height: 55px;
    transform: rotateZ(-40deg);
    width: 100px;
  }
  
  .wing .bit:last-child::after {
    height: 45px;
    left: -24px;
    top: 5px;
    width: 60px;
    z-index: 1;
  }

  @keyframes hover {
    0% { transform: rotateX(50deg) rotateY(20deg) rotateZ(-50deg) translateZ(0px) scaleX(-1); }
    100% { transform: rotateX(50deg) rotateY(20deg) rotateZ(-50deg) translateZ(-3px) scaleX(-1); }
  }

  @keyframes shadow {
    0% { transform: translateX(-40px) translateY(100px) scale(1,1); }
    100% { transform: translateX(-40px) translateY(100px) scale(1.1,1.1); }
  }

  @keyframes leftflap {
    0% { transform: rotateY(-20deg); }
    100% { transform: rotateY(90deg); }
  }

  @keyframes rightflap {
    0% { transform: rotateY(200deg); }
    100% { transform: rotateY(90deg); }
  }
`;
  return (
    <Html
      position={new THREE.Vector3(...position)}
      center // מרכז את הפרפר בנקודת המיקום התלת-ממדית
      wrapperClass="butterfly-container" // קלאס עוטף לצורך הגדרת גודל בסיס
      distanceFactor={4} // קובע את מידת השינוי בגודל בעת התרחקות/התקרבות
      scale={[0.05, 0.05, 0.05]} // התאמת גודל הפרפר בתוך הסצנה
    >
      {/* הוספת הסגנונות לתוך רכיב <style> */}
      <style>{butterflyStyles}</style>

      {/* מבנה ה-HTML של הפרפר */}
      <div className="butterfly" onClick={() => alert("🦋 הפרפר נגע בך!")}>
        <div className="wing">
          <div className="bit"></div>
          <div className="bit"></div>
        </div>
        <div className="wing">
          <div className="bit"></div>
          <div className="bit"></div>
        </div>
      </div>
    </Html>
  );
}

// קומפוננטת הסצנה הראשית
export default function ForestScene() {
  const [runIntro, setRunIntro] = useState(true);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{
          position: [-0.0069, -0.9996, -0.0255],
          fov: 60,
          aspect: window.innerWidth / window.innerHeight,
        }}
      >
        <Suspense fallback={<Loader />}>
          <Environment
            files="./hdri/Gemini_Generated_Image_oo7v4roo7v4roo7v_upscayl_2x_digital-art-4x.done2(5).exr"
            background={true}
          />
          <CameraControls runIntro={runIntro} />
          {/* שימוש ברכיב הפרפר החדש */}
          <PositionedButterfly
            position={[
              -0.5727975959985635, 0.06083208113596738, -0.4365143508459205,
            ]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
