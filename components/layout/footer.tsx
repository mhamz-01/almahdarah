import Image from "next/image";

const footerColumns = [
  {
    heading: "Learn",
    links: [
      { label: "Mentored courses", href: "#courses" },
      { label: "Free courses", href: "#free" },
      { label: "Book a demo", href: "#demo" },
    ],
  },
  {
    heading: "Academy",
    links: [
      { label: "Our vision", href: "#vision" },
      { label: "Faculty", href: "#faculty" },
      { label: "Journal", href: "#blog" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "@al.mahdrah", href: "#demo" },
      { label: "Newsletter", href: "#demo" },
      { label: "Community", href: "#demo" },
    ],
  },
];

const socialInitials = ["f", "IG", "TT"];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-9 px-7 pt-12 pb-9 sm:grid-cols-2 lg:grid-cols-[minmax(0,380px)_repeat(3,1fr)] lg:pt-[72px]">
        <div className="sm:col-span-2 lg:col-span-1">
          <a href="#top" className="flex items-center gap-3">
            <Image
              src="/assets/almahdrah-logo.png"
              alt="Al-Mahdrah"
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-auto [filter:var(--logo-filter)]"
            />
            <span className="font-display text-[17px] text-ink">AL-MAHDRAH</span>
          </a>
          <p className="mt-4 font-serif text-base text-text italic">
            &ldquo;From the ink-pot till the grave.&rdquo;
          </p>
          <p className="mt-1.5 text-[13px] text-muted">
            Authentic knowledge for a resilient generation.
          </p>
          <div className="mt-[18px] flex gap-[9px]">
            {socialInitials.map((label) => (
              <span
                key={label}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-surface-2 text-[11px] font-bold text-muted"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.heading}>
            <div className="mb-3.5 text-xs font-bold tracking-[0.08em] text-muted uppercase">
              {column.heading}
            </div>
            <div className="flex flex-col gap-2.5 text-sm text-text">
              {column.links.map((link) => (
                <a key={link.label} href={link.href} className="transition-colors hover:text-green">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-2.5 px-7 py-5 text-[12.5px] text-muted">
          <span>© {new Date().getFullYear()} Al-Mahdrah Islamic Academy.</span>
          <span>Tuition arranged directly with teachers — never on-platform.</span>
        </div>
      </div>
    </footer>
  );
}
