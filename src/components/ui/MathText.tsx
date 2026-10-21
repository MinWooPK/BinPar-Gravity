// Render subscripts from translated or generated text using ordinary font glyphs.
// The inline wrapper keeps the base and subscript together inside flex layouts.
export const MathText = ({ children }: { children: string }) => (
  <span>
    {children.split(/([₀-₉ₓᵧ]+)/u).map((part, index) =>
      /^[₀-₉ₓᵧ]+$/u.test(part) ? (
        <sub key={index} className="static align-sub text-[0.65em] leading-0">
          {/* The legacy y-like glyph is a Greek gamma; these labels mean y. */}
          {part.replaceAll("ᵧ", "y").normalize("NFKC")}
        </sub>
      ) : (
        part
      ),
    )}
  </span>
);
