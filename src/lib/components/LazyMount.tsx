import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** How far outside the viewport (in CSS pixels) to start mounting. */
  rootMargin?: string;
  /** Reserved height while unmounted, so the scrollbar stays stable. */
  estimatedHeight?: number;
  /** Optional inline style applied to the placeholder. */
  className?: string;
}

/**
 * Mounts children once they near the viewport, then keeps them mounted.
 * Keeping them around preserves internal state (e.g. an expanded card)
 * across scrolling without re-measuring heights.
 */
export default function LazyMount({
  children,
  rootMargin = "600px 0px",
  estimatedHeight = 56,
  className,
}: Props) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const el = sentinel.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMounted(true);
            obs.disconnect();
            return;
          }
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [mounted, rootMargin]);

  if (mounted) return <>{children}</>;
  return (
    <div
      ref={sentinel}
      aria-hidden="true"
      className={className}
      style={{ minHeight: estimatedHeight }}
    />
  );
}
