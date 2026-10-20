import css from "./OrbitAnimation.module.css";

/** Static Tailwind classes; CSS retains only specialized selectors and motion. */
export const orbitAnimationStyles = {
  stage: `${css["stage"]} block w-full [height:auto] max-w-full overflow-hidden [border-radius:inherit]`,
  player: `${css["player"]} flex flex-col min-w-0 m-0 [padding:14px_16px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#14192aeb,_#0e1321f2)] [box-shadow:0_12px_32px_#03061126] [@media(max-width:374px)]:[padding-inline:12px]`,
  title: `${css["title"]} `,
  viewport: `${css["viewport"]} `,
  controls: `${css["controls"]} `,
  legend: `${css["legend"]} `,
} as const;
