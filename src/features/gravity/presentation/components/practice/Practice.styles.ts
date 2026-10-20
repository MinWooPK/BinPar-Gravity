import css from "./Practice.module.css";

const button =
  "inline-flex min-h-11 scroll-mb-24 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";
export const practiceStyles = {
  primary: `${button} border border-violet-300 bg-violet-300 text-slate-950 enabled:cursor-pointer enabled:hover:bg-violet-200`,
  secondary: `${button} border border-slate-500/60 text-slate-200 enabled:cursor-pointer enabled:hover:border-violet-300/60 enabled:hover:bg-violet-300/10`,
  hintButton: `${button} border border-teal-300/25 bg-teal-300/5 text-teal-100 hover:bg-teal-300/10`,
  card: "min-w-0 rounded-2xl border border-slate-600/50 bg-slate-900/45 p-4 sm:p-5",
  title: "flex items-center gap-2 text-base font-semibold",
  prose:
    "max-w-prose whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere]",
  focus:
    "scroll-mt-6 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300",
  reveal: css.reveal,
  appearance: css.appearance,
  progress: `${css.progress} block h-2 w-full overflow-hidden rounded-full`,
} as const;
