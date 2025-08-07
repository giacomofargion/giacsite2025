'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import gsap from 'gsap';

const useConnectionSpeed = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const isSlow = connection.effectiveType === 'slow-2g' ||
                     connection.effectiveType === '2g' ||
                     connection.downlink < 1;
      setIsSlowConnection(isSlow);
    }
  }, []);

  return isSlowConnection;
};

const MorphingImage = ({ onLoaded }) => {
  const isSlowConnection = useConnectionSpeed();
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameIdRef = useRef(0);
  const modelRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Intersection Observer to only load when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (mountRef.current) {
      observer.observe(mountRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !mountRef.current) return;

    // Scene setup with performance optimizations
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;

    const sizes = {
      width: mountRef.current.clientWidth,
      height: mountRef.current.clientHeight || 500,
    };

    // Camera optimization
    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 50);
    camera.position.z = 2;
    scene.add(camera);

    // Renderer optimization
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'lowp' // Use low precision for better performance
    });
    rendererRef.current = renderer;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    mountRef.current.appendChild(renderer.domElement);

    // Controls optimization
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 5;

    // Optimized lighting
    const light = new THREE.PointLight(0xffffff, 20);
    light.position.set(0, 10, 10);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // DRACO loader setup
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/model-compressed.glb',
      (gltf) => {
        modelRef.current = gltf.scene;
        modelRef.current.scale.set(10, 15, 15);

        // Optimize model
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            node.frustumCulled = true;
            node.castShadow = false;
            node.receiveShadow = false;

            // Additional optimizations
            if (node.geometry) {
              node.geometry.computeBoundingSphere();
              node.geometry.computeBoundingBox();
            }
          }
        });

        scene.add(modelRef.current);

        if (onLoaded) {
          onLoaded(modelRef.current);
        }

        gsap.fromTo(
          modelRef.current.scale,
          { x: 0, y: 0, z: 0 },
          { x: 1, y: 1, z: 1, duration: 1, ease: "power3.out" }
        );
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        setLoadingProgress(percent);
        console.log('Loading progress:', percent, '%');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Optimized animation loop
    let previousTime = 0;
    const animate = (currentTime) => {
      const deltaTime = currentTime - previousTime;
      previousTime = currentTime;

      if (deltaTime < 32) {
        controls.update();
        renderer.render(scene, camera);
      }

      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate(0);

    // Optimized resize handler
    let resizeTimeout;
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        if (!mountRef.current) return;

        sizes.width = mountRef.current.clientWidth;
        sizes.height = mountRef.current.clientHeight || 500;

        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();
        renderer.setSize(sizes.width, sizes.height);
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current.domElement.remove();
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
              object.material.dispose();
            } else if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            }
          }
        });
      }

      dracoLoader.dispose();
      sceneRef.current = null;
      rendererRef.current = null;
    };
  }, [shouldLoad, onLoaded]);

  if (isSlowConnection) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🚀</div>
          <div className="text-xl mb-2">Interactive 3D Model</div>
          <div className="text-sm opacity-70">Optimized for your connection</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="webgl w-full h-[500px] relative"
      style={{
        contain: 'paint',
        willChange: 'transform'
      }}
    >
      {!shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="text-2xl mb-4 font-bold">Preparing 3D Model</div>
            <div className="text-sm opacity-80">Loading when visible...</div>
          </div>
        </div>
      )}

      {shouldLoad && loadingProgress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="text-2xl mb-4 font-bold">Loading 3D Model</div>
            <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-sm mt-3 opacity-80">{Math.round(loadingProgress)}%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MorphingImage;
