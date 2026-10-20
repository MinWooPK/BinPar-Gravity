import css from "./ThreeBodyJourney.module.css";

/** Static Tailwind classes; CSS retains only specialized selectors and motion. */
export const threeBodyJourneyStyles = {
  titleRow: `${css["titleRow"]} flex w-full min-w-0 items-center gap-3`,
  screen: `${css["screen"]} relative [z-index:1] flex [flex:1] flex-col w-full [max-width:80rem] min-w-0 [min-height:calc(100dvh_-_var(--site-header-height,_64px)_-_84px)] [margin-inline:auto] [padding:clamp(.5rem,_1svh,_1rem)_1rem_1rem] min-[640px]:[padding-inline:1.5rem] min-[1100px]:[padding-inline:2rem]`,
  view: `${css["view"]} flex [flex:1] flex-col min-w-0`,
  hero: `${css["hero"]} min-w-0 [padding-block:clamp(2rem,_6vh,_5rem)]`,
  eyebrow:
    "[margin:0_0_clamp(1.5rem,_4vh,_3rem)] [color:#b8b0d6] [font-size:clamp(.75rem,_1.1vw,_.95rem)] font-bold [letter-spacing:.23em] uppercase",
  description:
    "[max-width:65rem] [margin:clamp(1.5rem,_4vh,_3rem)_0_0] [color:#cbd5e1] [font-size:clamp(1rem,_1.5vw,_1.25rem)] [line-height:1.7]",
  navigation: "min-w-0 [margin-bottom:1rem] min-[1024px]:m-0",
  navigationTitle:
    "[margin:0_0_1.25rem] [color:#b8b0d6] [font-size:.875rem] font-semibold [letter-spacing:.1em] uppercase",
  stageList: "grid [grid-template-columns:minmax(0,_1fr)] [gap:12px]",
  entry: `${css["entry"]} flex items-baseline [gap:12px] w-full min-w-0 [min-height:48px] [padding:14px_16px] [border:1px_solid_#30364b] [border-radius:10px] bg-lab-surface [color:#e4e8f2] [font-size:1rem] [line-height:1.5] text-left cursor-pointer [transition:background_180ms,_border-color_180ms] [@media(max-width:374px)]:[padding-inline:10px]`,
  entryDescription:
    "block [margin-top:6px] [color:#b2bad0] [font-size:.875rem] [line-height:1.5]",
  number:
    "shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:.9375rem] font-normal [font-variant-numeric:tabular-nums]",
  freedomNote:
    "[margin:1.25rem_0_0] [color:#b2bad0] [font-size:.9375rem] [line-height:1.6]",
  stageNavigation:
    "relative [z-index:20] grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 mb-3 border-b border-slate-700 pb-3 min-[1024px]:[grid-template-columns:auto_minmax(0,_1fr)_auto]",
  backButton: `${css["backButton"]} inline-flex [min-width:44px] [min-height:44px] items-center justify-center [padding:8px] [border:0] [border-radius:8px] [background:transparent] [color:#e2e8f0] cursor-pointer`,
  stageHeading:
    "flex min-w-0 items-baseline [gap:1rem] m-0 text-lab-text [font-size:clamp(1.5rem,_2vw,_1.75rem)] font-semibold [line-height:1.25] [letter-spacing:-.025em] [overflow-wrap:anywhere] [@media(max-width:374px)]:[gap:.5rem]",
  selector: "[grid-column:1_/_-1] min-w-0 min-[1024px]:[grid-column:auto]",
  panel: `${css["panel"]} min-w-0`,
} as const;
