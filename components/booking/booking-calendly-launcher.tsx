"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";

interface BookingCalendlyLauncherProps {
  url: string;
  prefillName?: string;
  prefillEmail?: string;
  onOpen?: () => void;
  label?: string;
  variant?: "primary" | "outline";
}

export function BookingCalendlyLauncher({
  url,
  prefillName,
  prefillEmail,
  onOpen,
  label = "Open Calendly to pick a time",
  variant = "primary",
}: BookingCalendlyLauncherProps) {
  const href = useMemo(() => {
    const target = new URL(url);
    if (prefillName) target.searchParams.set("name", prefillName);
    if (prefillEmail) target.searchParams.set("email", prefillEmail);
    return target.toString();
  }, [url, prefillName, prefillEmail]);

  return (
    <Button
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onOpen}
      size="lg"
      variant={variant}
      withArrow
    >
      {label}
    </Button>
  );
}
