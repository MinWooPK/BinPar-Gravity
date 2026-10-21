// https:github.com/RaspberryKitty1/Starfield?utm_source=chatgpt.com

"use client";

import { useEffect, useRef } from "react";

// ====================================================
// 1. TIPO DE DATOS DE CADA ESTRELLA
// ====================================================

type Star = {
  x: number; // Posición horizontal inicial.
  y: number; // Posición vertical inicial.
  radius: number; // Tamaño de la estrella (radio en píxeles).
  brightness: number; // Brillo u opacidad de la estrella.
  driftX: number; // Velocidad horizontal (px/segundo).
  driftY: number; // Velocidad vertical (px/segundo).
  phase: number; // Desfase inicial del parpadeo.
  twinkle: number; // Frecuencia del parpadeo.
  blue: boolean; // true = azulada, false = blanca.
};

// ====================================================
// 2. GENERADOR DE NÚMEROS PSEUDOALEATORIOS
// ====================================================

// La semilla (seed) permite generar siempre
// la misma secuencia de números.
//
// Ventaja: las estrellas aparecen distribuidas
// de forma reproducible.
//
// Cambiar la semilla cambia su distribución,
// tamaños, velocidades y demás propiedades.
function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    // Fórmula del generador pseudoaleatorio.
    state = (1664525 * state + 1013904223) >>> 0;

    // Devuelve un número entre 0 (incluido)
    // y 1 (excluido).
    return state / 4294967296;
  };
}

// ====================================================
// 3. COMPONENTE PRINCIPAL
// ====================================================

export const SpaceStarfield = () => {
  // Referencia al DIV que contiene el fondo.
  const rootRef = useRef<HTMLDivElement>(null);

  // Referencia al CANVAS donde dibujamos las estrellas.
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Se ejecuta después de montar el componente.
  // El array [] indica que el efecto no depende
  // de props ni estado de React.
  useEffect(() => {
    // Obtenemos los elementos HTML.
    const root = rootRef.current;
    const canvas = canvasRef.current;

    // Obtenemos el contexto 2D para dibujar.
    // alpha: true permite tener fondo transparente.
    const ctx = canvas?.getContext("2d", {
      alpha: true,
    });

    // Si falta algún elemento, detenemos la ejecución.
    if (!root || !canvas || !ctx) return;

    // Comprueba si el usuario ha configurado
    // reducir movimiento en su sistema operativo.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // =================================================
    // 4. VARIABLES DE CONTROL
    // =================================================

    // Dimensiones del canvas en píxeles CSS.
    let width = 1;
    let height = 1;

    // Array que almacena todas las estrellas.
    let stars: Star[] = [];

    // Tiempo acumulado de animación en segundos.
    let elapsed = 0;

    // Momento del último fotograma dibujado.
    let lastFrame = 0;

    // Identificador para cancelar requestAnimationFrame.
    let frameId = 0;

    // Indica si la animación está ejecutándose.
    let running = false;

    // Indica si el componente está visible.
    let inView = true;

    // =================================================
    // 5. CREAR ESTRELLAS
    // =================================================

    const makeStars = () => {
      // SEMILLA
      // Cambiar 87234 por otro número modifica
      // la distribución visual de las estrellas.
      const random = createRandom(87234);

      // CANTIDAD DE ESTRELLAS
      //
      // 350  → máximo de estrellas.
      // 80   → mínimo de estrellas.
      // 5200 → área aproximada por estrella.
      //
      // Reducir 5200 genera MÁS estrellas.
      // Aumentar 5200 genera MENOS estrellas.
      //
      // Math.round redondea al entero más cercano.
      const count = Math.min(
        350,
        Math.max(80, Math.round((width * height) / 5200)),
      );

      // Creamos un array con 'count' estrellas.
      stars = Array.from({ length: count }, () => {
        // PROPORCIÓN DE ESTRELLAS GRANDES
        //
        // random() genera valores de 0 a 1.
        //
        // > 0.92 → aproximadamente 8% grandes.
        // > 0.80 → aproximadamente 20% grandes.
        // > 0.98 → aproximadamente 2% grandes.
        const large = random() > 0.92;

        return {
          // POSICIÓN INICIAL
          //
          // x = coordenada horizontal aleatoria.
          // y = coordenada vertical aleatoria.
          //
          // Se distribuyen por todo el canvas.
          x: random() * width,
          y: random() * height,

          // TAMAÑO DE LAS ESTRELLAS
          //
          // Grandes: radio entre 1.8 y 2.8 px.
          // Pequeñas: radio entre 0.7 y 1.6 px.
          //
          // AUMENTAR → estrellas más grandes.
          // REDUCIR  → estrellas más pequeñas.
          radius: large ? 1.8 + random() * 1.0 : 0.7 + random() * 0.9,

          // BRILLO
          //
          // Valor entre 0.3 y 0.8.
          //
          // 0 = completamente transparente.
          // 1 = completamente opaco.
          //
          // AUMENTAR → estrellas más luminosas.
          // REDUCIR  → estrellas más tenues.
          brightness: 0.3 + random() * 0.5,

          // VELOCIDAD HORIZONTAL
          //
          // Entre 3 y 6 píxeles por segundo.
          //
          // Positivo → hacia la derecha.
          // Negativo → hacia la izquierda.
          //
          // Valores más altos = movimiento más rápido.
          driftX: 3 + random() * 3,

          // VELOCIDAD VERTICAL
          //
          // Entre 1.5 y 3.5 píxeles por segundo.
          //
          // Positivo → hacia abajo.
          // Negativo → hacia arriba.
          driftY: 1.5 + random() * 2,

          // FASE INICIAL DEL PARPADEO
          //
          // Hace que las estrellas no parpadeen
          // todas al mismo tiempo.
          //
          // Math.PI * 2 representa un ciclo completo.
          phase: random() * Math.PI * 2,

          // FRECUENCIA DEL PARPADEO
          //
          // Entre 0.5 y 1.15 radianes/segundo.
          //
          // AUMENTAR → parpadeo más frecuente.
          // REDUCIR  → parpadeo más lento.
          twinkle: 0.5 + random() * 0.65,

          // COLOR
          //
          // < 0.2 → aproximadamente 20% azuladas.
          // El resto serán blancas.
          //
          // < 0.5 → aproximadamente 50% azuladas.
          // < 0.1 → aproximadamente 10% azuladas.
          blue: random() < 0.2,
        };
      });
    };

    // =================================================
    // 6. DIBUJAR ESTRELLAS
    // =================================================

    const draw = () => {
      // Limpia el fotograma anterior.
      //
      // Evita que las estrellas dejen rastros
      // durante su desplazamiento.
      ctx.clearRect(0, 0, width, height);

      // Recorremos todas las estrellas.
      for (const star of stars) {
        // MOVIMIENTO HORIZONTAL
        //
        // Posición inicial + tiempo * velocidad.
        //
        // El operador % hace que la estrella
        // reaparezca por la izquierda cuando
        // sobrepasa el borde derecho.
        const x = (star.x + elapsed * star.driftX) % width;

        // MOVIMIENTO VERTICAL
        //
        // La estrella baja con el tiempo.
        //
        // Al salir por debajo, reaparece arriba.
        const y = (star.y + elapsed * star.driftY) % height;

        // PARPADEO
        //
        // Math.sin genera una oscilación suave.
        //
        // 0.78 → brillo base de la oscilación.
        // 0.22 → amplitud de la oscilación.
        //
        // El multiplicador oscila entre 0.56 y 1.
        //
        // Si reducir movimiento está activado,
        // dejamos el brillo sin oscilaciones.
        const blink = reducedMotion.matches
          ? 1
          : 0.78 + 0.22 * Math.sin(elapsed * star.twinkle + star.phase);

        // Combinamos el brillo propio de cada
        // estrella con su parpadeo.
        const alpha = star.brightness * blink;

        // COLOR DE LA ESTRELLA
        //
        // Si blue=true, usamos azul claro.
        // Si blue=false, usamos blanco azulado.
        //
        // alpha controla la transparencia.
        ctx.fillStyle = star.blue
          ? `rgba(154, 211, 255, ${alpha})`
          : `rgba(239, 246, 255, ${alpha})`;

        // Comenzamos una nueva figura.
        ctx.beginPath();

        // Dibujamos un círculo.
        //
        // x, y       → posición.
        // star.radius → radio.
        // 0          → ángulo inicial.
        // Math.PI*2  → círculo completo.
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);

        // Rellenamos el círculo con el color elegido.
        ctx.fill();
      }
    };

    // =================================================
    // 7. ADAPTAR EL CANVAS A LA PANTALLA
    // =================================================

    const resize = () => {
      // Calculamos el ancho y alto del contenedor.
      width = Math.max(1, Math.round(root.clientWidth));

      height = Math.max(1, Math.round(root.clientHeight));

      // Relación de píxeles del dispositivo.
      //
      // En pantallas Retina suele ser 2.
      // Limitamos a 2 para evitar exceso de trabajo.
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      // Tamaño real del bitmap del canvas.
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      // Ajustamos la escala para dibujar usando
      // píxeles CSS y conservar buena nitidez.
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      // Regeneramos estrellas para el nuevo tamaño.
      makeStars();

      // Dibujamos inmediatamente.
      draw();
    };

    // =================================================
    // 8. BUCLE PRINCIPAL DE ANIMACIÓN
    // =================================================

    const animate = (now: number) => {
      // Si está detenida, no continuamos.
      if (!running) return;

      // CONTROL DE FPS
      //
      // 33 ms → aproximadamente 30 FPS.
      // 16 ms → aproximadamente 60 FPS.
      // 50 ms → aproximadamente 20 FPS.
      //
      // Menos FPS = menos dibujos y menor carga.
      if (lastFrame === 0 || now - lastFrame >= 33) {
        if (lastFrame !== 0) {
          // Convertimos milisegundos a segundos.
          //
          // Math.min(..., 0.05) limita el salto
          // de tiempo a 50 ms por fotograma.
          //
          // Evita saltos grandes cuando el navegador
          // se ralentiza, aunque puede hacer que
          // el movimiento avance más despacio.
          elapsed += Math.min((now - lastFrame) / 1000, 0.05);
        }

        // Guardamos el tiempo del fotograma.
        lastFrame = now;

        // Dibujamos las nuevas posiciones.
        draw();
      }

      // Solicitamos el siguiente fotograma.
      frameId = requestAnimationFrame(animate);
    };

    // =================================================
    // 9. INICIAR O DETENER LA ANIMACIÓN
    // =================================================

    const syncAnimation = () => {
      // Animar solamente cuando:
      //
      // 1. El componente está visible.
      // 2. La pestaña está activa.
      // 3. El usuario no solicita reducir movimiento.
      const shouldRun = inView && !document.hidden && !reducedMotion.matches;

      if (shouldRun && !running) {
        // Iniciar animación.
        running = true;
        lastFrame = 0;

        frameId = requestAnimationFrame(animate);
      } else if (!shouldRun && running) {
        // Detener animación.
        running = false;
        cancelAnimationFrame(frameId);

        // Dejar visible el último estado del fondo.
        draw();
      }
    };

    // =================================================
    // 10. OBSERVADORES DEL NAVEGADOR
    // =================================================

    // Detecta cambios en el tamaño del contenedor.
    //
    // Por ejemplo, al redimensionar la ventana.
    const resizeObserver = new ResizeObserver(resize);

    // Detecta si el fondo entra o sale de pantalla.
    //
    // Si deja de estar visible, se puede detener
    // la animación para ahorrar recursos.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;

      // Recalculamos si debe animarse.
      syncAnimation();
    });

    // Se ejecuta cuando cambiamos de pestaña.
    const onVisibilityChange = () => {
      syncAnimation();
    };

    // =================================================
    // 11. INICIALIZACIÓN
    // =================================================

    // Establecer dimensiones y crear estrellas.
    resize();

    // Vigilar cambios de tamaño.
    resizeObserver.observe(root);

    // Vigilar si el componente está visible.
    intersectionObserver.observe(root);

    // Escuchar cambios de visibilidad de la pestaña.
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Escuchar cambios en preferencias de movimiento.
    reducedMotion.addEventListener("change", syncAnimation);

    // Iniciar la animación si corresponde.
    syncAnimation();

    // =================================================
    // 12. LIMPIEZA DE RECURSOS
    // =================================================

    // React ejecuta esta función cuando
    // desmonta el componente.
    //
    // Evita animaciones duplicadas, observadores
    // activos innecesariamente y fugas de memoria.
    return () => {
      running = false;

      // Cancelar fotogramas pendientes.
      cancelAnimationFrame(frameId);

      // Desconectar observadores.
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      // Eliminar eventos.
      document.removeEventListener("visibilitychange", onVisibilityChange);

      reducedMotion.removeEventListener("change", syncAnimation);
    };
  }, []);

  // ===================================================
  // 13. ESTRUCTURA VISUAL
  // ===================================================

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden [background:linear-gradient(120deg,#01050f_5%,#061026_55%,#020713_100%)]"
      aria-hidden="true"
    >
      {/* Nebulosa azul; el keyframe compartido está en globals.css. */}
      <div className="absolute -inset-[8%] animate-[lab-starfield-nebula-float_65s_ease-in-out_infinite_alternate] [background:radial-gradient(ellipse_38%_28%_at_78%_35%,rgba(38,100,186,0.25),transparent_80%),radial-gradient(ellipse_44%_37%_at_67%_52%,rgba(18,49,115,0.22),transparent_76%),radial-gradient(ellipse_25%_28%_at_90%_60%,rgba(58,92,160,0.12),transparent_75%)] blur-[18px] motion-reduce:animate-none" />

      {/* Canvas:
          Dibuja las estrellas animadas */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

      {/* Capa oscura:
          Mejora la legibilidad del contenido.
          Se configura desde CSS. */}
      <div className="absolute inset-0 [background:linear-gradient(90deg,rgba(1,5,14,0.23),transparent_62%)]" />
    </div>
  );
};
