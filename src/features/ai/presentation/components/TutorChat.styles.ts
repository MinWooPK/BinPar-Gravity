import css from "./TutorChat.module.css";

export const tutorChatStyles = {
  "composer": `${css["composer"]} flex shrink-0 [align-items:flex-end] [gap:.5rem] [padding:.5rem_1rem] [@media(max-width:480px)]:[padding-inline:.875rem]`,
  "transcript": "[flex:1] min-h-0 [padding:1rem] overflow-y-auto [overscroll-behavior:contain] [scrollbar-width:thin] [scrollbar-color:#75669f_#101626] [@media(max-width:480px)]:[padding-inline:.875rem]",
  "introduction": "m-0 [color:#cbd5e1] [font-size:1rem] [line-height:1.6]",
  "message": `${css["message"]} [margin:0_0_.75rem] [padding:.75rem] [border:1px_solid_#334155] [border-radius:.875rem] [background:#171f32] [font-size:1rem] [line-height:1.6]`,
  "quickActions": `${css["quickActions"]} flex shrink-0 flex-wrap [gap:.375rem] [padding:.5rem_1rem] [border-top:1px_solid_#334155] [@media(max-width:480px)]:[padding-inline:.875rem]`,
  "error": `${css["error"]} [margin:.75rem_0] [color:#fde68a] [font-size:.875rem]`,
  "disclaimer": `${css["disclaimer"]} shrink-0 [margin:.25rem_1rem_.875rem] [color:#a8b4c7] [font-size:.75rem] [line-height:1.5] [@media(max-width:480px)]:[margin-bottom:max(.75rem,_env(safe-area-inset-bottom))]`,
  "contextNote": "[margin:.75rem_0_0] [color:#a5f3fc] [font-size:.875rem] [line-height:1.5]",
} as const;
