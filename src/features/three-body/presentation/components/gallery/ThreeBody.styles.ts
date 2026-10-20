import css from "./ThreeBody.module.css";

/** Static Tailwind classes; CSS retains only specialized selectors and motion. */
export const threeBodyStyles = {
  page: `${css["page"]} `,
  gallery: `${css["gallery"]} min-w-0 [margin-top:0]`,
  scienceNote: `${css["scienceNote"]} min-w-0 [margin:0_0_.875rem] [padding:12px_16px] [border:1px_solid_#39535b] [border-radius:12px] [background:linear-gradient(115deg,_#11232b,_#19172d)] [color:#d4e0ed] [@media(max-width:374px)]:[padding:12px]`,
  scienceDescription: "[margin:4px_0_0] [font-size:.9375rem] [line-height:1.5]",
  scientificConcepts: `${css["scientificConcepts"]} flex flex-wrap [gap:8px] [margin:8px_0] p-0 [list-style:none]`,
  scienceFootnote: "m-0 [color:#b8c9d6] [font-size:.875rem] [line-height:1.5]",
  playbackButton: `${css["playbackButton"]} `,
  stagePage: `${css["stagePage"]} `,
  playbackLabel:
    "[@media(max-width:767px)]:absolute [@media(max-width:767px)]:[width:1px] [@media(max-width:767px)]:[height:1px] [@media(max-width:767px)]:p-0 [@media(max-width:767px)]:[margin:-1px] [@media(max-width:767px)]:overflow-hidden [@media(max-width:767px)]:[clip-path:inset(50%)] [@media(max-width:767px)]:whitespace-nowrap [@media(max-width:767px)]:[border:0]",
} as const;
