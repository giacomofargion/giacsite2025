'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';

const MorphingImage = ({ onLoaded }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameIdRef = useRef(0);
  const modelRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;

    const sizes = {
      width: mountRef.current.clientWidth,
      height: mountRef.current.clientHeight || 500,
    };

    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height);
    camera.position.z = 2;
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    rendererRef.current = renderer;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 5;

    const light = new THREE.PointLight(0xffffff, 20);
    light.position.set(0, 10, 10);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Model loader
    const loader = new GLTFLoader();

    loader.load('/models/model.glb', // Make sure this matches your file name
      (gltf) => {
        modelRef.current = gltf.scene;
        // Using your original scale values
        modelRef.current.scale.set(10, 15, 15);
        scene.add(modelRef.current);

        // Notify parent that model is loaded
        if (onLoaded) {
          onLoaded(modelRef.current);
        }

        // Add immediate animation for the model
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

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;

      sizes.width = mountRef.current.clientWidth;
      sizes.height = mountRef.current.clientHeight || 500;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
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
  }, [onLoaded]);

  return (
    <div
      ref={mountRef}
      className="webgl w-full h-[500px]"
      style={{ contain: 'paint' }}
    />
  );
};

export default MorphingImage;
