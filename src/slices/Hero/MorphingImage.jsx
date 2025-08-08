'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import gsap from 'gsap';

// Global cache for loaded models and loaders
const modelCache = new Map();
const loaderCache = new Map();

// Preload the DRACO decoder
const preloadDRACO = () => {
  if (!loaderCache.has('draco')) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.preload();
    loaderCache.set('draco', dracoLoader);
  }
  return loaderCache.get('draco');
};

// Preload the GLTF loader
const preloadGLTFLoader = () => {
  if (!loaderCache.has('gltf')) {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(preloadDRACO());
    loaderCache.set('gltf', loader);
  }
  return loaderCache.get('gltf');
};

// Start preloading immediately
preloadDRACO();
preloadGLTFLoader();

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
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Start preloading the model immediately when component mounts
  useEffect(() => {
    // Preload the model in the background
    if (!modelCache.has('/models/model-compressed.glb')) {
      const loader = preloadGLTFLoader();
      loader.load(
        '/models/model-compressed.glb',
        (gltf) => {
          // Cache the model for future use
          modelCache.set('/models/model-compressed.glb', gltf.scene.clone());
          console.log('Model preloaded successfully');
        },
        (progress) => {
          console.log('Preload progress:', (progress.loaded / progress.total) * 100, '%');
        },
        (error) => {
          console.error('Preload error:', error);
        }
      );
    }
  }, []);

  // Intersection Observer to only load when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start loading immediately when visible
          loadModel();
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

  const loadModel = () => {
    if (!mountRef.current) return;

    // Check if model is already cached
    const cachedModel = modelCache.get('/models/model-compressed.glb');
    if (cachedModel) {
      // Use cached model - instant loading
      modelRef.current = cachedModel.clone();
      modelRef.current.scale.set(1, 1, 1);

      // Setup scene with cached model
      setupScene();
      setIsModelLoaded(true);

      if (onLoaded) {
        onLoaded(modelRef.current);
      }
      return;
    }

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
      precision: 'lowp'
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
    controls.autoRotateSpeed = 3;

    // Optimized lighting
    const light = new THREE.PointLight(0xffffff, 20);
    light.position.set(0, 10, 10);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Use cached loader
    const loader = preloadGLTFLoader();

    loader.load(
      '/models/model-compressed.glb',
      (gltf) => {
        // Cache the model for future use
        modelCache.set('/models/model-compressed.glb', gltf.scene.clone());

        modelRef.current = gltf.scene;
        modelRef.current.scale.set(0, 0, 0);

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
        setIsModelLoaded(true);

        if (onLoaded) {
          onLoaded(modelRef.current);
        }

        // Animation for first load
        gsap.fromTo(
          modelRef.current.scale,
          { x: 0, y: 0, z: 0 },
          {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.2,
            ease: "power2.out",
            delay: 0.1
          }
        );
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Improved animation loop with better frame rate control
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);

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

      sceneRef.current = null;
      rendererRef.current = null;
    };
  };

  // Helper function to setup scene with cached model
  const setupScene = () => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;

    const sizes = {
      width: mountRef.current.clientWidth,
      height: mountRef.current.clientHeight || 500,
    };

    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 50);
    camera.position.z = 2;
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'lowp'
    });
    rendererRef.current = renderer;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 3;

    const light = new THREE.PointLight(0xffffff, 20);
    light.position.set(0, 10, 10);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    scene.add(modelRef.current);

    // Animation loop
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);

        controls.update();
        renderer.render(scene, camera);
      }

      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate(0);

    // Resize handler
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
    };
  };

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
    />
  );
};

export default MorphingImage;
