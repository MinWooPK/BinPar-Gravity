"use client";

import { useRef, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

// Define las cuatro pestañas educativas.
export const topics = [
  { id: "what", label: "educationWhat" },
  { id: "principles", label: "educationPrinciples" },
  { id: "examples", label: "educationExamples" },
  { id: "history", label: "educationHistory" },
] as const;

export type TopicId = (typeof topics)[number]["id"];

type GravityEducationTabsProps = {
  id: string;
  selected: TopicId;
  onSelect: (topic: TopicId) => void;
};

// Muestra las pestañas y permite navegar mediante el teclado.
export const GravityEducationTabs = ({
  id,
  selected,
  onSelect,
}: GravityEducationTabsProps) => {
  const t = useTranslations("Gravity");

  // Guarda las referencias de los botones para gestionar el foco.
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % topics.length;
        break;

      case "ArrowLeft":
        nextIndex = (index - 1 + topics.length) % topics.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = topics.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    onSelect(topics[nextIndex].id);

    buttonRefs.current[nextIndex]?.focus({
      preventScroll: true,
    });
  };

  return (
    <div
      role="tablist"
      aria-labelledby={`${id}-heading`}
      className="grid [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:6px] [margin-bottom:12px] min-[1024px]:shrink-0 [@media(max-width:600px)]:[gap:5px] [@media(max-width:360px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))]"
    >
      {topics.map((topic, index) => (
        <button
          key={topic.id}
          ref={(element) => {
            buttonRefs.current[index] = element;
          }}
          type="button"
          role="tab"
          id={`${id}-tab-${topic.id}`}
          aria-controls={`${id}-panel-${topic.id}`}
          aria-selected={selected === topic.id}
          tabIndex={selected === topic.id ? 0 : -1}
          className="min-w-0 [min-height:44px] [padding:8px_5px] [border:1px_solid_#30364b] [border-radius:8px] bg-lab-surface [color:#bac2d6] [font-size:.875rem] font-medium [line-height:1.4] [overflow-wrap:anywhere] cursor-pointer [transition:color_160ms,_background_160ms,_border-color_160ms] [&:hover]:[color:#f2f2fa] [&:hover]:[border-color:#aa97ff70] [&:hover]:[background:#1b2032] [&[aria-selected=true]]:[color:#e4dcff] [&[aria-selected=true]]:[border-color:#aa97ff90] [&[aria-selected=true]]:[background:#aa97ff18] [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&]:[transition:none]"
          onClick={() => onSelect(topic.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {t(topic.label)}
        </button>
      ))}
    </div>
  );
};
