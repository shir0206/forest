import * as THREE from "three";

/**
 * Vector pooling system to reduce garbage collection during animations
 */
class VectorPool {
  private pool: Map<string, THREE.Vector3[]> = new Map();
  private maxSize = 10;

  getVector(key: string): THREE.Vector3 {
    const vectors = this.pool.get(key) || [];
    if (vectors.length > 0) {
      return vectors.pop()!;
    }
    return new THREE.Vector3();
  }

  returnVector(key: string, vector: THREE.Vector3): void {
    const vectors = this.pool.get(key) || [];
    if (vectors.length < this.maxSize) {
      vector.set(0, 0, 0);
      vectors.push(vector);
      this.pool.set(key, vectors);
    }
  }

  clear(): void {
    this.pool.clear();
  }
}

export const vectorPool = new VectorPool();

/**
 * Get a cached vector for camera calculations
 */
export const getCachedVector = (key: string): THREE.Vector3 => {
  return vectorPool.getVector(key);
};

/**
 * Return a vector to the pool for reuse
 */
export const returnCachedVector = (
  key: string,
  vector: THREE.Vector3
): void => {
  vectorPool.returnVector(key, vector);
};

/**
 * Execute a function with a cached vector and automatically return it
 */
export const withCachedVector = <T>(
  key: string,
  callback: (vector: THREE.Vector3) => T
): T => {
  const vector = getCachedVector(key);
  const result = callback(vector);
  returnCachedVector(key, vector);
  return result;
};
