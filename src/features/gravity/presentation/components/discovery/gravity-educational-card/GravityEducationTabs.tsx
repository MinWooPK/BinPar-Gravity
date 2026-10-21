"use client";

import { useRef, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

// Pestañas de la etapa Descubre.
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

// Muestra las pestañas y permite navegar con el teclado.
export const GravityEducationTabs = ({
  id,
  selected,
  onSelect,
}: GravityEducationTabsProps) => {
  const t = useTranslations("Gravity");
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Cambia de pestaña utilizando las flechas, Home y End.
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
      className="mb-3 grid grid-cols-4 gap-1.5 min-[1024px]:shrink-0 max-[600px]:gap-1.25 max-[360px]:grid-cols-2"
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
          className="min-h-11 min-w-0 cursor-pointer rounded-lg border border-[#30364b] 
          bg-lab-surface px-1.25 py-2 text-sm leading-[1.4] font-medium text-[#bac2d6] wrap-anywhere 
          transition-colors duration-160 hover:border-[#aa97ff70] hover:bg-[#1b2032]
           hover:text-[#f2f2fa] aria-selected:border-[#aa97ff90] aria-selected:bg-[#aa97ff18]
            aria-selected:text-[#e4dcff] focus-visible:outline-2 focus-visible:outline-offset-[3px]
             focus-visible:outline-[#c0b3ff] motion-reduce:transition-none"
          onClick={() => onSelect(topic.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {t(topic.label)}
        </button>
      ))}
    </div>
  );
};
