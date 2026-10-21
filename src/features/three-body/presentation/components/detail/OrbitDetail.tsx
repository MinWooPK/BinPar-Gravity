import { orbits, publishedOrbits } from "@/features/three-body/data/orbits";
import { OrbitPlayer } from "./OrbitPlayer";
import { getOrbitPlayback } from "@/features/three-body/infrastructure/orbitPlayback";
import { getLocale } from "next-intl/server";
import type { OrbitDefinition } from "../../../types/orbit.types";

import { OrbitDetailNavigation } from "./orbit-detail/OrbitDetailNavigation";
import { OrbitDetailInformation } from "./orbit-detail/OrbitDetailInformation";

// Organiza la ficha de una órbita sin cambiar el reproductor ni su navegación.
export const OrbitDetail = async ({ orbit }: { orbit: OrbitDefinition }) => {
  const locale = await getLocale();

  // Calcula la órbita siguiente y recupera los datos originales publicados.
  const index = orbits.indexOf(orbit);
  const next = orbits[(index + 1) % orbits.length]!;
  const original = publishedOrbits.find((item) => item.slug === orbit.slug)!;

  return (
    <section
      lang={locale}
      className="relative [z-index:1] [width:min(100%_-_2rem,_80rem)] min-w-0 [margin-inline:auto] [padding-block:8px_24px] text-lab-text min-[640px]:[width:min(100%_-_3rem,_80rem)] [&_svg]:shrink-0 [&_:is(a,_button,_summary,_[tabindex]):focus-visible]:[outline:3px_solid_#c7baff] [&_:is(a,_button,_summary,_[tabindex]):focus-visible]:[outline-offset:3px] [&_:is(h1,_h2,_h3,_p)]:[overflow-wrap:anywhere] animate-[lab-page-enter_450ms_ease-out_both] motion-reduce:animate-none detail-page"
    >
      <h1 className="sr-only">{orbit.name}</h1>

      <OrbitDetailNavigation next={next} />

      <div
        className="grid [grid-template-columns:minmax(0,_1fr)] items-stretch [gap:16px] min-w-0 min-[1100px]:[grid-template-columns:minmax(0,_1.1fr)_minmax(0,_.9fr)]"
        data-orbit-detail-layout
      >
        <OrbitPlayer
          key={orbit.slug}
          data={getOrbitPlayback(orbit.slug)}
          name={orbit.name}
        >
          <section
            className="[margin-top:10px] min-w-0 [padding-top:10px] border-t border-solid border-lab-line [&_h3]:[margin:0_0_6px] [&_h3]:[color:#e3e6f2] [&_h3]:[font-size:0.875rem] [&_h3]:font-semibold [&_h3]:[line-height:1.4] [&_p]:m-0 [&_p]:[color:#b6bdd0] [&_p]:[font-size:0.8125rem] [&_p]:[line-height:1.5]"
            aria-labelledby="orbit-physical-model-title"
            data-orbit-detail-model
          ></section>
        </OrbitPlayer>

        <OrbitDetailInformation
          orbit={orbit}
          index={index}
          total={orbits.length}
          originalPeriod={original.period}
        />
      </div>
    </section>
  );
};
