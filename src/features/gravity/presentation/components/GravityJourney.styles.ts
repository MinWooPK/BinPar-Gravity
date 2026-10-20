import css from "./GravityJourney.module.css";

/** Static Tailwind classes; CSS retains only specialized selectors and motion. */
export const gravityJourneyStyles = {
  titleRow: `${css["titleRow"]} flex w-full min-w-0 items-center gap-3`,
  entryDescription:
    "block [margin-top:6px] [color:#b2bad0] [font-size:.875rem] [line-height:1.5]",
  page: "flex [flex:1] min-w-0 min-h-0",
  screen: `${css["screen"]} [--gravity-stage-offset:1rem] flex [flex:1] flex-col w-full [max-width:80rem] min-h-0 [margin-inline:auto] [padding-block:clamp(.5rem,_1svh,_1rem)_max(.5rem,_env(safe-area-inset-bottom))] [padding-left:max(1rem,_env(safe-area-inset-left))] [padding-right:max(1rem,_env(safe-area-inset-right))] [@media(max-width:1023px)]:[flex:none]`,
  pageHeader: `${css["pageHeader"]} shrink-0 [margin-bottom:clamp(1rem,_2svh,_1.5rem)]`,
  workspace: `${css["workspace"]} flex [flex:1] flex-col min-w-0 min-h-0 [@media(max-width:1023px)]:[flex:none]`,
  hero: `${css["hero"]} shrink-0 [margin-block:auto] [padding-block:clamp(2rem,_6vh,_5rem)]`,
  heroEyebrow: `${css["heroEyebrow"]} [margin:0_0_clamp(1.5rem,_4vh,_3rem)] [color:#b8b0d6] [font-size:clamp(.75rem,_1.7vw,_1.25rem)] font-bold [letter-spacing:.23em] uppercase`,
  heroTitle: `${css["heroTitle"]} m-0 [color:#f8fafc] [font-size:clamp(3.25rem,_9vw,_8rem)] font-extrabold [line-height:1.05] [letter-spacing:-.065em]`,
  heroDescription: `${css["heroDescription"]} [max-width:65rem] [margin:clamp(1.5rem,_4vh,_3rem)_0_0] [color:#cbd5e1] [font-size:clamp(1rem,_2.4vw,_1.75rem)] [line-height:1.7]`,
  viewport: `${css["viewport"]} flex flex-col [flex:1] min-w-0 min-h-0 overflow-x-auto overflow-y-auto [overscroll-behavior-y:contain] [scrollbar-width:none] [scroll-behavior:auto] [scroll-padding-block:1rem] [padding:4px_8px_8px] [@media(max-width:1023px)]:block [@media(max-width:1023px)]:[flex:none] [@media(max-width:1023px)]:[overflow:visible]`,
  panel: `${css["panel"]} min-w-0`,
  navigation: `${css["navigation"]} shrink-0 [margin:0_0_.5rem]`,
  navigationTitle: `${css["navigationTitle"]} [margin:0_0_10px] [color:#b8b0d6] [font-size:14px] font-semibold [letter-spacing:.1em] uppercase [@media(max-width:600px)]:[font-size:12px]`,
  tabList: `${css["tabList"]} grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:12px] [@media(max-width:600px)]:[gap:6px]`,
  tab: `${css["tab"]} flex items-baseline [gap:12px] w-full min-w-0 [min-height:48px] [padding:14px_16px] [border:1px_solid_#30364b] [border-radius:10px] bg-lab-surface [color:#e4e8f2] [font-size:16px] [line-height:1.5] text-left [overflow-wrap:anywhere] cursor-pointer [transition:background_180ms,_border-color_180ms,_color_180ms] [@media(max-width:600px)]:flex-col [@media(max-width:600px)]:[align-items:flex-start] [@media(max-width:600px)]:[gap:4px] [@media(max-width:600px)]:[padding:10px_8px] [@media(max-width:600px)]:[font-size:13px]`,
  continueLink: `${css["continueLink"]} inline-flex items-center [gap:1rem] [min-height:44px] [padding:.5rem_0] [border-radius:5px] [color:#c9bcff] [font-size:1rem] [text-decoration:none]`,
  stageNumber:
    "shrink-0 [color:#b9a8ff] [font-family:var(--font-geist-mono),_monospace] [font-size:15px] [font-variant-numeric:tabular-nums] [@media(max-width:600px)]:[font-size:12px]",
  freedomNote: `${css["freedomNote"]} [margin:10px_0_0] [color:#b2bad0] [font-size:15px] [line-height:1.6] [@media(max-width:600px)]:[font-size:13px]`,
  stageHeader: `${css["stageHeader"]} flex min-w-0 items-baseline [gap:1rem] m-0 [padding:.25rem_0] [@media(max-width:600px)]:[gap:.75rem]`,
  stage:
    "min-w-0 [padding-block:.25rem] [scroll-margin-top:var(--gravity-stage-offset)]",
} as const;
