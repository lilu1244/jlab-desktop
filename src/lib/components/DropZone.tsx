import { useEffect, useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { cn } from "../cn";

interface Props {
  onPick: (path: string) => void;
}

const SUPPORTED_EXTS = ["jar", "zip", "mcpack", "mrpack"] as const;

function hasSupportedExt(path: string): boolean {
  const lower = path.toLowerCase();
  return SUPPORTED_EXTS.some((e) => lower.endsWith(`.${e}`));
}

// IMPORTANT: native file drops in Tauri arrive via getCurrentWebview().onDragDropEvent.
// HTML5 onDragOver/onDrop will NOT receive the file path on macOS or Windows.
// Do not "simplify" this to JSX drag handlers.
export default function DropZone({ onPick }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [picking, setPicking] = useState(false);

  // Keep onPick in a ref so the drag-drop listener can register exactly once.
  // Re-registering on every onPick identity change is a known source of HMR
  // race conditions where a new listener attaches before the old one detaches.
  const onPickRef = useRef(onPick);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | null = null;

    getCurrentWebview()
      .onDragDropEvent((event) => {
        if (event.payload.type === "over") setDragOver(true);
        else if (event.payload.type === "leave") setDragOver(false);
        else if (event.payload.type === "drop") {
          setDragOver(false);
          // Prefer a supported file. If none match, hand the first path to
          // the backend so it returns a typed unsupported_file error and
          // the user sees a real banner instead of silent failure.
          const picked =
            event.payload.paths.find(hasSupportedExt) ??
            event.payload.paths[0];
          if (picked) onPickRef.current(picked);
        }
      })
      .then((fn) => {
        if (cancelled) fn();
        else unlisten = fn;
      });

    // If the window loses focus mid-drag, the leave event may not fire.
    // Reset dragOver so the dropzone never gets stuck in armed state.
    const onBlur = () => setDragOver(false);
    window.addEventListener("blur", onBlur);

    return () => {
      cancelled = true;
      if (unlisten) unlisten();
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  async function pickFile() {
    if (picking) return;
    setPicking(true);
    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "JAR or container",
            extensions: [...SUPPORTED_EXTS],
          },
        ],
      });
      if (typeof selected === "string") onPick(selected);
    } catch (e) {
      console.error("[DropZone] open dialog failed", e);
    } finally {
      setPicking(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      void pickFile();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Choose a .jar, .zip, .mcpack, or .mrpack file to scan, or drop one onto this area"
      aria-disabled={picking || undefined}
      onClick={pickFile}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative isolate flex w-full cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-[var(--radius-lg)] border-2 border-dashed bg-bg-plate px-10 py-16 text-center transition-[border-color,background] duration-base ease-out",
        dragOver
          ? "border-accent bg-bg-elev"
          : "border-border hover:border-border-strong hover:bg-bg-plate/80",
        picking && "cursor-wait opacity-90",
      )}
    >
      {/* Soft ambient grid floor. Cannot block clicks. */}
      <div
        className="grid-bay pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />

      {/* Sweep bar only while a file is over the window. */}
      {dragOver && <div className="scan-bar" aria-hidden="true" />}

      {/* Icon. */}
      <div
        className={cn(
          "relative inline-flex h-16 w-16 items-center justify-center rounded-full border bg-bg-elev text-accent transition-[transform,border-color] duration-base ease-out will-change-transform",
          dragOver
            ? "border-accent [transform:scale(1.06)_translateZ(0)]"
            : "border-border-strong group-hover:border-accent",
        )}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 18.5h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </div>

      <div className="relative flex flex-col gap-1">
        <h2 className="m-0 text-[18px] font-semibold tracking-[-0.005em] text-text">
          {dragOver ? "Release to scan" : "Drop a .jar, .zip, .mcpack, or .mrpack here"}
        </h2>
        <p className="m-0 text-[14px] text-text-muted">
          or click anywhere to pick one from disk
        </p>
      </div>

      {/* Visual call-to-action. The whole panel is clickable, so this is
          decorative and shouldn't capture its own click. */}
      <span
        aria-hidden="true"
        className="relative inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-accent bg-accent px-5 py-2.5 text-[14px] font-semibold tracking-[0.01em] text-accent-ink transition-[background,box-shadow] duration-fast ease-out group-hover:bg-accent-bright group-hover:shadow-[0_0_0_4px_var(--color-accent-soft)]"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 9.5V4A1.5 1.5 0 0 1 3.5 2.5h3l1.5 1.5h3A1.5 1.5 0 0 1 12.5 5.5v4A1.5 1.5 0 0 1 11 11H3.5A1.5 1.5 0 0 1 2 9.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        Choose file
      </span>

      <p className="relative m-0 text-[12.5px] text-text-dim">
        Up to 50 MB
      </p>
    </div>
  );
}
