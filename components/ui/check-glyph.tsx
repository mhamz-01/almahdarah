interface CheckGlyphProps {
  size?: number;
  className?: string;
}

export function CheckGlyph({ size = 24, className = "" }: CheckGlyphProps) {
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-[7px] border-2 border-green" />
      <span
        className="absolute bg-green"
        style={{
          inset: Math.round(size * 0.22),
          clipPath: "polygon(15% 50%, 40% 75%, 85% 20%, 100% 35%, 42% 100%, 0 60%)",
        }}
      />
    </span>
  );
}
