interface DiamondMarkProps {
  className?: string;
  colorClassName?: string;
}

export function DiamondMark({
  className = "h-[34px] w-[34px]",
  colorClassName = "border-current",
}: DiamondMarkProps) {
  return (
    <span className={`relative inline-block ${className}`} aria-hidden="true">
      <span className={`absolute inset-0 rounded-[9px] border-2 ${colorClassName}`} />
      <span
        className={`absolute inset-0 rounded-[9px] border-2 ${colorClassName} rotate-45`}
      />
    </span>
  );
}
