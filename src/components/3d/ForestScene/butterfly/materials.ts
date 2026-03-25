import * as THREE from "three";

import {
  BODY_COLOR_BOTTOM,
  BODY_COLOR_TOP,
  BORDER_COLOR,
  BORDER_OPACITY,
  WING_GRADIENT_COLORS,
  WING_STOP_ALPHAS,
} from "./constants";

// ─── GLSL ────────────────────────────────────────────────────────────────────

const wingVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const wingFragmentShader = /* glsl */ `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform float uAlpha1;
  uniform float uAlpha2;
  uniform float uAlpha3;
  uniform float uAlpha4;
  uniform float uAlpha5;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    // CSS linear-gradient(135deg, ...) diagonal mapping
    float t = (vUv.x + 1.0 - vUv.y) * 0.5;

    vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.2, t));
    color = mix(color, uColor3, smoothstep(0.2, 0.4, t));
    color = mix(color, uColor4, smoothstep(0.4, 0.6, t));
    color = mix(color, uColor5, smoothstep(0.6, 0.8, t));
    color = mix(color, uColor1, smoothstep(0.8, 1.0, t));

    // Per-stop alpha (matches CSS rgba alpha channels)
    float a = mix(uAlpha1, uAlpha2, smoothstep(0.0, 0.2, t));
    a = mix(a, uAlpha3, smoothstep(0.2, 0.4, t));
    a = mix(a, uAlpha4, smoothstep(0.4, 0.6, t));
    a = mix(a, uAlpha5, smoothstep(0.6, 0.8, t));
    a = mix(a, uAlpha1, smoothstep(0.8, 1.0, t));

    // uOpacity = element-level opacity (0.85 from CSS .wing) × phase opacity
    gl_FragColor = vec4(color, a * uOpacity);
  }
`;

const bodyVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bodyFragmentShader = /* glsl */ `
  uniform vec3 uColorTop;
  uniform vec3 uColorBottom;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    // 249deg gradient ≈ mostly vertical with slight horizontal slant
    float t = vUv.y * 0.9 + vUv.x * 0.1;
    vec3 color = mix(uColorBottom, uColorTop, t);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

// ─── Shared uniform blocks ──────────────────────────────────────────────────

function wingUniforms() {
  return {
    uColor1: { value: WING_GRADIENT_COLORS[0] },
    uColor2: { value: WING_GRADIENT_COLORS[1] },
    uColor3: { value: WING_GRADIENT_COLORS[2] },
    uColor4: { value: WING_GRADIENT_COLORS[3] },
    uColor5: { value: WING_GRADIENT_COLORS[4] },
    uAlpha1: { value: WING_STOP_ALPHAS[0] },
    uAlpha2: { value: WING_STOP_ALPHAS[1] },
    uAlpha3: { value: WING_STOP_ALPHAS[2] },
    uAlpha4: { value: WING_STOP_ALPHAS[3] },
    uAlpha5: { value: WING_STOP_ALPHAS[4] },
    uOpacity: { value: 0.85 },
  };
}

// ─── Cached material instances ──────────────────────────────────────────────

let _wingOuter: THREE.ShaderMaterial | null = null;
let _body: THREE.ShaderMaterial | null = null;
let _border: THREE.LineBasicMaterial | null = null;

export function getWingOuterMaterial(): THREE.ShaderMaterial {
  if (!_wingOuter) {
    _wingOuter = new THREE.ShaderMaterial({
      vertexShader: wingVertexShader,
      fragmentShader: wingFragmentShader,
      uniforms: wingUniforms(),
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }
  return _wingOuter;
}

export function getBodyMaterial(): THREE.ShaderMaterial {
  if (!_body) {
    _body = new THREE.ShaderMaterial({
      vertexShader: bodyVertexShader,
      fragmentShader: bodyFragmentShader,
      uniforms: {
        uColorTop: { value: BODY_COLOR_TOP },
        uColorBottom: { value: BODY_COLOR_BOTTOM },
        uOpacity: { value: 1.0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }
  return _body;
}

export function getBorderMaterial(): THREE.LineBasicMaterial {
  if (!_border) {
    _border = new THREE.LineBasicMaterial({
      color: BORDER_COLOR,
      transparent: true,
      opacity: BORDER_OPACITY,
    });
  }
  return _border;
}
