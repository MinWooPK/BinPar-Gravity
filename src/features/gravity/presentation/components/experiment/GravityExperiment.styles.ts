import css from "./GravityExperiment.module.css";

/** Static Tailwind classes; CSS retains only specialized selectors and motion. */
export const gravityExperimentStyles = {
  "gravity-lab": `${css["gravity-lab"]} [--line:#272c40] [--purple:#aa97ff] [--mint:#5ee7d5] w-full min-w-0 text-lab-text [font-size:1rem] [line-height:1.5]`,
  "panel": `${css["panel"]} flex flex-col justify-between [border:1px_solid_var(--line)] [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)]`,
  "lab-header": "flex items-center justify-between flex-wrap [gap:8px_16px] [padding:8px_14px_0] [@media(max-width:600px)]:[padding:14px_14px_0]",
  "heading": "[flex:1_1_180px] min-w-0 m-0 text-lab-text [font-size:1.125rem] font-semibold [line-height:1.4]",
  "headerActions": "flex flex-wrap [gap:8px] min-w-0",
  "resetButton": `${css["resetButton"]} inline-flex shrink-0 items-center justify-center [gap:8px] [min-height:44px] [padding:8px_12px] [border:1px_solid_#544776] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] [font-size:14px] [line-height:1.5] cursor-pointer [transition:background_180ms,_color_180ms]`,
  "lab-sliders": "min-w-0 [padding:6px_14px_0] [@media(max-width:600px)]:[padding-inline:14px]",
  "controlsHint": "[margin:0_0_6px] [color:#b2bad0] [font-size:.875rem] [line-height:1.5]",
  "slider-field": `${css["slider-field"]} min-w-0 [margin-bottom:0]`,
  "range-limits": `${css["range-limits"]} flex justify-between [gap:8px] [color:#a0a8bd] [font-size:13px] [line-height:1.2]`,
  "explanationPanel": "[padding:0_14px_6px] [@media(max-width:600px)]:[padding-inline:14px]",
  "forceExplanation": "min-w-0 m-0 [padding:0_0_0_10px] [border-left:2px_solid_#5ee7d580] [color:#d0d4e3] [font-size:.875rem] [line-height:1.5] [overflow-wrap:anywhere]",
  "helperDetails": `${css["helperDetails"]} min-w-0 [margin:6px_0_0] [border-top:1px_solid_var(--line)] text-left`,
  "forceComparison": `${css["forceComparison"]} min-w-0 m-0 [padding:8px_14px] [border-top:1px_solid_#ffffff10] [@media(max-width:600px)]:[padding-inline:14px]`,
  "labComparisonRows": `${css["labComparisonRows"]} grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:12px] [@media(max-width:600px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:600px)]:[gap:10px]`,
  "comparisonRow": `${css["comparisonRow"]} min-w-0 [margin-top:16px]`,
  "challengeComparison": `${css["challengeComparison"]} min-w-0 m-0 [color:#e2e8f0]`,
  "comparisonLabel": `${css["comparisonLabel"]} flex justify-between flex-wrap [gap:6px_12px] [font-size:16px] [line-height:1.5]`,
  "challengeBar": "block w-full [height:12px] [margin-top:4px]",
  "comparisonForce": "[margin:6px_0_0] [color:#b6bdd0] [font-size:14px] [line-height:1.5] [font-variant-numeric:tabular-nums] [overflow-wrap:anywhere]",
} as const;
