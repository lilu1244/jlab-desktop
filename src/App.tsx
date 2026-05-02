import { useCallback, useReducer } from "react";
import DropZone from "./lib/components/DropZone";
import ScanProgress from "./lib/components/ScanProgress";
import SignatureList from "./lib/components/SignatureList";
import ErrorBanner from "./lib/components/ErrorBanner";
import RemoteStatus from "./lib/components/RemoteStatus";
import UpdaterButton from "./lib/components/UpdaterButton";
import BrandMark from "./lib/components/BrandMark";
import StateCrumb from "./lib/components/StateCrumb";
import AppFooter from "./lib/components/AppFooter";
import { cancelScan, isAppError, scanJar } from "./lib/api";
import type { AppError, ScanResult, ScanState } from "./lib/types";

type Action =
  | { type: "start"; path: string }
  | { type: "success"; result: ScanResult }
  | { type: "fail"; error: AppError; lastPath: string | null }
  | { type: "reset" };

function reducer(_state: ScanState, action: Action): ScanState {
  switch (action.type) {
    case "start": {
      const fileName = action.path.split(/[\\/]/).pop() ?? action.path;
      return { state: "scanning", fileName, path: action.path };
    }
    case "success":
      return { state: "result", result: action.result };
    case "fail":
      return { state: "error", error: action.error, lastPath: action.lastPath };
    case "reset":
      return { state: "idle" };
  }
}

export default function App() {
  const [scan, dispatch] = useReducer(
    reducer,
    { state: "idle" } as ScanState,
  );

  const startScan = useCallback(async (path: string) => {
    dispatch({ type: "start", path });
    try {
      const result = await scanJar(path);
      dispatch({ type: "success", result });
    } catch (raw) {
      const err: AppError = isAppError(raw)
        ? raw
        : {
            kind: "network",
            message: String((raw as { message?: string })?.message ?? raw),
          };
      if (err.kind === "cancelled") {
        dispatch({ type: "reset" });
        return;
      }
      dispatch({ type: "fail", error: err, lastPath: path });
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const retry = useCallback(() => {
    if (scan.state === "error" && scan.lastPath) {
      void startScan(scan.lastPath);
    }
  }, [scan, startScan]);
  const cancel = useCallback(() => {
    void cancelScan();
  }, []);

  return (
    <>
      <header className="relative flex shrink-0 items-center justify-between gap-4 border-b border-border-faint bg-bg-plate/80 px-5 py-2.5 backdrop-blur-[6px]">
        <button
          type="button"
          onClick={reset}
          aria-label="Return to home"
          className="group inline-flex cursor-pointer items-center gap-2.5 rounded-sm border-0 bg-transparent p-1 -m-1 text-left transition-opacity duration-fast ease-out hover:opacity-95"
        >
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-[0.02em] text-text leading-none">
            JLAB&nbsp;-&nbsp;Desktop
          </span>
        </button>
        <StateCrumb scan={scan} />
        <div className="flex items-center gap-2">
          <UpdaterButton />
          <RemoteStatus />
        </div>
      </header>

      <main
        className="relative flex w-full min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-7 pt-5"
        style={{
          paddingLeft: "clamp(20px, 2.4vw, 36px)",
          paddingRight: "clamp(20px, 2.4vw, 36px)",
        }}
      >
        {scan.state === "error" && (
          <ErrorBanner
            error={scan.error}
            onRetry={retry}
            onDismiss={reset}
            canRetry={scan.lastPath !== null}
          />
        )}

        {scan.state === "idle" && (
          <div className="flex w-full flex-col gap-6 pt-6">
            <section className="flex flex-col items-center gap-2 text-center">
              <h1 className="m-0 text-[28px] font-semibold tracking-[-0.015em] text-text">
                Scan a Java archive
              </h1>
              <p className="m-0 text-[14.5px] leading-[1.55] text-text-muted">
                Drop a .jar (or a .zip / .mcpack / .mrpack containing one) to
                check it against the JLab signature set.
              </p>
            </section>

            <DropZone onPick={startScan} />

            <section className="grid grid-cols-3 gap-4 max-[820px]:grid-cols-1">
              {STEPS.map((s, idx) => (
                <article
                  key={s.title}
                  className="group relative overflow-hidden rounded-[var(--radius)] border border-border-faint bg-bg-plate/60 px-5 py-4 transition-[border-color,transform] duration-base ease-out hover:border-border-strong hover:[transform:translateY(-1px)_translateZ(0)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-60"
                  />
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-text-dim">
                      step&nbsp;{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden="true" className="text-text-faint group-hover:text-accent transition-colors duration-base ease-out">
                      {s.icon}
                    </span>
                  </div>
                  <h4 className="m-0 mt-2 text-[15px] font-semibold text-text">
                    {s.title}
                  </h4>
                  <p className="m-0 mt-1 text-[13px] leading-[1.5] text-text-muted">
                    {s.body}
                  </p>
                </article>
              ))}
            </section>
          </div>
        )}

        {scan.state === "error" && <DropZone onPick={startScan} />}
        {scan.state === "scanning" && (
          <ScanProgress fileName={scan.fileName} onCancel={cancel} />
        )}
        {scan.state === "result" && (
          <SignatureList result={scan.result} onReset={reset} />
        )}
      </main>

      <AppFooter />
    </>
  );
}

const STEPS: ReadonlyArray<{
  title: string;
  body: React.ReactNode;
  icon: React.ReactNode;
}> = [
  {
    title: "Pick a file",
    body: (
      <>
        Drag in a <code className="font-mono text-[12px] text-text">.jar</code>,{" "}
        <code className="font-mono text-[12px] text-text">.zip</code>,{" "}
        <code className="font-mono text-[12px] text-text">.mcpack</code>, or{" "}
        <code className="font-mono text-[12px] text-text">.mrpack</code>. Up to
        50&nbsp;MB. The largest inner JAR is scanned.
      </>
    ),
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M12 3v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Nothing is stored",
    body: (
      <>
        Your file is held in memory on the JLab server only for the scan. No
        copy is kept.
      </>
    ),
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5 4 4.6V10c0 3.6 2.6 6.4 6 7.5 3.4-1.1 6-3.9 6-7.5V4.6L10 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M7.6 9.8 9.4 11.6 12.7 8.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Read the report",
    body: <>Matches are grouped by severity. Each row shows what triggered it.</>,
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3.5 7.5h4v9h-4zM8.5 10.5h4v6h-4zM13.5 4.5h4v12h-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
  },
];
