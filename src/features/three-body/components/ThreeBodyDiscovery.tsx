"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import styles from "./ThreeBodyDiscovery.module.css";

const topics = ["what", "how", "difficulty", "history"] as const;
type Topic = (typeof topics)[number];

/** Static educational diagrams; the physical orbit integrations remain in the gallery. */
export const ThreeBodyDiscovery = () => {
  const t = useTranslations("ThreeBody.discovery");
  const id = useId();
  const [selected, setSelected] = useState<Topic>("what");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % topics.length; break;
      case "ArrowLeft": next = (index + topics.length - 1) % topics.length; break;
      case "Home": next = 0; break;
      case "End": next = topics.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setSelected(topics[next]);
    tabRefs.current[next]?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.layout} data-three-body-discovery>
      <section className={styles.card} aria-labelledby={`${id}-education`} data-three-body-education>
        <h2 id={`${id}-education`} className={styles.heading}>{t("title")}</h2>
        <div role="tablist" aria-labelledby={`${id}-education`} className={styles.tabs}>
          {topics.map((topic, index) => (
            <button
              key={topic}
              ref={(element) => { tabRefs.current[index] = element; }}
              type="button"
              role="tab"
              id={`${id}-tab-${topic}`}
              aria-controls={`${id}-panel-${topic}`}
              aria-selected={selected === topic}
              tabIndex={selected === topic ? 0 : -1}
              className={styles.tab}
              onClick={() => setSelected(topic)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {t(`tabs.${topic}`)}
            </button>
          ))}
        </div>
        {topics.map((topic) => (
          <div
            key={topic}
            role="tabpanel"
            id={`${id}-panel-${topic}`}
            aria-labelledby={`${id}-tab-${topic}`}
            tabIndex={0}
            hidden={selected !== topic}
            className={styles.content}
          >
            {topic === "what" && (
              <>
                <div>
                  <h3>{t("what.title")}</h3>
                  <p>{t("what.description")}</p>
                </div>
                <dl className={styles.comparison}>
                  {(["two", "three"] as const).map((count) => (
                    <div key={count}>
                      <dt>{t(`what.${count}Title`)}</dt>
                      <dd>{t(`what.${count}Description`)}</dd>
                    </div>
                  ))}
                </dl>
                <aside className={styles.note}>
                  <h4>{t("what.noteTitle")}</h4>
                  <p>{t("what.note")}</p>
                </aside>
              </>
            )}
            {topic === "how" && (
              <>
                <div>
                  <h3>{t("how.title")}</h3>
                  <p>{t("how.description")}</p>
                </div>
                <ol className={styles.steps}>
                  {(["attract", "combine", "evolve"] as const).map((step, index) => (
                    <li key={step}>
                      <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                      <div>
                        <h4>{t(`how.${step}Title`)}</h4>
                        <p>{t(`how.${step}`)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className={styles.note}>{t("how.note")}</p>
              </>
            )}
            {topic === "difficulty" && (
              <>
                <div>
                  <h3>{t("difficulty.title")}</h3>
                  <p>{t("difficulty.description")}</p>
                </div>
                <dl className={styles.comparison}>
                  {(["chaos", "periodic"] as const).map((motion) => (
                    <div key={motion}>
                      <dt>{t(`difficulty.${motion}Title`)}</dt>
                      <dd>{t(`difficulty.${motion}`)}</dd>
                    </div>
                  ))}
                </dl>
                <p className={styles.note}>{t("difficulty.note")}</p>
              </>
            )}
            {topic === "history" && (
              <>
                <h3>{t("history.title")}</h3>
                <ol className={styles.timeline}>
                  {(["newton", "lagrange", "poincare"] as const).map((scientist) => (
                    <li key={scientist}>
                      <h4>{t(`history.${scientist}Title`)}</h4>
                      <p>{t(`history.${scientist}`)}</p>
                    </li>
                  ))}
                </ol>
                <p className={styles.note}>{t("history.note")}</p>
              </>
            )}
          </div>
        ))}
      </section>

      <section className={`${styles.card} ${styles.science}`} aria-labelledby={`${id}-science`} data-three-body-science>
        <h2 id={`${id}-science`} className={styles.heading}>{t("science.title")}</h2>
        <InteractionDiagram id={id} />
        <div className={styles.law}>
          <div className={styles.equation} role="img" aria-label={t("science.lawSpoken")}>
            <span aria-hidden="true" className={styles.expression}>
              <span>F<sub>ij</sub></span><span className={styles.operator}>=</span><span>G</span>
              <span className={styles.operator}>·</span>
              <span className={styles.fraction}>
                <span>m<sub>i</sub> m<sub>j</sub></span>
                <span>r<sub>ij</sub><sup>2</sup></span>
              </span>
            </span>
          </div>
          <p>{t("science.lawDescription")}</p>
        </div>
        <dl className={styles.conditions} aria-label={t("science.conditionsTitle")}>
          {(["masses", "positions", "velocities"] as const).map((condition) => (
            <div key={condition}>
              <dt>{t(`science.${condition}`)}</dt>
              <dd>{condition === "masses" ? "m₁, m₂, m₃" : condition === "positions" ? "r₁, r₂, r₃" : "v₁, v₂, v₃"}</dd>
            </div>
          ))}
        </dl>
        <aside className={styles.normalized}>
          <h3>{t("science.normalizedTitle")}</h3>
          <p>{t("science.normalized")}</p>
        </aside>
        <p className={styles.periodic}>{t("science.periodic")}</p>
      </section>
    </div>
  );
};

const InteractionDiagram = ({ id }: { id: string }) => {
  const t = useTranslations("ThreeBody.discovery.science");
  return (
    <figure className={styles.diagram}>
      <svg viewBox="45 0 410 145" role="img" aria-labelledby={`${id}-diagram-title`} aria-describedby={`${id}-diagram-description`} focusable="false">
        <title id={`${id}-diagram-title`}>{t("diagramTitle")}</title>
        <desc id={`${id}-diagram-description`}>{t("diagramDescription")}</desc>
        <defs>
          <marker id={`${id}-force-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="m1 1 6 3-6 3" fill="none" stroke="#c9b8ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        <g aria-hidden="true">
          <path d="m250 30-160 70h320Z" fill="none" stroke="#53617d" strokeDasharray="3 6" strokeOpacity=".7" />
          <g fill="none" stroke="#c9b8ff" strokeWidth="2" strokeLinecap="round" markerEnd={`url(#${id}-force-arrow)`}>
            <path d="m217 44.4375-34 14.875" />
            <path d="m123 85.5625 34-14.875" />
            <path d="m283 44.4375 34 14.875" />
            <path d="m377 85.5625-34-14.875" />
            <path d="M126 100h28" />
            <path d="M374 100h-28" />
          </g>
          <g strokeWidth="1.5">
            <circle cx="250" cy="30" r="23" fill="#aa97ff25" stroke="#aa97ff" />
            <circle cx="90" cy="100" r="23" fill="#5ee7d525" stroke="#5ee7d5" />
            <circle cx="410" cy="100" r="23" fill="#f4c77825" stroke="#f4c778" />
          </g>
          <g fill="#f2f2fa" fontFamily="Georgia, serif" fontSize="21" textAnchor="middle" dominantBaseline="central">
            <text x="250" y="30">m₁</text>
            <text x="90" y="100">m₂</text>
            <text x="410" y="100">m₃</text>
          </g>
          <g fill="#aeb9d0" fontFamily="Georgia, serif" fontSize="17" textAnchor="middle">
            <text x="151" y="49">r₁₂</text>
            <text x="349" y="49">r₁₃</text>
            <text x="250" y="134">r₂₃</text>
          </g>
        </g>
      </svg>
      <figcaption>{t("diagramCaption")}</figcaption>
    </figure>
  );
};
