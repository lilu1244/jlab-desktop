import type { ScanState } from "../types";
import { cn } from "../cn";

interface Props {
  scan: ScanState;
}

/**
 * Center status readout. Quiet by design. Shows nothing in the idle state.
 * Shows a single colored phase word plus the active file when one is set.
 */
export default function StateCrumb({ scan }: Props) {
  if (scan.state === "idle") return null;

  const stage =
    scan.state === "scanning"
      ? "running"
      : scan.state === "result"
      ? "report"
      : "error";

  const file =
    scan.state === "scanning"
      ? scan.fileName
      : scan.state === "result"
      ? scan.result.fileName
      : null;

  const tone =
    stage === "running"
      ? "text-accent"
      : stage === "report"
      ? "text-text-muted"
      : "text-sev-critical";

  return (
    <div className="hidden min-w-0 items-center gap-2 sm:flex">
      <span
        className={cn(
          "font-mono text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-base ease-out",
          tone,
        )}
      >
        {stage}
        {stage === "running" && (
          <span aria-hidden="true" className="ml-1 inline-block animate-status-pulse">
            …
          </span>
        )}
      </span>
      {file && (
        <>
          <span aria-hidden="true" className="text-text-faint">·</span>
          <span
            className="max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12px] text-text-muted"
            title={file}
          >
            {file}
          </span>
        </>
      )}
    </div>
  );
}
