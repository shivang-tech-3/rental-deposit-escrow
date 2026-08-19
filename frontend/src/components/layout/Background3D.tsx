"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function Background3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060d, 0.025);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group for all elements
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // 1. Quantum Escrow Vault Core (3D Geodesic Icosahedron)
    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(0, 1.5, 0);
    sceneGroup.add(vaultGroup);

    // Outer wireframe cage
    const outerGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const outerWireframeGeo = new THREE.WireframeGeometry(outerGeo);
    const outerLineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const outerWireframe = new THREE.LineSegments(outerWireframeGeo, outerLineMat);
    vaultGroup.add(outerWireframe);

    // Inner Glowing Core (Faceted Crystal)
    const innerGeo = new THREE.OctahedronGeometry(2.2, 0);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x8a2be2,
      emissive: 0x3b0764,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    vaultGroup.add(innerCore);

    // Core point vertices
    const pointsMat = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 0.15,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const corePoints = new THREE.Points(outerGeo, pointsMat);
    vaultGroup.add(corePoints);

    // 2. Gyroscopic Orbit Rings
    const ringMat1 = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const ringMat2 = new THREE.LineBasicMaterial({
      color: 0xd946ef,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const ringMat3 = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });

    const ringGeo1 = new THREE.TorusGeometry(6.5, 0.02, 16, 100);
    const ringGeo2 = new THREE.TorusGeometry(8.2, 0.02, 16, 100);
    const ringGeo3 = new THREE.TorusGeometry(10, 0.02, 16, 100);

    const ring1 = new THREE.Line(ringGeo1, ringMat1);
    const ring2 = new THREE.Line(ringGeo2, ringMat2);
    const ring3 = new THREE.Line(ringGeo3, ringMat3);

    ring1.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    ring3.rotation.x = -Math.PI / 6;
    ring3.rotation.z = Math.PI / 5;

    vaultGroup.add(ring1);
    vaultGroup.add(ring2);
    vaultGroup.add(ring3);

    // 3. Shimmering Stellar Particle Field
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x00f0ff), // Neon Cyan
      new THREE.Color(0x9d4edd), // Electric Violet
      new THREE.Color(0x00f5d4), // Mint Teal
      new THREE.Color(0xffbe0b), // Solar Gold
      new THREE.Color(0x3a86ff), // Deep Sapphire
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 60;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 45;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 45 - 5;

      const randomColor =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particleColors[i3] = randomColor.r;
      particleColors[i3 + 1] = randomColor.g;
      particleColors[i3 + 2] = randomColor.b;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Undulating Cybernetic Horizon Grid (Stellar Ledger Wave)
    const gridWidth = 70;
    const gridDepth = 60;
    const gridSegmentsX = 50;
    const gridSegmentsY = 40;
    const gridGeo = new THREE.PlaneGeometry(
      gridWidth,
      gridDepth,
      gridSegmentsX,
      gridSegmentsY
    );
    gridGeo.rotateX(-Math.PI / 2);
    gridGeo.translate(0, -9, 0);

    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const cyberGrid = new THREE.Mesh(gridGeo, gridMat);
    scene.add(cyberGrid);

    // Store original plane vertex Y positions for waves
    const posAttr = gridGeo.attributes.position;
    const originalY = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      originalY[i] = posAttr.getY(i);
    }

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0x0d1527, 2.5);
    scene.add(ambientLight);

    const mouseLight = new THREE.PointLight(0x00f0ff, 4, 30);
    mouseLight.position.set(0, 0, 8);
    scene.add(mouseLight);

    const violetLight = new THREE.PointLight(0xa855f7, 3, 25);
    violetLight.position.set(-12, 6, -4);
    scene.add(violetLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2.5, 25);
    goldLight.position.set(14, -4, -6);
    scene.add(goldLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetX = (e.clientX - windowHalfX) * 0.0008;
      targetY = (e.clientY - windowHalfY) * 0.0008;

      // Move the interactive light in 3D space
      mouseLight.position.x = ((e.clientX / window.innerWidth) * 2 - 1) * 12;
      mouseLight.position.y = -((e.clientY / window.innerHeight) * 2 - 1) * 8;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (document.hidden) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth inertia lerp for mouse movement
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      if (!prefersReducedMotion) {
        // Vault Rotations
        vaultGroup.rotation.y = elapsedTime * 0.15 + mouseX * 2;
        vaultGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.15 + mouseY * 1.5;
        vaultGroup.rotation.z = Math.cos(elapsedTime * 0.08) * 0.1;

        innerCore.rotation.y = -elapsedTime * 0.35;
        innerCore.rotation.x = elapsedTime * 0.2;

        ring1.rotation.z = elapsedTime * 0.2;
        ring2.rotation.x = elapsedTime * 0.15;
        ring3.rotation.y = -elapsedTime * 0.18;

        // Particle field subtle drift
        particles.rotation.y = elapsedTime * 0.02 + mouseX * 0.5;
        particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05 + mouseY * 0.3;

        // Cyber Grid Wave Ripple Animation
        const positions = gridGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const z = positions.getZ(i);
          const wave1 = Math.sin(x * 0.2 + elapsedTime * 1.2) * 0.6;
          const wave2 = Math.cos(z * 0.25 + elapsedTime * 0.8) * 0.5;
          const wave3 = Math.sin((x + z) * 0.15 + elapsedTime * 0.5) * 0.4;
          positions.setY(i, originalY[i] + wave1 + wave2 + wave3);
        }
        positions.needsUpdate = true;

        // Orbiting point lights
        violetLight.position.x = Math.sin(elapsedTime * 0.4) * 15;
        violetLight.position.z = Math.cos(elapsedTime * 0.4) * 10 - 2;

        goldLight.position.x = Math.cos(elapsedTime * 0.35) * 16;
        goldLight.position.y = Math.sin(elapsedTime * 0.25) * 6 - 3;
      }

      // Parallax camera tilt
      camera.position.x += (mouseX * 8 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 6 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      outerGeo.dispose();
      outerWireframeGeo.dispose();
      outerLineMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      pointsMat.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringGeo3.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      ringMat3.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="three-background-canvas"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden transition-opacity duration-1000"
      style={{
        background:
          "radial-gradient(ellipse at 50% -20%, #0d122b 0%, #060914 45%, #020408 100%)",
      }}
      aria-hidden="true"
    />
  );
}
