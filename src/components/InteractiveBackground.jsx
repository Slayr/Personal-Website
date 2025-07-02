import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const InteractiveBackground = () => {
  const mountRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(0.1, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const particles = [];

    for (let i = 0; i < 500; i++) {
      const particle = new THREE.Mesh(geometry, material);
      particle.position.x = (Math.random() - 0.5) * 10;
      particle.position.y = (Math.random() - 0.5) * 10;
      particle.position.z = (Math.random() - 0.5) * 10;
      scene.add(particle);
      particles.push(particle);
    }

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      // Animate particles based on mouse position
      particles.forEach(particle => {
        particle.position.x += (mouseX.current * 0.001 - particle.position.x) * 0.01;
        particle.position.y += (-mouseY.current * 0.001 - particle.position.y) * 0.01;
      });

      renderer.render(scene, camera);
    };

    const handleMouseMove = (event) => {
      mouseX.current = event.clientX - window.innerWidth / 2;
      mouseY.current = event.clientY - window.innerHeight / 2;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

export default InteractiveBackground;
