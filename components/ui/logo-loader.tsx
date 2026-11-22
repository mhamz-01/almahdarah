import Image from "next/image";
import type { CSSProperties } from "react";

interface LogoLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

// pieces that circle the mark, echoing the particles that form the name on the home page
const INNER = Array.from({ length: 7 }, (_, i) => ({
  angle: (360 / 7) * i,
  s: 4 + (i % 3) * 1.5,
  o: 0.55 + (i % 4) * 0.12,
}));
const OUTER = Array.from({ length: 5 }, (_, i) => ({
  angle: (360 / 5) * i + 18,
  s: 3 + (i % 2) * 2,
  o: 0.5 + (i % 3) * 0.15,
}));

export function LogoLoader({ size = 64, label = "Al-Mahdrah", className = "" }: LogoLoaderProps) {
  const ring = size + 30;
  const outer = size + 70;

  return (
    <div
      data-ds="v2"
      className={`flex flex-col items-center gap-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center" style={{ width: outer, height: outer }}>
        {/* soft light behind the mark */}
        <span
          aria-hidden="true"
          className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(17,130,163,.2),transparent_68%)]"
        />

        {/* outer orbit: gold pieces, slow, the other way round */}
        <span
          aria-hidden="true"
          className="ld-orbit absolute inset-0"
          style={{ "--dur": "11s", "--dir": "reverse" } as CSSProperties}
        >
          {OUTER.map((d) => (
            <span
              key={d.angle}
              className="absolute top-1/2 left-1/2 rounded-full bg-accent"
              style={{
                width: d.s,
                height: d.s,
                opacity: d.o,
                marginLeft: -d.s / 2,
                marginTop: -d.s / 2,
                transform: `rotate(${d.angle}deg) translateY(${-outer / 2 + 3}px)`,
              }}
            />
          ))}
        </span>

        {/* inner orbit: blue pieces */}
        <span
          aria-hidden="true"
          className="ld-orbit absolute"
          style={{ inset: (outer - ring - 14) / 2, "--dur": "7s" } as CSSProperties}
        >
          {INNER.map((d) => (
            <span
              key={d.angle}
              className="absolute top-1/2 left-1/2 rounded-full bg-primary"
              style={{
                width: d.s,
                height: d.s,
                opacity: d.o,
                marginLeft: -d.s / 2,
                marginTop: -d.s / 2,
                transform: `rotate(${d.angle}deg) translateY(${-(ring + 14) / 2 + 2}px)`,
              }}
            />
          ))}
        </span>

        {/* ring and the arc that runs round it */}
        <span
          className="absolute rounded-full border-[1.5px] border-border-strong"
          style={{ width: ring, height: ring }}
          aria-hidden="true"
        />
        <span
          className="animate-loader-spin absolute rounded-full border-2 border-transparent border-t-primary"
          style={{ width: ring, height: ring }}
          aria-hidden="true"
        />

        <Image
          src="/assets/almahdrah-logo.png"
          alt=""
          width={size}
          height={size}
          priority
          className="animate-pulse-soft relative [filter:var(--logo-filter)]"
          style={{ width: size, height: size }}
        />
      </div>

      {label && (
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">{label}</span>
          <span className="relative block h-[2px] w-24 overflow-hidden rounded-full bg-border-strong" aria-hidden="true">
            <span className="animate-progress-indeterminate absolute inset-y-0 rounded-full bg-primary" />
          </span>
        </div>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}
