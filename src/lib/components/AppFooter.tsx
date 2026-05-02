import { useEffect, useState } from "react";
import { appVersion, openUrl } from "../api";
import LogControl from "./LogControl";

const RELEASES_URL = "https://github.com/NeikiDev/jlab-desktop/releases";

export default function AppFooter() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const v = await appVersion();
        if (!cancelled) setVersion(v);
      } catch {
        // Footer is decorative; ignore failures.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!version) return null;

  return (
    <footer className="relative flex shrink-0 items-center justify-between gap-3 border-t border-border-faint bg-bg-plate/80 px-5 py-1.5 text-[11px] text-text-dim backdrop-blur-[6px]">
      <span className="font-mono tracking-[0.04em]">JLab Desktop</span>
      <div className="flex items-center gap-3 text-[11px]">
        <LogControl />
        <button
          type="button"
          onClick={() => void openUrl(RELEASES_URL)}
          title="Open the GitHub releases page"
          className="inline-flex cursor-pointer items-center gap-1 rounded-sm border-0 bg-transparent px-1 py-0.5 font-mono tracking-[0.04em] text-text-muted transition-colors duration-fast ease-out hover:text-text"
        >
          v{version}
        </button>
      </div>
    </footer>
  );
}
