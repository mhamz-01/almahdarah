interface StarRatingProps {
  count?: number;
  className?: string;
}

export function StarRating({ count = 5, className = "text-gold" }: StarRatingProps) {
  return <span className={`tracking-[2px] ${className}`}>{"★".repeat(count)}</span>;
}
