import css from "./HomeExperience.module.css";

/** Static Tailwind classes; CSS retains only specialized selectors and motion. */
export const homeExperienceStyles = {
  screen: `${css["screen"]} relative [isolation:isolate] flex [flex:1] w-full min-w-0 min-h-0`,
  scenery: "fixed [inset:0] [z-index:0] pointer-events-none",
  earth:
    "absolute [inset:0] pointer-events-none [opacity:.3] min-[1024px]:[opacity:1]",
  viewport: `${css["viewport"]} relative [z-index:1] flex flex-col w-full [max-width:80rem] min-w-0 min-h-0 [margin-inline:auto] [padding:1.5rem_max(1rem,_env(safe-area-inset-right))_1.5rem_max(1rem,_env(safe-area-inset-left))] overflow-x-hidden overflow-y-auto [overscroll-behavior-y:contain] [scrollbar-width:none] [scroll-behavior:auto] pointer-events-none min-[640px]:[padding:2rem_1.5rem] min-[1024px]:[padding:2rem]`,
  panel: `${css["panel"]} shrink-0 w-full min-w-0 [margin-block:auto] pointer-events-auto`,
  topics: "[max-width:52rem]",
  topicsHeader:
    "sticky [top:0] [z-index:2] grid [grid-template-columns:auto_minmax(0,_max-content)] items-center [gap:.75rem] max-w-full [width:fit-content] [border-radius:.75rem] [background:#070b14dd]",
  topicsTitle:
    "block [width:fit-content] min-w-0 m-0 [color:#a2f3fd] [font-family:var(--font-geist-sans),_Arial,_Helvetica,_sans-serif] [font-size:clamp(1rem,_2vw,_1.25rem)] font-bold [line-height:1.3] [letter-spacing:.05em] uppercase [overflow-wrap:anywhere]",
  backButton: `${css["backButton"]} inline-flex shrink-0 items-center justify-center [min-width:44px] [min-height:44px] [padding:.25rem_.5rem] [border:0] [border-radius:.75rem] [background:transparent] [color:#a2f3fd] [line-height:1] cursor-pointer [transition:background_180ms]`,
  backIcon: `${css["backIcon"]} block [width:1.5rem] [height:1.5rem]`,
  topicArrow: `${css["topicArrow"]} inline-block`,
  topicCard: `${css["topicCard"]} `,
  introduction:
    "min-[1024px]:[max-width:52%] min-[1024px]:[text-shadow:0_2px_16px_#070b14]",
  orbitArtwork: `${css["orbitArtwork"]} [border-color:#272c40] [background-color:#0c1120] [background-size:28px_28px]`,
  orbitPreview: `${css["orbitPreview"]} w-full h-full`,
} as const;
