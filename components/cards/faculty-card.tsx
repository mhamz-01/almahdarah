import Link from "next/link";
import type { FacultyMember } from "@/lib/types";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";

export function FacultyCard({ slug, name, subject, bio, accent }: FacultyMember) {
  return (
    <Link
      href={`/faculty/${slug}`}
      className="group block rounded-[22px] border border-border bg-surface p-[26px] text-center shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
    >
      <AvatarPlaceholder
        accent={accent}
        size={98}
        className="mx-auto mb-4 border-[3px] border-surface shadow-[var(--shadow-sm)] transition-transform duration-300 ease-out group-hover:scale-[1.07] group-hover:-rotate-2"
      />
      <h3 className="text-[17px] font-bold text-ink">{name}</h3>
      <p className="mt-1 mb-2.5 text-[13px] font-bold text-green">{subject}</p>
      <p className="text-[13px] text-text">{bio}</p>
    </Link>
  );
}
