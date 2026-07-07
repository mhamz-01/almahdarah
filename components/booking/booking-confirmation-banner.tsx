import { Button } from "@/components/ui/button";

interface BookingConfirmationBannerProps {
  firstName: string;
  email: string;
}

const nextSteps = [
  "You'll receive an email confirmation with the video call link from Calendly.",
  "Your teacher will send a short welcome message on WhatsApp beforehand.",
  "Meet live, ask questions — decide together if it's the right fit. No payment is ever required on this platform.",
];

export function BookingConfirmationBanner({ firstName, email }: BookingConfirmationBannerProps) {
  return (
    <div className="mb-8 rounded-[22px] border border-green/30 bg-mint p-7">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green/15">
        <span className="text-2xl leading-none font-extrabold text-green">✓</span>
      </div>
      <span className="mt-3.5 inline-flex items-center gap-2.5 text-[12.5px] font-bold tracking-[0.2em] text-green uppercase">
        <span className="h-0.5 w-[22px] bg-green" />
        You&apos;re booked
      </span>
      <h2 className="mt-3.5 font-display text-[clamp(22px,2.8vw,32px)] leading-[1.04] tracking-[-0.01em] text-ink uppercase">
        See you soon, {firstName}
      </h2>
      <p className="mt-3 max-w-[54ch] text-[15px] text-text">
        A confirmation has been sent to {email} by Calendly, with a calendar invite and video call link attached.
      </p>

      <div className="mt-6 max-w-[560px]">
        <div className="mb-3.5 text-[13px] font-bold tracking-[0.1em] text-muted uppercase">What happens next</div>
        <div className="flex flex-col gap-3">
          {nextSteps.map((step, i) => (
            <div key={step} className="flex gap-3">
              <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-surface text-xs font-extrabold text-primary-2">
                {i + 1}
              </span>
              <span className="text-sm text-text">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button href="/#free" size="md">
          Explore free courses while you wait
        </Button>
        <Button href="/" variant="outline" size="md">
          Return home
        </Button>
      </div>
    </div>
  );
}
