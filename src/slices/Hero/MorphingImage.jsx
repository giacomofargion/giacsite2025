'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import gsap from 'gsap';



const MorphingImage = ({ onLoaded }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameIdRef = useRef(0);
  const modelRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with performance optimizations
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;

    const sizes = {
      width: mountRef.current.clientWidth,
      height: mountRef.current.clientHeight || 500,
    };

    // Camera optimization
    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = 2;
    scene.add(camera);

    // Renderer optimization
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    rendererRef.current = renderer;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
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

    // DRACO loader setup for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.preload();

    // Model loader with DRACO compression
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/model.glb',
      (gltf) => {
        modelRef.current = gltf.scene;
        modelRef.current.scale.set(10, 15, 15);

        // Optimize model
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            node.frustumCulled = true;
            node.castShadow = false;
            node.receiveShadow = false;
          }
        });

        scene.add(modelRef.current);

        if (onLoaded) {
          onLoaded(modelRef.current);
        }

        gsap.fromTo(
          modelRef.current.scale,
          {
            x: 0,
            y: 0,
            z: 0
          },
          {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "power3.out"
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

    // Optimized animation loop
    let previousTime = 0;
    const animate = (currentTime) => {
      const deltaTime = currentTime - previousTime;
      previousTime = currentTime;

      if (deltaTime < 32) { // Cap at ~30fps
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

      // Cleanup resources
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
  }, [onLoaded]);

  return (
    <div
      ref={mountRef}
      className="webgl w-full h-[500px]"
      style={{
        contain: 'paint',
        willChange: 'transform'
      }}
    />
  );
};

export default MorphingImage;
