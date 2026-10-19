import { concepts, type Definition, type PracticeRequest } from "../../types/practice/practice.types";
export const record = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
export const onlyKeys = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).length === keys.length && keys.every(key => key in v);
export const parsePracticeRequest = (v: unknown): PracticeRequest | null => {
    if (!record(v))
        return null;
    if (v.action === "start" && onlyKeys(v, ["action", "locale"]) && typeof v.locale === "string" && ["es", "en", "fr"].includes(v.locale))
        return v as PracticeRequest;
    if (typeof v.token !== "string" || v.token.length > 30000 || !v.token)
        return null;
    if (v.action === "next" && onlyKeys(v, ["action", "token"]))
        return v as PracticeRequest;
    if (v.action === "answer" && onlyKeys(v, ["action", "token", "answer", "usedHint"]) && typeof v.usedHint === "boolean" && record(v.answer) && onlyKeys(v.answer, ["value", "exponent"]) && [v.answer.value, v.answer.exponent].every(a => typeof a === "string" && a.length <= 80))
        return v as PracticeRequest;
    return null;
};
export const isDefinition = (v: unknown): v is Definition => {
    if (!record(v) || !onlyKeys(v, ["concept", "difficulty", "a", "b", "r", "exponent", "scene"]))
        return false;
    return concepts.some(c => c === v.concept) && [1, 2, 3].includes(Number(v.difficulty)) && typeof v.difficulty === "number" &&
        [v.a, v.b, v.r].every(n => typeof n === "number" && Number.isFinite(n) && n >= 0.001 && n <= 2000) &&
        typeof v.exponent === "number" && Number.isInteger(v.exponent) && v.exponent >= -12 && v.exponent <= 6 &&
        typeof v.scene === "string" && ["objects", "laboratory", "workshop"].includes(v.scene);
};
