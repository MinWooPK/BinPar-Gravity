import { gravitationalForce } from "../gravitation";
import type { Answer, Attempt, Definition, Question } from "../../types/practice/practice.types";
import { answerKind, optionsFor, numericAnswer, parsePracticeNumber } from "./input";
export { answerKind, optionsFor, numericAnswer, parsePracticeNumber } from "./input";
export const expectedAnswer = (q: Definition): number | string => {
    switch (q.concept) {
        case "attraction": return "attract";
        case "mutual": return "equal";
        case "mass": return "double";
        case "distance":
        case "reasoning": return "quarter";
        case "km": return q.a * 1000;
        case "cm": return q.a / 100;
        case "tonnes": return q.a * 1000;
        case "square": return q.a ** 2;
        case "power": return q.a * 10 ** q.exponent;
        case "force": return gravitationalForce({ mass1: q.a * (q.difficulty === 3 ? 1000 : 1), mass2: q.b, distance: q.r * (q.difficulty >= 2 ? 1000 : 1) });
    }
};
export const withinTolerance = (actual: number, expected: number) => Math.abs(actual - expected) <= Math.abs(expected) * 0.005;
export const evaluateAnswer = (question: Question, answer: Answer, usedHint: boolean): Attempt => {
    const expected = expectedAnswer(question);
    const kind = answerKind(question);
    const actual = kind === "choice" ? answer.value : numericAnswer(answer, kind === "scientific");
    if (actual === null || (kind === "choice" && !optionsFor(question).includes(String(actual))))
        throw new Error("invalid_answer");
    const correct = typeof expected === "number" && typeof actual === "number" ? withinTolerance(actual, expected) : actual === expected;
    let error: string | null = null;
    if (!correct) {
        if (["km", "cm", "tonnes"].includes(question.concept) && actual === question.a)
            error = "unconverted";
        if (question.concept === "square" && actual === question.a)
            error = "square";
        if (["distance", "reasoning"].includes(question.concept) && actual === "half")
            error = "distanceSquared";
        if (question.concept === "mass" && actual === "four")
            error = "massLinear";
        if (typeof actual === "number" && typeof expected === "number") {
            const coefficient = parsePracticeNumber(answer.value), exponent = parsePracticeNumber(answer.exponent);
            if (kind === "scientific" && exponent && coefficient !== null && withinTolerance(coefficient * 10 ** -exponent, expected))
                error = "exponentSign";
            if (question.concept === "force") {
                const mass1 = question.a * (question.difficulty === 3 ? 1000 : 1), r = question.r * (question.difficulty >= 2 ? 1000 : 1);
                if (withinTolerance(actual, gravitationalForce({ mass1, mass2: question.b, distance: r }) * r))
                    error = "distanceSquared";
                if (question.difficulty >= 2 && withinTolerance(actual, gravitationalForce({ mass1, mass2: question.b, distance: question.r })))
                    error = "km";
                if (question.difficulty === 3 && withinTolerance(actual, gravitationalForce({ mass1: question.a, mass2: question.b, distance: r })))
                    error = "tonnes";
            }
        }
    }
    return { question, answer, actual, expected, correct, error, usedHint };
};
