import { TutorContextBridge } from "@/features/ai/components/TutorProvider";
import { OrbitGallery } from "./OrbitGallery";
import styles from "./ThreeBody.module.css";
import { orbits } from "../data/orbits";
import { getOrbitPlayback } from "../server/orbit-data";

export const ThreeBodyScreen = () => {
  const animationData = Object.fromEntries(orbits.map(({ slug }) => [slug, getOrbitPlayback(slug)]));
  return (
    <section lang="es" aria-labelledby="gallery-title" className={`${styles.page} page-enter`}>
      <TutorContextBridge context={{ kind: "three-body" }} />
      <div className="page-intro">
        <p className="eyebrow">
          <span className="status-dot" /> EL PROBLEMA DE LOS TRES CUERPOS
        </p>
        <h1 id="gallery-title">
          El orden dentro
          <br />
          de la <span>complejidad.</span>
        </h1>
        <div className="intro-bottom">
          <p>
            Seis soluciones extraordinarias. Tres cuerpos que se atraen.
            <br />
            Descubre los patrones que esconde la gravedad.
          </p>
          <span className="catalog-meta">
            06 SOLUCIONES
            <br />
            <span>Un mismo universo</span>
          </span>
        </div>
      </div>
      <OrbitGallery animationData={animationData} />
      <aside className="gallery-science-note">
        <span>i</span>
        <p>
          Estas no son curvas decorativas. Cada trayectoria se calcula
          integrando las ecuaciones de Newton con condiciones iniciales
          documentadas. Masas iguales, G = 1 y unidades normalizadas.
        </p>
      </aside>
    </section>
  );
};

