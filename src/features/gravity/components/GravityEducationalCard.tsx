"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { GravityEveryday } from "./GravityEveryday";
import { GravityPrinciples } from "./GravityPrinciples";
import styles from "./GravityEducationalCard.module.css";

const topics = [
  { id: "law", label: "educationLaw" },
  { id: "principles", label: "educationPrinciples" },
  { id: "examples", label: "educationExamples" },
] as const;

type TopicId = (typeof topics)[number]["id"];

export const GravityEducationalCard = () => {
  const t = useTranslations("Gravity");
  const id = useId();
  const [selected, setSelected] = useState<TopicId>("law");
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight": nextIndex = (index + 1) % topics.length; break;
      case "ArrowLeft": nextIndex = (index - 1 + topics.length) % topics.length; break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = topics.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setSelected(topics[nextIndex].id);
    buttonRefs.current[nextIndex]?.focus({ preventScroll: true });
  };

  return (
    <section className={styles.card} aria-labelledby={`${id}-heading`}>
      <h3 id={`${id}-heading`} className={styles.heading}>{t("educationTitle")}</h3>
      <div role="tablist" aria-labelledby={`${id}-heading`} className={styles.tabs}>
        {topics.map((topic, index) => (
          <button
            key={topic.id}
            ref={(element) => { buttonRefs.current[index] = element; }}
            type="button"
            role="tab"
            id={`${id}-tab-${topic.id}`}
            aria-controls={`${id}-panel-${topic.id}`}
            aria-selected={selected === topic.id}
            tabIndex={selected === topic.id ? 0 : -1}
            className={styles.tab}
            onClick={() => setSelected(topic.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {t(topic.label)}
          </button>
        ))}
      </div>
      {topics.map((topic) => (
        <div
          key={topic.id}
          role="tabpanel"
          id={`${id}-panel-${topic.id}`}
          aria-labelledby={`${id}-tab-${topic.id}`}
          tabIndex={0}
          hidden={selected !== topic.id}
          className={styles.content}
        >
          {topic.id === "law" && (
            <div className={styles.law}>
              <h4>{t("introTitle")}</h4>
              <p>{t("introParagraph")}</p>
              <p>{t("introNewton")}</p>
            </div>
          )}
          {topic.id === "principles" && <GravityPrinciples />}
          {topic.id === "examples" && <GravityEveryday />}
        </div>
      ))}
    </section>
  );
};
