import { Link } from "@/i18n/navigation";
import styles from "@/features/three-body/components/ThreeBody.module.css";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrbit, orbits, publishedOrbits } from "@/features/three-body/data/orbits";
import { Icon } from "@/components/icons";
import { OrbitPlayer } from "@/features/three-body/components/OrbitPlayer";
import { getOrbitPlayback } from "@/features/three-body/server/orbit-data";
export const dynamicParams = false;
export function generateStaticParams() {
  return orbits.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const orbit = getOrbit((await params).slug);
  return {
    title: orbit?.name ?? "Órbita no encontrada",
    description: orbit?.description,
  };
}
export default async function OrbitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const orbit = getOrbit((await params).slug);
  if (!orbit) notFound();
  const index = orbits.indexOf(orbit);
  const next = orbits[(index + 1) % orbits.length]!;
  const original = publishedOrbits.find((o) => o.slug === orbit.slug)!;
  return (
    <section lang="es" className={`${styles.page} page-enter detail-page`}>
      <Link href="/three-body" scroll={false} className="back-link">
        <span>←</span> Volver a la galería
      </Link>
      <div className="detail-title">
        <div>
          <p className="eyebrow">
            ÓRBITA {String(index + 1).padStart(2, "0")} / 06{" "}
            <span className="badge">{orbit.category}</span>
          </p>
          <h1>
            {orbit.name}
            <span>.</span>
          </h1>
          <p>{orbit.description}</p>
        </div>
        <div className="period-stat">
          <span>PERÍODO</span>
          <strong>
            {orbit.period.toFixed(4)} <small>u.t.</small>
          </strong>
        </div>
      </div>
      <OrbitPlayer key={orbit.slug} data={getOrbitPlayback(orbit.slug)} name={orbit.name} />
      <div className="detail-info">
        <section>
          <p className="eyebrow">QUÉ ESTÁS VIENDO</p>
          <h2>Una danza gravitacional.</h2>
          <p>{orbit.insight}</p>
          <p>
            Son cuerpos puntuales ideales: los puntos visibles no representan su
            tamaño real. Las tres masas son iguales. Las unidades de esta
            galería son adimensionales y no se deben interpretar como
            kilogramos, metros o segundos.
          </p>
        </section>
        <section className="conditions panel">
          <h2>El punto de partida</h2>
          <p>{orbit.convention}</p>
          <div className="table-scroll">
            <table>
              <caption>Condiciones iniciales de la órbita</caption>
              <thead>
                <tr>
                  <th scope="col">Cuerpo</th>
                  <th scope="col">x</th>
                  <th scope="col">y</th>
                  <th scope="col">vₓ</th>
                  <th scope="col">vᵧ</th>
                </tr>
              </thead>
              <tbody>
                {orbit.initial.map((body, i) => (
                  <tr key={i}>
                    <th scope="row">{i + 1}</th>
                    {body.map((value, j) => (
                      <td key={j}>{value.toFixed(8)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            href={orbit.source}
            target="_blank"
            rel="noreferrer"
            className="source-link"
          >
            {orbit.sourceLabel} <Icon name="external" />
          </a>
          {index >= 2 && (
            <p className="condition-note">
              Semilla publicada con refinamiento numérico local de velocidades y
              período. T publicado: {original.period.toFixed(8)}. Los parámetros publicados y sus ajustes están incluidos en los datos de la galería.
            </p>
          )}
        </section>
      </div>
      <div className="next-orbit">
        <span>SIGUE EXPLORANDO</span>
        <Link href={`/three-body/${next.slug}`}>
          {next.name} <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}
