/** Decorative static layer for a positioned hero container. */
export const SpaceBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 z-0 bg-[#02040a] bg-[url('/backgrounds/space-stars.svg')] bg-cover bg-center bg-no-repeat"
  />
);
