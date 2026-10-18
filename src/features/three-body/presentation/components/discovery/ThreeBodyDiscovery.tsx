"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { TabButton, useTabs } from "@/components/ui/Tabs";
import css from "./ThreeBodyDiscovery.module.css";

const styles = {
  "layout": "grid [flex:1] [grid-template-columns:repeat(2,_minmax(0,_1fr))] items-stretch [gap:clamp(20px,_2.5vw,_32px)] min-w-0 [min-height:min-content] [@media(max-width:1023px)]:[flex:none] [@media(max-width:1023px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:1023px)]:[gap:20px]",
  "card": "flex flex-col [gap:14px] min-w-0 [padding:18px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [color:#b2bad0] [font-size:.9375rem] [line-height:1.5] [overflow-wrap:anywhere] [@media(max-width:600px)]:[padding:16px_12px]",
  "heading": "m-0 text-lab-text [font-size:clamp(1.25rem,_2vw,_1.5rem)] font-semibold [line-height:1.25] [letter-spacing:-.025em]",
  "tabs": "grid [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:6px] [@media(max-width:600px)]:[gap:5px] [@media(max-width:360px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))]",
  "tab": `${css["tab"]} min-w-0 [padding:8px_5px] [border:1px_solid_#30364b] [border-radius:8px] bg-lab-surface [color:#bac2d6] [font-size:.875rem] font-medium [line-height:1.4] [overflow-wrap:anywhere] [transition:color_160ms,_background_160ms,_border-color_160ms]`,
  "content": `${css["content"]} min-w-0`,
  "comparison": `${css["comparison"]} grid [gap:14px] m-0`,
  "note": "[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]",
  "steps": `${css["steps"]} grid [gap:14px] m-0 p-0 [list-style:none]`,
  "timeline": `${css["timeline"]} grid [gap:14px] m-0 p-0 [list-style:none] [flex:1] [align-content:space-between] [@media(max-width:1023px)]:[gap:18px]`,
  "stepNumber": "inline-flex [flex:0_0_auto] items-center justify-center [width:26px] [height:26px] [border:1px_solid_#4a406b] [border-radius:50%] [background:#aa97ff0a] [color:#d9cdfa] [font-size:.8125rem] [font-variant-numeric:tabular-nums]",
  "science": `${css["science"]}`,
  "diagram": `${css["diagram"]} flex [flex:1] flex-col justify-center min-w-0 m-0 [padding:6px_8px_8px] [border:1px_solid_#29344b] [border-radius:10px] [background:#0b1120]`,
  "equation": "flex justify-center [padding-block:0_7px] [color:#e4dfff] [font-family:Georgia,_serif] [font-size:1.875rem] [line-height:1.1]",
  "expression": `${css["expression"]} inline-flex items-center [gap:8px]`,
  "operator": "[color:#a99bbf] [font-size:.7em]",
  "fraction": `${css["fraction"]} inline-flex flex-col [font-size:.8em] text-center`,
  "conditions": `${css["conditions"]} grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:8px] m-0 [padding-top:10px] [border-top:1px_solid_#30364b]`,
  "normalized": `${css["normalized"]} [padding:9px_11px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2]`,
  "periodic": `${css["periodic"]} `,
} as const;

const topics = ["what", "how", "difficulty", "history"] as const;

/** Static educational diagrams; the physical orbit integrations remain in the gallery. */
export const ThreeBodyDiscovery = () => {
  const t = useTranslations("ThreeBody.discovery");
  const id = useId();
  const { selected, setSelected, tabRefs, handleTabKeyDown } = useTabs(topics, "what");

  return (
    <div className={styles.layout} data-three-body-discovery>
      <section className={styles.card} aria-labelledby={`${id}-education`} data-three-body-education>
        <h2 id={`${id}-education`} className={styles.heading}>{t("title")}</h2>
        <div role="tablist" aria-labelledby={`${id}-education`} className={styles.tabs}>
          {topics.map((topic, index) => (
            <TabButton
              key={topic}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={`${id}-tab-${topic}`}
              aria-controls={`${id}-panel-${topic}`}
              selected={selected === topic}
              className={styles.tab}
              onClick={() => setSelected(topic)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {t(`tabs.${topic}`)}
            </TabButton>
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
        <div>
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
