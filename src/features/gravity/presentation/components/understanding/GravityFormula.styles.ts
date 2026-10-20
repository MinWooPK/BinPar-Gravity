import css from "./GravityFormula.module.css";

/** Static Tailwind classes; CSS retains only specialized selectors and motion. */
export const gravityFormulaStyles = {
  card: `${css["card"]} flex flex-col justify-between min-w-0 [padding:12px] [font-size:1rem] [line-height:1.5] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [@media(max-width:520px)]:[padding:14px] in-[#gravity-understanding]:p-2.5`,
  embedded: `${css["card"]} flex flex-col w-full max-w-[560px] mx-auto self-start min-w-0 gap-2 p-3 text-base leading-normal`,
  header: `${css["header"]} flex items-center justify-between flex-wrap [gap:8px_12px]`,
  reset: `${css["reset"]} [min-height:44px] [padding:8px_12px] [border:1px_solid_#544776] [border-radius:8px] [background:#aa97ff12] [color:#d0c1ff] [font-size:.875rem] cursor-pointer`,
  headerActions: "flex flex-wrap items-center [gap:4px] min-w-0 gap-2",
  formulaControls: "flex flex-col items-center gap-2",
  help: `${css["help"]} [min-height:1.45em] [margin:6px_0] [color:#aeb8cb] [font-size:.875rem] [line-height:1.45] in-[#gravity-understanding]:my-0.5`,
  equation:
    "flex flex-none w-full min-w-0 items-center justify-center flex-wrap [gap:8px_12px] [padding-block:4px] [color:#e4dfff] [font-family:Georgia,_serif] [font-size:clamp(1.75rem,_3vw,_2rem)] [line-height:1] [@media(max-width:520px)]:[gap:3px] [@media(max-width:520px)]:[font-size:1.75rem] in-[#gravity-understanding]:py-0",
  equationLeft: "inline-flex min-w-0 items-center [gap:6px]",
  equationRight: "inline-flex min-w-0 items-center [gap:6px]",
  operator: "[color:#9b93b1] [font-size:.7em]",
  term: `${css["term"]} inline-flex [min-width:44px] [min-height:44px] items-center justify-center [padding:4px] [border:1px_solid_transparent] [border-radius:8px] [background:transparent] [color:inherit] [line-height:inherit] cursor-pointer [transition:background_140ms,_border-color_140ms,_color_140ms] [@media(max-width:520px)]:[padding-inline:2px]`,
  fraction: `${css["fraction"]} inline-flex flex-col min-w-0 text-center`,
  unknowns: `${css["unknowns"]} flex-none w-full max-w-[360px] min-w-0 m-0 p-0 [border:0]`,
  fields:
    "[margin-top:8px] grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:8px] [@media(max-width:520px)]:[grid-template-columns:minmax(0,_1fr)] in-[#gravity-understanding]:mt-1 in-[#gravity-understanding]:gap-1.5",
  field: `${css["field"]} min-w-0 [padding:6px_8px] [border:1px_solid_#30364b] [border-radius:10px] [background:#0d1320] [transition:border-color_140ms,_background_140ms] in-[#gravity-understanding]:py-1`,
  fieldTitle: `${css["fieldTitle"]} flex items-baseline justify-between [gap:6px] [margin-bottom:4px] [color:#d6dbea] [font-size:.9375rem] font-semibold [line-height:1.3] [transition:color_140ms] [@media(max-width:520px)]:[font-size:1rem] in-[#gravity-understanding]:mb-0.5`,
  inputGroup: `${css["inputGroup"]} flex items-center min-w-0 [min-height:44px] [border:1px_solid_#64748b] [border-radius:7px] [background:#070d1a] [transition:border-color_140ms,_box-shadow_140ms]`,
  unit: "shrink-0 [padding:6px_8px] [border-left:1px_solid_#334155] [color:#aebbcf] [font-size:.875rem]",
  calculated:
    "block [margin-top:4px] [color:#95efde] [font-size:.75rem] [line-height:1.4] in-[#gravity-understanding]:mt-0.5",
  error:
    "[margin:10px_0_0] [font-size:.875rem] [line-height:1.5] [overflow-wrap:anywhere] [color:#fde68a]",
  rangeWarning: `${css.rangeWarning} mt-3 min-w-0 space-y-3 rounded-xl border border-amber-400/60 bg-amber-950/40 p-4 text-sm leading-relaxed text-amber-50/90 [overflow-wrap:anywhere]`,
  rangeWarning2: `${css.rangeWarning} mt-3 min-w-0 space-y-3 rounded-xl border border-amber-400/60 bg-[#24191d] p-4 text-sm leading-relaxed text-amber-50/90 [overflow-wrap:anywhere]`,
  constant: `${css["constant"]} flex items-center [gap:12px] min-w-0 [margin-top:6px] [padding:8px] [border:1px_solid_#aa97ff45] [border-radius:10px] bg-lab-surface [transition:border-color_140ms,_background_140ms] in-[#gravity-understanding]:mt-0.5 in-[#gravity-understanding]:px-2 in-[#gravity-understanding]:py-1 in-[#gravity-understanding]:gap-2`,
  constantSymbol:
    "inline-flex shrink-0 items-center justify-center [width:44px] [min-height:44px] [padding:4px] [border:1px_solid_#aa97ff60] [border-radius:8px] [background:#aa97ff12] [color:#c4b5fd] [font-family:Georgia,_serif] [font-size:1.5rem] [line-height:1] cursor-pointer",
  constantContent: `${css["constantContent"]} flex flex-wrap items-baseline [gap:2px_10px] min-w-0`,
  constantValue: `${css["constantValue"]} m-0 [color:#e4d7ff] [font-size:1rem] font-semibold [line-height:1.7] in-[#gravity-understanding]:leading-[1.4]`,
  constantDescription:
    "[flex-basis:100%] m-0 [color:#aeb8cb] [font-size:.8125rem] [line-height:1.45]",
} as const;
