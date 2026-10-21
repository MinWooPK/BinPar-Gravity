"use client";

import { ArrowLeft } from "@/components/icons";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Earth3D from "../scene/Earth3D";
import { SpaceBackground } from "@/components/ui/SpaceBackground/SpaceBackground";

type HomeView = "introduction" | "topics";
type HomeContextValue = {
  topicsVisible: boolean;
  showTopics: () => void;
};
const HomeContext = createContext<HomeContextValue | null>(null);

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

  const changeView = (next: HomeView) => {
    restoreFocus.current = true;
    const url =
      next === "topics"
        ? "#explore"
        : window.location.pathname + window.location.search;
    window.history.replaceState(window.history.state, "", url);
    setView(next);
  };

  useEffect(() => {
    const syncHash = () =>
      setView(window.location.hash === "#explore" ? "topics" : "introduction");
    const frame = requestAnimationFrame(syncHash);
    window.addEventListener("hashchange", syncHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

  useLayoutEffect(() => {
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
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
        className="lab-home-screen relative [isolation:isolate] flex [flex:1] w-full min-w-0 min-h-0"
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
        <div className="fixed [inset:0] [z-index:0] pointer-events-none">
          <SpaceBackground />
          {/* This layer stays mounted across views, preserving the scene and rotation. */}
          <div className="absolute [inset:0] pointer-events-none [opacity:.3] min-[1024px]:[opacity:1]">
            <Earth3D />
          </div>
        </div>
        <div
          ref={viewportRef}
          className="[&::-webkit-scrollbar]:hidden relative [z-index:1] flex flex-col w-full [max-width:80rem] min-w-0 min-h-0 [margin-inline:auto] [padding:1.5rem_max(1rem,_env(safe-area-inset-right))_1.5rem_max(1rem,_env(safe-area-inset-left))] overflow-x-hidden overflow-y-auto [overscroll-behavior-y:contain] [scrollbar-width:none] [scroll-behavior:auto] pointer-events-none min-[640px]:[padding:2rem_1.5rem] min-[1024px]:[padding:2rem]"
        >
          <div
            hidden={view !== "introduction"}
            className="[&[hidden]]:hidden [&:not([hidden])]:animate-[lab-home-view-enter_240ms_ease-out_both] motion-reduce:[&:not([hidden])]:animate-none focus-visible:[outline:2px_solid_#c0b3ff] focus-visible:outline-offset-4 focus-visible:rounded-[8px] shrink-0 w-full min-w-0 [margin-block:auto] pointer-events-auto min-[1024px]:[max-width:52%] min-[1024px]:[text-shadow:0_2px_16px_#070b14]"
          >
            {introduction}
          </div>
          <section
            ref={topicsRef}
            id="explore"
            aria-labelledby="explore-title"
            tabIndex={-1}
            hidden={view !== "topics"}
            className="[&[hidden]]:hidden [&:not([hidden])]:animate-[lab-home-view-enter_240ms_ease-out_both] motion-reduce:[&:not([hidden])]:animate-none focus-visible:[outline:2px_solid_#c0b3ff] focus-visible:outline-offset-4 focus-visible:rounded-[8px] shrink-0 w-full min-w-0 [margin-block:auto] pointer-events-auto [max-width:52rem]"
          >
            <div className="sticky [top:0] [z-index:2] grid [grid-template-columns:auto_minmax(0,_max-content)] items-center [gap:.75rem] max-w-full [width:fit-content] [border-radius:.75rem] [background:#070b14dd]">
              <button
                type="button"
                aria-label={t("backToHome")}
                onClick={() => changeView("introduction")}
                className="group/home-back [&:hover]:bg-[#1e293b] focus-visible:[outline:2px_solid_#38bdf8] focus-visible:outline-offset-[3px] motion-reduce:[transition:none] inline-flex shrink-0 items-center justify-center [min-width:44px] [min-height:44px] [padding:.25rem_.5rem] [border:0] [border-radius:.75rem] [background:transparent] [color:#a2f3fd] [line-height:1] cursor-pointer [transition:background_180ms]"
              >
                <ArrowLeft
                  className="motion-safe:group-hover/home-back:animate-[lab-home-back-nudge_800ms_ease-in-out_infinite] block [width:1.5rem] [height:1.5rem]"
                  strokeWidth="2"
                />
              </button>
              <h2
                id="explore-title"
                className="block [width:fit-content] min-w-0 m-0 [color:#a2f3fd] [font-family:var(--font-geist-sans),_Arial,_Helvetica,_sans-serif] [font-size:clamp(1rem,_2vw,_1.25rem)] font-bold [line-height:1.3] [letter-spacing:.05em] uppercase [overflow-wrap:anywhere]"
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

export const HomeExploreButton = ({ className }: { className: string }) => {
  const t = useTranslations("Home");
  const context = useContext(HomeContext);
  if (!context) throw new Error("HomeExploreButton requires HomeExperience");
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
