"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";

import { ArrowLeft } from "@/components/icons";
import { SpaceBackground } from "@/components/ui/SpaceBackground";

import Earth3D from "../scene/Earth3D";

type HomeView = "introduction" | "topics";

type HomeContextValue = {
  topicsVisible: boolean;
  showTopics: () => void;
};

const HomeContext = createContext<HomeContextValue | null>(null);

// Controla la introducción y la exploración de temas.
export const HomeExperience = ({
  introduction,
  topics,
}: {
  introduction: ReactNode;
  topics: ReactNode;
}) => {
  const t = useTranslations("Home");

  const [view, setView] = useState<HomeView>("introduction");

  const viewportRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLElement>(null);
  const restoreFocus = useRef(false);

  // Cambia la vista y actualiza la URL.
  const changeView = (next: HomeView) => {
    restoreFocus.current = true;

    const url =
      next === "topics"
        ? "#explore"
        : window.location.pathname + window.location.search;

    window.history.replaceState(window.history.state, "", url);
    setView(next);
  };

  // Sincroniza la vista con la URL.
  useEffect(() => {
    const syncHash = () => {
      setView(window.location.hash === "#explore" ? "topics" : "introduction");
    };

    const frame = requestAnimationFrame(syncHash);

    window.addEventListener("hashchange", syncHash);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

  // Restablece el scroll y el foco al cambiar de vista.
  useLayoutEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }

    if (restoreFocus.current) {
      const target =
        view === "topics"
          ? topicsRef.current
          : viewportRef.current?.querySelector<HTMLButtonElement>(
              "[data-home-explore]",
            );

      target?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [view]);

  return (
    <HomeContext.Provider
      value={{
        topicsVisible: view === "topics",
        showTopics: () => changeView("topics"),
      }}
    >
      <div
        className="lab-home-screen relative isolate flex min-h-0 min-w-0 w-full flex-1"
        onKeyDown={(event) => {
          if (
            event.key === "Escape" &&
            !event.defaultPrevented &&
            view === "topics"
          ) {
            event.preventDefault();
            changeView("introduction");
          }
        }}
      >
        {/* Fondo y Tierra 3D. */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <SpaceBackground />

          <div className="pointer-events-none absolute inset-0 opacity-30 min-[1024px]:opacity-100">
            <Earth3D />
          </div>
        </div>

        {/* Contenedor de las vistas. */}
        <div
          ref={viewportRef}
          className="pointer-events-none relative z-1 mx-auto flex min-h-0 min-w-0 w-full max-w-7xl flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-auto
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            pt-6 pr-[max(1rem,env(safe-area-inset-right))] pb-6 pl-[max(1rem,env(safe-area-inset-left))]
            min-[640px]:p-8 min-[640px]:px-6
            min-[1024px]:p-8"
        >
          {/* Introducción. */}
          <div
            hidden={view !== "introduction"}
            className="pointer-events-auto my-auto w-full min-w-0 shrink-0
              [&[hidden]]:hidden
              [&:not([hidden])]:animate-[lab-home-view-enter_240ms_ease-out_both]
              motion-reduce:[&:not([hidden])]:animate-none
              focus-visible:rounded-lg
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-[#c0b3ff]
              min-[1024px]:max-w-[52%]
              min-[1024px]:[text-shadow:0_2px_16px_#070b14]"
          >
            {introduction}
          </div>

          {/* Exploración de temas. */}
          <section
            ref={topicsRef}
            id="explore"
            aria-labelledby="explore-title"
            tabIndex={-1}
            hidden={view !== "topics"}
            className="pointer-events-auto my-auto w-full max-w-[52rem] min-w-0 shrink-0
              [&[hidden]]:hidden
              [&:not([hidden])]:animate-[lab-home-view-enter_240ms_ease-out_both]
              motion-reduce:[&:not([hidden])]:animate-none
              focus-visible:rounded-lg
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-[#c0b3ff]"
          >
            {/* Regreso a la introducción. */}
            <div className="sticky top-0 z-2 grid w-fit max-w-full grid-cols-[auto_minmax(0,max-content)] items-center gap-3 rounded-xl bg-[#070b14dd]">
              <button
                type="button"
                aria-label={t("backToHome")}
                onClick={() => changeView("introduction")}
                className="group/home-back inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-transparent px-2 py-1 text-[#a2f3fd] transition-colors duration-[180ms] hover:bg-[#1e293b] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#38bdf8] motion-reduce:transition-none"
              >
                <ArrowLeft
                  className="block size-6 motion-safe:group-hover/home-back:animate-[lab-home-back-nudge_800ms_ease-in-out_infinite]"
                  strokeWidth="2"
                />
              </button>

              <h2
                id="explore-title"
                className="block w-fit min-w-0 text-[clamp(1rem,2vw,1.25rem)] leading-[1.3] font-bold tracking-[.05em] text-[#a2f3fd] uppercase wrap-anywhere [font-family:var(--font-geist-sans),Arial,Helvetica,sans-serif]"
              >
                {t("exploreEyebrow")}
              </h2>
            </div>

            {topics}
          </section>
        </div>
      </div>
    </HomeContext.Provider>
  );
};

// Botón para acceder a la exploración de temas.
export const HomeExploreButton = ({ className }: { className: string }) => {
  const t = useTranslations("Home");
  const context = useContext(HomeContext);

  if (!context) {
    throw new Error("HomeExploreButton requires HomeExperience");
  }

  return (
    <button
      data-home-explore
      type="button"
      aria-controls="explore"
      aria-expanded={context.topicsVisible}
      onClick={context.showTopics}
      className={className}
    >
      {t("explore")}
    </button>
  );
};
