import css from "./GravityStageLayout.module.css";

export const gravityStageLayoutStyles = {
  "layout": "grid [flex:1] [grid-template-columns:repeat(2,_minmax(0,_1fr))] items-stretch [gap:clamp(20px,_2.5vw,_32px)] min-w-0 [min-height:min-content] [@media(max-width:1023px)]:[flex:none] [@media(max-width:1023px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:1023px)]:[gap:20px]",
  "simulation": `${css["simulation"]} flex flex-col min-w-0 [min-height:min-content]`,
  "content": `${css["content"]} flex flex-col min-w-0 [min-height:min-content]`,
} as const;
