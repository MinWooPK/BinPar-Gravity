"use client";

import { useId, useRef } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { resolveGravityProposal } from "@/features/gravity/application/gravityProposal";
import { resolveThreeBodyProposal } from "@/features/three-body/application/experimentProposal";
import { experimentBodyFields } from "@/features/three-body/application/experimentConfiguration";
import { gravitationalForce } from "@/features/gravity/domain/gravitation";
import type { TutorProposal } from "../../types/proposal.types";

const fields = [
  { key: "mass1", label: "formulaMass1Label", unit: "kg" },
  { key: "mass2", label: "formulaMass2Label", unit: "kg" },
  { key: "distance", label: "formulaDistanceLabel", unit: "m" },
] as const;
const buttonStyle = "min-h-11 rounded-lg border border-violet-300/50 px-3 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200";

export const TutorProposalCard = ({ proposal, onDecision }: {
  proposal: TutorProposal;
  onDecision: (decision: "apply" | "cancel") => void;
}) => {
  const t = useTranslations("Tutor");
  const gravity = useTranslations("Gravity");
  const threeBody = useTranslations("ThreeBody.experiment");
  const format = useFormatter();
  const id = useId();
  const cardRef = useRef<HTMLElement>(null);
  const gravityParameters = proposal.kind === "gravity" ? resolveGravityProposal(proposal.baseline, proposal.action) : null;
  const threeBodyParameters = proposal.kind === "three-body" ? resolveThreeBodyProposal(proposal.baseline, proposal.action) : null;
  if (!gravityParameters && !threeBodyParameters) return null;
  const rows: { key: string; label: string; before: number; after: number; unit: string }[] = [];
  if (proposal.kind === "gravity" && gravityParameters) {
    fields.forEach(({ key, label, unit }) => rows.push({ key, label: gravity(label), unit, before: proposal.baseline[key], after: gravityParameters[key] }));
  }
  if (proposal.kind === "three-body" && threeBodyParameters) {
    for (const key of ["gravity", "duration"] as const) {
      if (proposal.baseline[key] !== threeBodyParameters[key]) rows.push({ key, label: threeBody(key), unit: "", before: proposal.baseline[key], after: threeBodyParameters[key] });
    }
    const labels = { mass: "mass", x: "positionX", y: "positionY", vx: "velocityX", vy: "velocityY" } as const;
    threeBodyParameters.bodies.forEach((body, i) => experimentBodyFields.forEach(key => {
      if (proposal.baseline.bodies[i][key] !== body[key]) rows.push({ key: `${i}-${key}`, label: `${threeBody("body", { number: i + 1 })} · ${threeBody(labels[key])}`, unit: "", before: proposal.baseline.bodies[i][key], after: body[key] });
    }));
  }
  const number = (value: number) => format.number(value, { maximumSignificantDigits: 8 });
  const force = (value: number) => format.number(value, { notation: "scientific", maximumSignificantDigits: 4 });
  const decide = (decision: "apply" | "cancel") => {
    // Keep focus in the transcript when confirmation buttons are removed.
    cardRef.current?.focus({ preventScroll: true });
    onDecision(decision);
  };
  return (
    <section ref={cardRef} tabIndex={-1} aria-labelledby={`${id}-title`} data-tutor-proposal={proposal.status}
      className="mt-3 min-w-0 rounded-xl border border-cyan-300/30 bg-slate-950/60 p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
      <h3 id={`${id}-title`} className="m-0 text-sm font-semibold text-cyan-100">{t("proposalTitle")}</h3>
      <dl className="my-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm [overflow-wrap:anywhere]">
        {rows.map(({ key, label, unit, before, after }) => (
          <div key={key} className="contents">
            <dt>{label}</dt>
            <dd className="m-0 text-right tabular-nums text-slate-100">
              {before !== after && <>{number(before)} <span aria-hidden="true">→</span><span className="sr-only">{t("proposalTo")}</span> </>}
              {number(after)} {unit}
            </dd>
          </div>
        ))}
      </dl>
      {proposal.kind === "gravity" && gravityParameters && <p className="text-sm text-slate-300">{t("proposalForce", { before: force(gravitationalForce(proposal.baseline)), after: force(gravitationalForce(gravityParameters)) })}</p>}
      {proposal.kind === "three-body" && <p className="text-sm text-slate-300">{t("proposalThreeBodyNote")}</p>}
      <p role="status" aria-atomic="true" className="mt-2 text-sm text-cyan-100">{t(`proposal_${proposal.status}`)}</p>
      {proposal.status === "pending" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" data-proposal-apply className={`${buttonStyle} bg-violet-300/10`} onClick={() => decide("apply")}>{t("proposalApply")}</button>
          <button type="button" data-proposal-cancel className={buttonStyle} onClick={() => decide("cancel")}>{t("proposalCancel")}</button>
        </div>
      )}
    </section>
  );
};
