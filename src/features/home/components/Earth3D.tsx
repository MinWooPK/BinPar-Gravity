// Modelo 3D EARTH
//https://github.com/mrdoob/three.js/blob/master/examples/webgpu_tsl_earth.html

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";

import {
  step,
  normalWorldGeometry,
  output,
  texture,
  vec3,
  vec4,
  normalize,
  positionWorld,
  bumpMap,
  cameraPosition,
  color,
  uniform,
  mix,
  uv,
  max,
} from "three/tsl";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function Earth3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // Escena y cámara
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100);

    camera.position.set(4.5, 2, 3);

    // Luz solar
    const sun = new THREE.DirectionalLight("#ffffff", 2);
    sun.position.set(0, 0, 3);
    scene.add(sun);

    // Parámetros visuales de la atmósfera
    const atmosphereDayColor = uniform(color("#4db2ff"));
    const atmosphereTwilightColor = uniform(color("#bc490b"));

    const roughnessLow = uniform(0.25);
    const roughnessHigh = uniform(0.35);

    // Carga de texturas locales
    const loader = new THREE.TextureLoader();

    const dayTexture = loader.load("/textures/earth/earth_day_4096.jpg");
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = 8;

    const nightTexture = loader.load("/textures/earth/earth_night_4096.jpg");
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 8;

    const bumpTexture = loader.load(
      "/textures/earth/earth_bump_roughness_clouds_4096.jpg",
    );
    bumpTexture.anisotropy = 8;

    // Dirección de visión para el efecto Fresnel
    const viewDirection = positionWorld.sub(cameraPosition).normalize();

    const fresnel = viewDirection
      .dot(normalWorldGeometry)
      .abs()
      .oneMinus()
      .toVar();

    // Orientación respecto al Sol
    const sunOrientation = normalWorldGeometry
      .dot(normalize(sun.position))
      .toVar();

    // Colores de la atmósfera
    const atmosphereColor = mix(
      atmosphereTwilightColor,
      atmosphereDayColor,
      sunOrientation.smoothstep(-0.25, 0.75),
    );

    // Material de la superficie terrestre
    const globeMaterial = new THREE.MeshStandardNodeMaterial();

    const cloudsStrength = texture(bumpTexture, uv()).b.smoothstep(0.2, 1);

    globeMaterial.colorNode = mix(
      texture(dayTexture),
      vec3(1),
      cloudsStrength.mul(2),
    );

    // Rugosidad de océanos, tierra y nubes
    const roughness = max(texture(bumpTexture).g, step(0.01, cloudsStrength));

    globeMaterial.roughnessNode = roughness.remap(
      0,
      1,
      roughnessLow,
      roughnessHigh,
    );

    // Transición entre día y noche
    const night = texture(nightTexture);

    const dayStrength = sunOrientation.smoothstep(-0.25, 0.5);

    const atmosphereDayStrength = sunOrientation.smoothstep(-0.5, 1);

    const atmosphereMix = atmosphereDayStrength.mul(fresnel.pow(2)).clamp(0, 1);

    let finalOutput = mix(night.rgb, output.rgb, dayStrength);

    finalOutput = mix(finalOutput, atmosphereColor, atmosphereMix);

    globeMaterial.outputNode = vec4(finalOutput, output.a);

    // Relieve superficial
    const bumpElevation = max(texture(bumpTexture).r, cloudsStrength);

    globeMaterial.normalNode = bumpMap(bumpElevation);

    // Geometría de la Tierra
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);

    const globe = new THREE.Mesh(sphereGeometry, globeMaterial);

    scene.add(globe);

    // Atmósfera exterior
    const atmosphereMaterial = new THREE.MeshBasicNodeMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });

    let alpha = fresnel.remap(0.73, 1, 1, 0).pow(3);

    alpha = alpha.mul(sunOrientation.smoothstep(-0.5, 1));

    atmosphereMaterial.outputNode = vec4(atmosphereColor, alpha);

    const atmosphere = new THREE.Mesh(sphereGeometry, atmosphereMaterial);

    atmosphere.scale.setScalar(1.04);
    scene.add(atmosphere);

    // Renderizado WebGPU con fallback WebGL 2
    const renderer = new THREE.WebGPURenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    // Interacción mediante ratón y pantalla táctil
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true;
    controls.minDistance = 2;
    controls.maxDistance = 12;

    const interactionQuery = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
    );
    let controlsConnected = true;
    const syncInteraction = () => {
      const interactive = interactionQuery.matches;
      if (interactive !== controlsConnected) {
        if (interactive) {
          controls.connect(renderer.domElement);
        } else {
          controls.disconnect();
          controls.reset();
        }
        controlsConnected = interactive;
      }
      controls.enabled = interactive;
      controls.enableZoom = interactive;
      renderer.domElement.style.pointerEvents = interactive ? "auto" : "none";
      renderer.domElement.style.touchAction = interactive ? "none" : "auto";
    };
    interactionQuery.addEventListener("change", syncInteraction);
    syncInteraction();

    // Ajuste al tamaño real del contenedor
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      // Keep the globe on the right while the canvas spans the entire hero.
      const horizontalOffset = window.matchMedia("(min-width: 1024px)").matches
        ? 0.3
        : 0.08;
      camera.setViewOffset(width, height, -width * horizontalOffset, 0, width, height);

      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // Animación y rotación terrestre
    const timer = new THREE.Timer();
    timer.connect(document);

    renderer.setAnimationLoop(() => {
      timer.update();

      const delta = timer.getDelta();

      globe.rotation.y += delta * 0.025;

      if (controls.enabled) controls.update();
      renderer.render(scene, camera);
    });

    // Limpieza al desmontar el componente
    return () => {
      renderer.setAnimationLoop(null);

      resizeObserver.disconnect();
      interactionQuery.removeEventListener("change", syncInteraction);
      controls.dispose();
      timer.dispose();

      sphereGeometry.dispose();
      globeMaterial.dispose();
      atmosphereMaterial.dispose();

      dayTexture.dispose();
      nightTexture.dispose();
      bumpTexture.dispose();

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Representación tridimensional de la Tierra en rotación"
      className="h-full w-full overflow-hidden"
    />
  );
}
