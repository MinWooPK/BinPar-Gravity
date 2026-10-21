import { orbits, publishedOrbits } from "@/features/three-body/data/orbits";
import { OrbitPlayer } from "./OrbitPlayer";
import { getOrbitPlayback } from "@/features/three-body/infrastructure/orbitPlayback";
import { getLocale } from "next-intl/server";
import type { OrbitDefinition } from "../../../types/orbit.types";

import { OrbitDetailNavigation } from "./orbit-detail/OrbitDetailNavigation";
import { OrbitDetailInformation } from "./orbit-detail/OrbitDetailInformation";

// Muestra el reproductor y la información de la órbita.
export const OrbitDetail = async ({ orbit }: { orbit: OrbitDefinition }) => {
  const locale = await getLocale();

  // Obtiene la siguiente órbita y su período original.
  const index = orbits.indexOf(orbit);
  const next = orbits[(index + 1) % orbits.length]!;
  const original = publishedOrbits.find((item) => item.slug === orbit.slug)!;

  return (
    <section
      lang={locale}
      className="detail-page relative z-1 mx-auto w-[min(100%-2rem,80rem)] min-w-0 
      pt-2 pb-6 text-lab-text min-[640px]:w-[min(100%-3rem,80rem)] [&_svg]:shrink-0
      [&_:is(a,button,summary,[tabindex]):focus-visible]:outline-[3px] [&_:is(a,button,summary,[tabindex]):focus-visible]:outline-[#c7baff] 
      [&_:is(a,button,summary,[tabindex]):focus-visible]:outline-offset-[3px] [&_:is(h1,h2,h3,p)]:wrap-anywhere
      animate-[lab-page-enter_450ms_ease-out_both] motion-reduce:animate-none"
    >
      <h1 className="sr-only">{orbit.name}</h1>

      <OrbitDetailNavigation next={next} />

      <div
        className="grid min-w-0 grid-cols-1 items-stretch gap-4 min-[1100px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
        data-orbit-detail-layout
      >
        <OrbitPlayer
          key={orbit.slug}
          data={getOrbitPlayback(orbit.slug)}
          name={orbit.name}
        >
          <section
            className="mt-2.5 min-w-0 border-t border-lab-line pt-2.5 [&_h3]:m-0 [&_h3]:mb-1.5 [&_h3]:text-sm 
            [&_h3]:leading-[1.4] [&_h3]:font-semibold [&_h3]:text-[#e3e6f2] [&_p]:m-0 [&_p]:text-[0.8125rem] 
            [&_p]:leading-normal [&_p]:text-[#b6bdd0]"
            aria-labelledby="orbit-physical-model-title"
            data-orbit-detail-model
          />
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
