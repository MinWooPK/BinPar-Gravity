import css from "./TutorChat.module.css";

export const tutorChatStyles = {
  composer: `${css.composer} mx-3 flex shrink-0 items-end gap-1.5 rounded-2xl border border-slate-500/50 bg-slate-950/60 p-1.5`,
  transcript: "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:thin] [scrollbar-color:#475569_transparent]",
  introduction: `${css.introduction} flex min-h-28 flex-1 flex-col items-center justify-center py-5 text-center`,
  message: `${css.message} mb-3 w-fit max-w-[94%] rounded-2xl border border-slate-500/25 bg-slate-800/45 px-3 py-2.5 text-sm leading-relaxed text-slate-200`,
  quickActions: `${css.quickActions} flex shrink-0 flex-wrap gap-1.5 pt-2`,
  error: `${css.error} my-2 rounded-xl border border-amber-300/20 bg-amber-950/20 p-2.5 text-sm text-amber-100`,
  disclaimer: `${css.disclaimer} mx-4 mt-2 mb-3 shrink-0 text-center text-[11px] leading-snug text-slate-400`,
  contextNote: "my-2 text-xs leading-relaxed text-slate-400",
} as const;
