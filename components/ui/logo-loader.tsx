import Image from "next/image";

interface LogoLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

export function LogoLoader({ size = 64, label = "Al-Mahdrah", className = "" }: LogoLoaderProps) {
  const ringSize = size + 30;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`} role="status" aria-live="polite">
      <div className="relative flex items-center justify-center" style={{ width: ringSize, height: ringSize }}>
        <span className="absolute inset-0 rounded-full border-2 border-border-strong" aria-hidden="true" />
        <span
          className="animate-loader-spin absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary"
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
        <span className="text-[11px] font-semibold tracking-[0.24em] text-muted uppercase">{label}</span>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}
