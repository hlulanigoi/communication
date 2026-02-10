import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore - three.js types are installed but may have resolution issues
import * as THREE from 'three';
import { createVehicleModel, VehicleModelConfig } from '@/lib/three-vehicle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

export interface Vehicle3DViewerProps {
  vehicle?: {
    [key: string]: any;
    make?: string;
    model?: string;
    year?: string | number;
    color?: string | null;
    vin?: string | null;
  };
  modelColor?: string | null;
  showControls?: boolean;
  height?: string;
}

export default function Vehicle3DViewer({
  vehicle,
  modelColor,
  showControls = true,
  height = 'h-96',
}: Vehicle3DViewerProps) {
  const finalModelColor = modelColor || vehicle?.color || '#E2231A';
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const mouseDownRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    scene.fog = new THREE.Fog(0xf5f5f5, 100, 1000);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);

    containerRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

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

    // Ground
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

    // Create vehicle model
    const vehicleGroup = createVehicleModel({
      color: finalModelColor,
      scale: 1,
      wireframe: false,
    });
    vehicleGroup.position.y = 0;
    scene.add(vehicleGroup);
    vehicleGroupRef.current = vehicleGroup;

    // Controls state
    let rotationX = 0;
    let rotationY = 0;

    controlsRef.current = {
      rotate: (x: number, y: number) => {
        rotationX += y * 0.005;
        rotationY += x * 0.005;
        rotationX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotationX));
        setRotation({ x: rotationX, y: rotationY });
      },
      zoom: (delta: number) => {
        const zoomSpeed = 0.1;
        const currentDistance = camera.position.length();
        const newDistance = Math.max(3, Math.min(15, currentDistance - delta * zoomSpeed));
        const scale = newDistance / currentDistance;
        camera.position.multiplyScalar(scale);
      },
      reset: () => {
        rotationX = 0;
        rotationY = 0;
        camera.position.set(0, 2.5, 6);
        setRotation({ x: 0, y: 0 });
      },
    };

    // Mouse interaction
    const onMouseDown = (e: MouseEvent) => {
      mouseDownRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (e.buttons === 1) {
        const deltaX = e.clientX - mouseDownRef.current.x;
        const deltaY = e.clientY - mouseDownRef.current.y;
        controlsRef.current.rotate(deltaX, deltaY);
        mouseDownRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      controlsRef.current.zoom(e.deltaY > 0 ? 1 : -1);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const distance = camera.position.length();
      camera.position.x = Math.sin(rotationY) * Math.cos(rotationX) * distance;
      camera.position.y = Math.sin(rotationX) * distance + 1;
      camera.position.z = Math.cos(rotationY) * Math.cos(rotationX) * distance;
      camera.lookAt(0, 1, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    setIsLoading(false);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [finalModelColor]);

  const handleReset = () => {
    controlsRef.current?.reset();
  };

  const handleZoomIn = () => {
    controlsRef.current?.zoom(-2);
  };

  const handleZoomOut = () => {
    controlsRef.current?.zoom(2);
  };

  return (
    <Card className="w-full overflow-hidden industrial-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {vehicle?.make} {vehicle?.model}
            </CardTitle>
            {vehicle?.year && (
              <p className="text-xs text-muted-foreground mt-1">{vehicle.year}</p>
            )}
          </div>
          {vehicle?.vin && (
            <Badge variant="outline" className="text-xs font-mono">
              {vehicle.vin.substring(0, 8)}...
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`${height} w-full relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-b-lg overflow-hidden`}>
          <div
            ref={containerRef}
            className="w-full h-full"
            style={{ cursor: 'grab' }}
          />

          {showControls && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={handleZoomIn}
                title="Zoom In"
                className="h-9 w-9 shadow-md"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="h-9 w-9 shadow-md"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleReset}
                title="Reset View"
                className="h-9 w-9 shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading 3D model...</p>
              </div>
            </div>
          )}

          {/* Info overlay */}
          <div className="absolute top-4 left-4 text-xs text-muted-foreground space-y-1 bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
            <div>Drag to rotate</div>
            <div>Scroll to zoom</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
