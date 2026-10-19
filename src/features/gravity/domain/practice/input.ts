import type { Answer, Definition } from "../../types/practice/practice.types";
export const answerKind = (q: Definition) => ["attraction", "mass", "distance", "mutual", "reasoning"].includes(q.concept) ? "choice" : ["force", "power"].includes(q.concept) ? "scientific" : "number";
export const optionsFor = (q: Definition) => q.concept === "attraction" ? ["attract", "repel", "contact", "earthOnly"]
    : q.concept === "mutual" ? ["equal", "heavier", "lighter", "stationary"] : ["same", "double", "four", "half", "quarter"];
export const parsePracticeNumber = (text: string): number | null => {
    const normalized = text.trim().replace(",", ".");
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized))
        return null;
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
};
export const numericAnswer = (answer: Answer, scientific: boolean): number | null => {
    const coefficient = parsePracticeNumber(answer.value);
    if (coefficient === null)
        return null;
    if (!scientific)
        return coefficient;
    const exponent = parsePracticeNumber(answer.exponent);
    if (exponent === null || !Number.isInteger(exponent) || Math.abs(exponent) > 30)
        return null;
    const value = coefficient * 10 ** exponent;
    return Number.isFinite(value) ? value : null;
};
