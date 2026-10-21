"use client";

import { useId, useRef } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { resolveGravityProposal } from "@/features/gravity/application/gravityProposal";
import { gravitationalForce } from "@/features/gravity/domain/gravitation";

import type { TutorProposal } from "../../../types/proposal.types";

// Parámetros que puede modificar la IA.
const campos = [
  { key: "mass1", label: "formulaMass1Label", unit: "kg" },
  { key: "mass2", label: "formulaMass2Label", unit: "kg" },
  { key: "distance", label: "formulaDistanceLabel", unit: "m" },
] as const;

const estiloBoton =
  "min-h-11 rounded-lg border border-violet-300/50 px-3 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-300/10" +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200";

// Muestra los cambios que propone el Tutor IA.
export const TutorProposalCard = ({
  proposal: propuesta,
  onDecision,
}: {
  proposal: TutorProposal;
  onDecision: (decision: "apply" | "cancel") => void;
}) => {
  const traducir = useTranslations("Tutor");
  const traducirGravedad = useTranslations("Gravity");
  const formato = useFormatter();

  const id = useId();
  const tarjetaRef = useRef<HTMLElement>(null);

  // Calcula los nuevos valores de gravedad.
  const parametros = resolveGravityProposal(
    propuesta.baseline,
    propuesta.action,
  );

  if (!parametros) return null;

  // Prepara los valores anteriores y nuevos.
  const filas = campos.map(({ key, label, unit }) => ({
    key,
    label: traducirGravedad(label),
    unit,
    anterior: propuesta.baseline[key],
    nuevo: parametros[key],
  }));

  // Formatea los números.
  const numero = (valor: number) =>
    formato.number(valor, { maximumSignificantDigits: 8 });

  const fuerza = (valor: number) =>
    formato.number(valor, {
      notation: "scientific",
      maximumSignificantDigits: 4,
    });

  // Gestiona la decisión del usuario.
  const decidir = (decision: "apply" | "cancel") => {
    tarjetaRef.current?.focus({ preventScroll: true });
    onDecision(decision);
  };

  return (
    <section
      ref={tarjetaRef}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      data-tutor-proposal={propuesta.status}
      className="mt-3 min-w-0 rounded-xl border border-cyan-300/30 bg-slate-950/60 p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
    >
      <h3 id={`${id}-title`} className="text-sm font-semibold text-cyan-100">
        {traducir("proposalTitle")}
      </h3>

      {/* Compara los valores actuales con los propuestos. */}
      <dl className="my-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm wrap-anywhere">
        {filas.map(({ key, label, unit, anterior, nuevo }) => (
          <div key={key} className="contents">
            <dt>{label}</dt>

            <dd className="text-right tabular-nums text-slate-100">
              {anterior !== nuevo && (
                <>
                  {numero(anterior)} <span aria-hidden="true">→</span>
                  <span className="sr-only">{traducir("proposalTo")}</span>{" "}
                </>
              )}
              {numero(nuevo)} {unit}
            </dd>
          </div>
        ))}
      </dl>

      {/* Compara la fuerza gravitatoria. */}
      <p className="text-sm text-slate-300">
        {traducir("proposalForce", {
          before: fuerza(gravitationalForce(propuesta.baseline)),
          after: fuerza(gravitationalForce(parametros)),
        })}
      </p>

      {/* Estado de la propuesta. */}
      <p
        role="status"
        aria-atomic="true"
        className="mt-2 text-sm text-cyan-100"
      >
        {traducir(`proposal_${propuesta.status}`)}
      </p>

      {/* Botones para aceptar o cancelar. */}
      {propuesta.status === "pending" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-proposal-apply
            className={`${estiloBoton} bg-violet-300/10`}
            onClick={() => decidir("apply")}
          >
            {traducir("proposalApply")}
          </button>

          <button
            type="button"
            data-proposal-cancel
            className={estiloBoton}
            onClick={() => decidir("cancel")}
          >
            {traducir("proposalCancel")}
          </button>
        </div>
      )}
    </section>
  );
};
