/**
 * The JLab brand mark. A J glyph inside a corner-bracketed frame, with a
 * single horizontal scan line that drifts vertically. Pure CSS animation,
 * transform only, so it stays cheap and respects reduced motion.
 */
export default function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-border-strong bg-bg-elev text-accent"
    >
      {/* Scan line. Translates on the Y axis only. */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-70 will-change-transform animate-scan-line"
      />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M9 2.4v6.4a2.6 2.6 0 0 1-2.6 2.6H4.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="9" cy="2.4" r="0.9" fill="currentColor" />
      </svg>
    </span>
  );
}
