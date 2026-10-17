"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { GravityEveryday } from "./GravityEveryday";
import { GravityPrinciples } from "./GravityPrinciples";
import styles from "./GravityEducationalCard.module.css";

const topics = [
  { id: "what", label: "educationWhat" },
  { id: "principles", label: "educationPrinciples" },
  { id: "examples", label: "educationExamples" },
  { id: "history", label: "educationHistory" },
] as const;

type TopicId = (typeof topics)[number]["id"];

export const GravityEducationalCard = () => {
  const t = useTranslations("Gravity");
  const id = useId();
  const [selected, setSelected] = useState<TopicId>("what");
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
    <section className={styles.card} aria-labelledby={`${id}-heading`} data-discovery-education>
      <h2 id={`${id}-heading`} className={styles.heading}>{t("discoveryTitle")}</h2>
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
          {topic.id === "what" && (
            <div className={styles.overview}>
              <h3>{t("discoveryDefinition")}</h3>
              <p>{t("discoveryExplanation")}</p>
              <EarthMoonDiagram id={id} />
              <p>{t("discoveryPhenomena")}</p>
            </div>
          )}
          {topic.id === "principles" && <GravityPrinciples />}
          {topic.id === "examples" && <GravityEveryday />}
          {topic.id === "history" && (
            <div className={styles.history}>
              <h3>{t("discoveryHistoryTitle")}</h3>
              <ol className={styles.timeline}>
                {(["Galileo", "Kepler", "Newton"] as const).map((scientist) => (
                  <li key={scientist}>
                    <h4>{t(`discoveryHistory${scientist}Title`)}</h4>
                    <p>{t(`discoveryHistory${scientist}`)}</p>
                  </li>
                ))}
              </ol>
              <p className={styles.historyNote}>{t("discoveryHistoryConstant")}</p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

const EarthMoonDiagram = ({ id }: { id: string }) => {
  const t = useTranslations("Gravity");

  return (
    <figure className={styles.diagram}>
      <svg
        viewBox="0 0 460 150"
        role="img"
        aria-labelledby={`${id}-diagram-title`}
        aria-describedby={`${id}-diagram-description`}
        focusable="false"
      >
        <title id={`${id}-diagram-title`}>{t("discoveryDiagramTitle")}</title>
        <desc id={`${id}-diagram-description`}>{t("discoveryDiagramDescription")}</desc>
        <defs>
          <radialGradient id={`${id}-earth`} cx="30%" cy="25%" r="80%">
            <stop stopColor="#669cda" />
            <stop offset="1" stopColor="#1e345a" />
          </radialGradient>
          <radialGradient id={`${id}-moon`} cx="30%" cy="25%" r="80%">
            <stop stopColor="#d6d9e3" />
            <stop offset="1" stopColor="#65718e" />
          </radialGradient>
        </defs>
        <g aria-hidden="true">
          <ellipse cx="230" cy="68" rx="196" ry="45" fill="none" stroke="#38425f" strokeDasharray="2 8" />
          <path d="M143 68h192" stroke="#7383a6" strokeDasharray="3 5" strokeOpacity=".45" />
          <circle cx="106" cy="68" r="41" fill="none" stroke="#9adce8" strokeOpacity=".2" />
          <circle cx="106" cy="68" r="37" fill={`url(#${id}-earth)`} stroke="#91c5e1" strokeWidth="1.3" />
          <path d="m91 36 12 9-1 12-12 9-6 14-11-6m41-39-5 13 9 10 14 3 9 14-6 18-13-4-5-14-14-2-3-13" fill="#73b5a8" opacity=".8" />
          <circle cx="354" cy="68" r="19" fill={`url(#${id}-moon)`} stroke="#c2c8da" />
          <g fill="#52617d" opacity=".45">
            <circle cx="348" cy="61" r="4" />
            <circle cx="359" cy="73" r="5" />
            <circle cx="346" cy="77" r="2" />
          </g>
          <g fill="none" stroke="#baa7ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M151 68h62m-8-6 8 6-8 6" />
            <path d="M309 68h-62m8-6-8 6 8 6" />
          </g>
          <g fill="#d6caff" fontSize="16" fontStyle="italic" textAnchor="middle">
            <text x="182" y="52">F</text>
            <text x="278" y="52">F</text>
          </g>
          <g fill="#dce5f3" fontSize="22" fontWeight="500" textAnchor="middle">
            <text x="106" y="132">{t("discoveryDiagramEarth")}</text>
            <text x="354" y="132">{t("discoveryDiagramMoon")}</text>
          </g>
        </g>
      </svg>
      <figcaption>{t("discoveryDiagramScale")}</figcaption>
    </figure>
  );
};
