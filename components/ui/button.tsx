import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "gold" | "outline" | "invert";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[0_12px_26px_-6px_var(--primary)] hover:brightness-[1.07]",
  gold: "bg-gold text-[#2b2a26] shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:-translate-y-0.5",
  outline:
    "bg-surface border border-border-strong text-fg shadow-[var(--shadow-sm)] hover:border-primary",
  invert:
    "bg-white/[0.14] border border-white/40 text-white hover:bg-white/[0.22]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[13.5px]",
  md: "h-11 px-[18px] text-[13.5px]",
  lg: "h-[54px] px-[26px] text-[15.5px] sm:h-14 sm:px-7",
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonProps = ButtonAsLink | ButtonAsButton;

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-all duration-200";

export function Button({
  variant = "primary",
  size = "md",
  withArrow = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const content = (
    <>
      {children}
      {withArrow && <span className="text-[1.15em] leading-none">→</span>}
    </>
  );

  if (props.href) {
    const { href, ...anchorProps } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonAsButton)}>
      {content}
    </button>
  );
}
