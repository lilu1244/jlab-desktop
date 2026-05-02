import { useMemo } from "react";
import type { ConfirmedFamily } from "../types";

interface Props {
  families: ConfirmedFamily[];
}

export default function FamilyAlert({ families }: Props) {
  const totalSignatures = useMemo(
    () => families.reduce((acc, f) => acc + (f.signatureCount || 0), 0),
    [families],
  );

  return (
    <section
      role="alert"
      aria-label="Confirmed malware families detected"
      className="bracketed relative flex animate-rise-in flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-sev-critical-edge)] p-4 px-5 shadow-[0_0_0_1px_rgba(255,93,108,0.10),0_10px_30px_rgba(255,93,108,0.10)]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 93, 108, 0.14), rgba(255, 93, 108, 0.04))",
      }}
    >
      <span className="bracket-bl" aria-hidden="true" />
      <span className="bracket-br" aria-hidden="true" />

      <span
        className="absolute inset-y-0 left-0 w-[3px] bg-sev-critical"
        aria-hidden="true"
      />

      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-[color:var(--color-sev-critical-edge)] bg-bg-plate/40 text-sev-critical"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1.5 16.5 15h-15L9 1.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M9 7v3.5M9 12.5h.01"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-sev-critical">
              red&nbsp;alert
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-[color:var(--color-sev-critical-edge)]" />
            <span
              className="text-[15px] font-semibold tracking-[-0.005em] text-text"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Malware family confirmed
            </span>
            <span className="tnum inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-sev-critical px-1.5 font-mono text-[10.5px] font-bold text-[#1b0508]">
              {families.length}
            </span>
          </div>
          <div className="mt-1 text-[12.5px] leading-[1.5] text-text-muted">
            {totalSignatures > 0
              ? `${totalSignatures} signature${totalSignatures === 1 ? "" : "s"} matched across known families.`
              : "Signatures match a known malware family."}
            {" "}
            <span className="text-text">This identification is reliable.</span>
          </div>
        </div>
      </div>

      <ul className="flex list-none flex-wrap gap-1.5 p-0 m-0">
        {families.map((fam) => (
          <li
            key={fam.name}
            className="inline-flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-sev-critical-edge)] bg-bg-inset/60 py-1 pl-2.5 pr-1.5 font-mono text-[11.5px] font-medium text-text"
          >
            <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-sev-critical" />
            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[240px] tracking-[0.01em]"
              title={fam.name}
            >
              {fam.name}
            </span>
            <span className="tnum inline-flex shrink-0 items-baseline gap-[2px] rounded-[3px] bg-sev-critical px-1.5 py-[1px] text-[10px] font-bold text-[#1b0508]">
              {fam.signatureCount}
              <span className="text-[8.5px] font-bold uppercase tracking-[0.06em] opacity-80">
                sig{fam.signatureCount === 1 ? "" : "s"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
