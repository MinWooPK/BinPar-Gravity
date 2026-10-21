"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { TabButton, useTabs } from "@/components/ui/Tabs";

const topics = ["what", "how", "difficulty", "history"] as const;

/** Static educational diagrams; the physical orbit integrations remain in the gallery. */
export const ThreeBodyDiscovery = () => {
  const t = useTranslations("ThreeBody.discovery");
  const id = useId();
  const { selected, setSelected, tabRefs, handleTabKeyDown } = useTabs(
    topics,
    "what",
  );

  return (
    <div className="grid [flex:1] [grid-template-columns:repeat(2,_minmax(0,_1fr))] items-stretch [gap:clamp(20px,_2.5vw,_32px)] min-w-0 [min-height:min-content] [@media(max-width:1023px)]:[flex:none] [@media(max-width:1023px)]:[grid-template-columns:minmax(0,_1fr)] [@media(max-width:1023px)]:[gap:20px]" data-three-body-discovery>
      <section
        className="flex flex-col [gap:14px] min-w-0 [padding:18px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [color:#b2bad0] [font-size:.9375rem] [line-height:1.5] [overflow-wrap:anywhere] [@media(max-width:600px)]:[padding:16px_12px]"
        aria-labelledby={`${id}-education`}
        data-three-body-education
      >
        <h2 id={`${id}-education`} className="m-0 text-lab-text [font-size:clamp(1.25rem,_2vw,_1.5rem)] font-semibold [line-height:1.25] [letter-spacing:-.025em]">
          {t("title")}
        </h2>
        <div
          role="tablist"
          aria-labelledby={`${id}-education`}
          className="grid [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:6px] [@media(max-width:600px)]:[gap:5px] [@media(max-width:360px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))]"
        >
          {topics.map((topic, index) => (
            <TabButton
              key={topic}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${id}-tab-${topic}`}
              aria-controls={`${id}-panel-${topic}`}
              selected={selected === topic}
              className="min-w-0 [padding:8px_5px] [border:1px_solid_#30364b] [border-radius:8px] bg-lab-surface [color:#bac2d6] [font-size:.875rem] font-medium [line-height:1.4] [overflow-wrap:anywhere] [transition:color_160ms,_background_160ms,_border-color_160ms] [&:hover]:[color:#f2f2fa] [&:hover]:[border-color:#aa97ff70] [&:hover]:[background:#1b2032] [&[aria-selected=true]]:[color:#e4dcff] [&[aria-selected=true]]:[border-color:#aa97ff90] [&[aria-selected=true]]:[background:#aa97ff18] [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [@media_(prefers-reduced-motion:_reduce)]:[&&]:[transition:none]"
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
            className="min-w-0 [&:focus-visible]:[outline:2px_solid_#c0b3ff] [&:focus-visible]:[outline-offset:3px] [&[hidden]]:hidden [&:not([hidden])]:flex [&:not([hidden])]:[flex:1] [&:not([hidden])]:flex-col [&:not([hidden])]:justify-between [&:not([hidden])]:[gap:18px] [&:not([hidden])]:[animation:lab-three-body-discovery-topic-enter_180ms_ease-out_both] [&_h3]:[margin:0_0_10px] [&_h3]:[color:#e4dcff] [&_h3]:[font-size:1.125rem] [&_h3]:font-semibold [&_h3]:[line-height:1.4] [&_h3]:[letter-spacing:-0.015em] [&_h4]:[margin:0_0_4px] [&_h4]:[color:#e4e8f2] [&_h4]:[font-size:0.9375rem] [&_h4]:font-semibold [&_h4]:[line-height:1.4] [&_p]:m-0 [@media_(max-width:_1023px)]:[&:not([hidden])]:justify-start [@media_(prefers-reduced-motion:_reduce)]:[&:not([hidden])]:animate-none"
          >
            {topic === "what" && (
              <>
                <div>
                  <h3>{t("what.title")}</h3>
                  <p>{t("what.description")}</p>
                </div>
                <dl className="grid [gap:14px] m-0 [&_>_div]:[padding-left:12px] [&_>_div]:[border-left:2px_solid_#746392] [&_dt]:[margin-bottom:5px] [&_dt]:[color:#dcd4f6] [&_dt]:font-semibold [&_dd]:m-0">
                  {(["two", "three"] as const).map((count) => (
                    <div key={count}>
                      <dt>{t(`what.${count}Title`)}</dt>
                      <dd>{t(`what.${count}Description`)}</dd>
                    </div>
                  ))}
                </dl>
                <aside className="[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]">
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
                <ol className="grid [gap:14px] m-0 p-0 [list-style:none] [&_li]:flex [&_li]:items-start [&_li]:[gap:10px]">
                  {(["attract", "combine", "evolve"] as const).map(
                    (step, index) => (
                      <li key={step}>
                        <span className="inline-flex [flex:0_0_auto] items-center justify-center [width:26px] [height:26px] [border:1px_solid_#4a406b] [border-radius:50%] [background:#aa97ff0a] [color:#d9cdfa] [font-size:.8125rem] [font-variant-numeric:tabular-nums]" aria-hidden="true">
                          {index + 1}
                        </span>
                        <div>
                          <h4>{t(`how.${step}Title`)}</h4>
                          <p>{t(`how.${step}`)}</p>
                        </div>
                      </li>
                    ),
                  )}
                </ol>
                <p className="[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]">{t("how.note")}</p>
              </>
            )}
            {topic === "difficulty" && (
              <>
                <div>
                  <h3>{t("difficulty.title")}</h3>
                  <p>{t("difficulty.description")}</p>
                </div>
                <dl className="grid [gap:14px] m-0 [&_>_div]:[padding-left:12px] [&_>_div]:[border-left:2px_solid_#746392] [&_dt]:[margin-bottom:5px] [&_dt]:[color:#dcd4f6] [&_dt]:font-semibold [&_dd]:m-0">
                  {(["chaos", "periodic"] as const).map((motion) => (
                    <div key={motion}>
                      <dt>{t(`difficulty.${motion}Title`)}</dt>
                      <dd>{t(`difficulty.${motion}`)}</dd>
                    </div>
                  ))}
                </dl>
                <p className="[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]">{t("difficulty.note")}</p>
              </>
            )}
            {topic === "history" && (
              <>
                <h3>{t("history.title")}</h3>
                <ol className="grid [gap:14px] m-0 p-0 [list-style:none] [flex:1] [align-content:space-between] [@media(max-width:1023px)]:[gap:18px] [&_li]:[padding-left:12px] [&_li]:[border-left:2px_solid_#746392]">
                  {(["newton", "lagrange", "poincare"] as const).map(
                    (scientist) => (
                      <li key={scientist}>
                        <h4>{t(`history.${scientist}Title`)}</h4>
                        <p>{t(`history.${scientist}`)}</p>
                      </li>
                    ),
                  )}
                </ol>
                <p className="[padding:10px_12px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [font-size:.875rem]">{t("history.note")}</p>
              </>
            )}
          </div>
        ))}
      </section>

      <section
        className="flex flex-col [gap:14px] min-w-0 [padding:18px] border border-solid border-lab-line [border-radius:14px] [background:linear-gradient(145deg,_#131724,_#0e121d)] [color:#b2bad0] [font-size:.9375rem] [line-height:1.5] [overflow-wrap:anywhere] [@media(max-width:600px)]:[padding:16px_12px] lab-three-body-discovery-science [&&]:[gap:8px] [&&]:[font-size:0.875rem] [&&]:[line-height:1.45] [&_p]:m-0"
        aria-labelledby={`${id}-science`}
        data-three-body-science
      >
        <h2 id={`${id}-science`} className="m-0 text-lab-text [font-size:clamp(1.25rem,_2vw,_1.5rem)] font-semibold [line-height:1.25] [letter-spacing:-.025em]">
          {t("science.title")}
        </h2>
        <InteractionDiagram id={id} />
        <div>
          <div
            className="flex justify-center [padding-block:0_7px] [color:#e4dfff] [font-family:Georgia,_serif] [font-size:1.875rem] [line-height:1.1]"
            role="img"
            aria-label={t("science.lawSpoken")}
          >
            <span aria-hidden="true" className="inline-flex items-center [gap:8px] [&_sub]:[position:static] [&_sub]:[vertical-align:sub] [&_sub]:[font-size:0.6em] [&_sub]:[line-height:0] [&_sup]:[position:static] [&_sup]:[vertical-align:super] [&_sup]:[font-size:0.6em] [&_sup]:[line-height:0]">
              <span>
                F<sub>ij</sub>
              </span>
              <span className="[color:#a99bbf] [font-size:.7em]">=</span>
              <span>G</span>
              <span className="[color:#a99bbf] [font-size:.7em]">·</span>
              <span className="inline-flex flex-col [font-size:.8em] text-center [&_>_span]:[padding:2px_6px] [&_>_span:first-child]:[border-bottom:1px_solid_#a99bbf]">
                <span>
                  m<sub>i</sub> m<sub>j</sub>
                </span>
                <span>
                  r<sub>ij</sub>
                  <sup>2</sup>
                </span>
              </span>
            </span>
          </div>
          <p>{t("science.lawDescription")}</p>
        </div>
        <dl
          className="grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:8px] m-0 [padding-top:10px] [border-top:1px_solid_#30364b] [&_dt]:[margin-bottom:4px] [&_dt]:[color:#b9c4d8] [&_dd]:m-0 [&_dd]:[color:#d8c9ff] [&_dd]:[font-family:Georgia,_serif] [&_dd]:[font-size:1rem]"
          aria-label={t("science.conditionsTitle")}
        >
          {(["masses", "positions", "velocities"] as const).map((condition) => (
            <div key={condition}>
              <dt>{t(`science.${condition}`)}</dt>
              <dd>
                {condition === "masses"
                  ? "m₁, m₂, m₃"
                  : condition === "positions"
                    ? "r₁, r₂, r₃"
                    : "v₁, v₂, v₃"}
              </dd>
            </div>
          ))}
        </dl>
        <aside className="[padding:9px_11px] [border:1px_solid_#294543] [border-radius:8px] [background:#5ee7d508] [color:#b8d3d2] [&_h3]:[margin:0_0_4px] [&_h3]:[color:#c2e7e1] [&_h3]:[font-size:0.875rem] [&_h3]:font-semibold">
          <h3>{t("science.normalizedTitle")}</h3>
          <p>{t("science.normalized")}</p>
        </aside>
        <p className="[.lab-three-body-discovery-science_&]:[color:#b9c4d8]">{t("science.periodic")}</p>
      </section>
    </div>
  );
};

const InteractionDiagram = ({ id }: { id: string }) => {
  const t = useTranslations("ThreeBody.discovery.science");
  return (
    <figure className="flex [flex:1] flex-col justify-center min-w-0 m-0 [padding:6px_8px_8px] [border:1px_solid_#29344b] [border-radius:10px] [background:#0b1120] [&_svg]:block [&_svg]:w-full [&_svg]:[height:clamp(100px,_13vh,_132px)] [&_figcaption]:[color:#aab6cd] [&_figcaption]:text-center [@media_(max-width:_1023px)]:[&_svg]:[height:150px]">
      <svg
        viewBox="45 0 410 145"
        role="img"
        aria-labelledby={`${id}-diagram-title`}
        aria-describedby={`${id}-diagram-description`}
        focusable="false"
      >
        <title id={`${id}-diagram-title`}>{t("diagramTitle")}</title>
        <desc id={`${id}-diagram-description`}>{t("diagramDescription")}</desc>
        <defs>
          <marker
            id={`${id}-force-arrow`}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path
              d="m1 1 6 3-6 3"
              fill="none"
              stroke="#c9b8ff"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        <g aria-hidden="true">
          <path
            d="m250 30-160 70h320Z"
            fill="none"
            stroke="#53617d"
            strokeDasharray="3 6"
            strokeOpacity=".7"
          />
          <g
            fill="none"
            stroke="#c9b8ff"
            strokeWidth="2"
            strokeLinecap="round"
            markerEnd={`url(#${id}-force-arrow)`}
          >
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
            <circle
              cx="410"
              cy="100"
              r="23"
              fill="#f4c77825"
              stroke="#f4c778"
            />
          </g>
          <g
            fill="#f2f2fa"
            fontFamily="Georgia, serif"
            fontSize="21"
            textAnchor="middle"
            dominantBaseline="central"
          >
            <text x="250" y="30">
              m₁
            </text>
            <text x="90" y="100">
              m₂
            </text>
            <text x="410" y="100">
              m₃
            </text>
          </g>
          <g
            fill="#aeb9d0"
            fontFamily="Georgia, serif"
            fontSize="17"
            textAnchor="middle"
          >
            <text x="151" y="49">
              r₁₂
            </text>
            <text x="349" y="49">
              r₁₃
            </text>
            <text x="250" y="134">
              r₂₃
            </text>
          </g>
        </g>
      </svg>
      <figcaption>{t("diagramCaption")}</figcaption>
    </figure>
  );
};
