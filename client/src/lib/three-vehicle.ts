/**
 * Three.js Vehicle Model Generator
 * Creates procedural 3D car models based on vehicle data
 */

import * as THREE from 'three';

export interface VehicleModelConfig {
  color?: string;
  scale?: number;
  wireframe?: boolean;
}

/**
 * Create a procedural sedan/SUV model
 */
export function createVehicleModel(config: VehicleModelConfig = {}): THREE.Group {
  const {
    color = '#E2231A', // JustFix red
    scale = 1,
    wireframe = false,
  } = config;

  const group = new THREE.Group();
  group.scale.set(scale, scale, scale);

  // Vehicle dimensions (normalized)
  const length = 4;
  const width = 1.8;
  const height = 1.5;
  const wheelRadius = 0.35;

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.6,
    roughness: 0.4,
    wireframe,
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: '#87CEEB',
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
    wireframe,
  });

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    metalness: 0.3,
    roughness: 0.8,
    wireframe,
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: '#666666',
    metalness: 0.8,
    roughness: 0.2,
    wireframe,
  });

  // Main body (rounded box shape)
  const bodyGeometry = new THREE.BoxGeometry(length * 0.9, height * 0.7, width);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = height * 0.35;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Cabin/roof (smaller box above body)
  const cabinGeometry = new THREE.BoxGeometry(length * 0.5, height * 0.5, width * 0.9);
  const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
  cabin.position.y = height * 0.85;
  cabin.position.z = -length * 0.15;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  group.add(cabin);

  // Front bumper
  const bumperGeometry = new THREE.BoxGeometry(length * 0.15, height * 0.3, width);
  const frontBumper = new THREE.Mesh(bumperGeometry, bodyMaterial);
  frontBumper.position.x = length * 0.425;
  frontBumper.position.y = height * 0.15;
  frontBumper.castShadow = true;
  frontBumper.receiveShadow = true;
  group.add(frontBumper);

  // Front windshield
  const windshieldGeometry = new THREE.BoxGeometry(length * 0.4, height * 0.4, width * 0.85);
  const windshield = new THREE.Mesh(windshieldGeometry, glassMaterial);
  windshield.position.x = length * 0.3;
  windshield.position.y = height * 0.75;
  windshield.position.z = -length * 0.1;
  windshield.rotation.z = Math.PI * 0.08;
  windshield.castShadow = true;
  group.add(windshield);

  // Rear windshield
  const rearWindshieldGeometry = new THREE.BoxGeometry(length * 0.3, height * 0.35, width * 0.85);
  const rearWindshield = new THREE.Mesh(rearWindshieldGeometry, glassMaterial);
  rearWindshield.position.x = -length * 0.3;
  rearWindshield.position.y = height * 0.75;
  rearWindshield.position.z = -length * 0.15;
  rearWindshield.rotation.z = Math.PI * 0.08;
  rearWindshield.castShadow = true;
  group.add(rearWindshield);

  // Side windows (left)
  const sideWindowGeometry = new THREE.BoxGeometry(length * 0.3, height * 0.3, 0.05);
  const leftWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
  leftWindow.position.y = height * 0.65;
  leftWindow.position.z = width * 0.5;
  leftWindow.castShadow = true;
  group.add(leftWindow);

  // Side windows (right)
  const rightWindow = leftWindow.clone();
  rightWindow.position.z = -width * 0.5;
  group.add(rightWindow);

  // Wheels (4x)
  const wheelPositions = [
    { x: length * 0.3, z: width * 0.45 },  // Front-left
    { x: length * 0.3, z: -width * 0.45 }, // Front-right
    { x: -length * 0.3, z: width * 0.45 }, // Rear-left
    { x: -length * 0.3, z: -width * 0.45 }, // Rear-right
  ];

  wheelPositions.forEach((pos) => {
    const wheel = createWheel(wheelRadius, wheelMaterial, rimMaterial);
    wheel.position.set(pos.x, wheelRadius, pos.z);
    group.add(wheel);
  });

  return group;
}

/**
 * Create a wheel assembly (tire + rim)
 */
function createWheel(
  radius: number,
  tireMaterial: THREE.Material,
  rimMaterial: THREE.Material
): THREE.Group {
  const wheelGroup = new THREE.Group();

  // Tire
  const tireGeometry = new THREE.CylinderGeometry(radius, radius, radius * 0.6, 32);
  const tire = new THREE.Mesh(tireGeometry, tireMaterial);
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true;
  tire.receiveShadow = true;
  wheelGroup.add(tire);

  // Rim
  const rimGeometry = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, radius * 0.5, 32);
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.z = Math.PI / 2;
  rim.castShadow = true;
  wheelGroup.add(rim);

  return wheelGroup;
}

/**
 * Create a scene with lighting and ground plane
 */
export function createScene(): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: { rotate: (x: number, y: number) => void; zoom: (delta: number) => void };
} {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);
  scene.fog = new THREE.Fog(0xf5f5f5, 100, 1000);

  // Camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2.5, 6);
  camera.lookAt(0, 1, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowShadowMap;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.1,
    roughness: 0.8,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Controls
  let rotationX = 0;
  let rotationY = 0;

  const controls = {
    rotate: (x: number, y: number) => {
      rotationX += y * 0.005;
      rotationY += x * 0.005;
      
      // Clamp vertical rotation
      rotationX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationX));
    },
    zoom: (delta: number) => {
      const zoomSpeed = 0.1;
      const currentDistance = camera.position.length();
      const newDistance = Math.max(3, Math.min(15, currentDistance - delta * zoomSpeed));
      const scale = newDistance / currentDistance;
      
      camera.position.multiplyScalar(scale);
    },
  };

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Update camera based on rotation
    const distance = camera.position.length();
    camera.position.x = Math.sin(rotationY) * Math.cos(rotationX) * distance;
    camera.position.y = Math.sin(rotationX) * distance + 1;
    camera.position.z = Math.cos(rotationY) * Math.cos(rotationX) * distance;
    camera.lookAt(0, 1, 0);

    renderer.render(scene, camera);
  };

  animate();

  // Handle window resize
  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener('resize', handleResize);

  return { scene, camera, renderer, controls };
}
