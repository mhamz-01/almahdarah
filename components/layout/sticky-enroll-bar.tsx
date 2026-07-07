"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CourseDetail } from "@/lib/types";
import { JoinCommunityDialog } from "@/components/community/join-community-dialog";
import { getBookingHref, getCourseCopy } from "@/lib/course-copy";

interface StickyEnrollBarProps {
  course: CourseDetail;
}

const stickyCtaClasses =
  "inline-flex h-[42px] shrink-0 items-center whitespace-nowrap rounded-full bg-gold px-5 text-[13.5px] font-bold text-[#2b2a26] transition-transform duration-200 hover:-translate-y-0.5";

export function StickyEnrollBar({ course }: StickyEnrollBarProps) {
  const [visible, setVisible] = useState(false);
  const copy = getCourseCopy(course.type);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-3.5 transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto flex w-full max-w-[760px] items-center justify-between gap-4 rounded-[18px] bg-ink px-[14px] py-3 pl-[18px] text-white shadow-[var(--shadow-lg)]">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-primary/40">
            <span className="relative inline-block h-4 w-4">
              <span className="absolute inset-0 rounded-[4px] border-2 border-gold" />
              <span className="absolute inset-0 rotate-45 rounded-[4px] border-2 border-gold" />
            </span>
          </span>
          <div className="hidden min-w-0 sm:block">
            <div className="truncate text-[13.5px] font-bold">{course.title}</div>
            <div className="text-xs text-white/65">★ {course.rating} · {course.studentsLine}</div>
          </div>
        </div>
        {copy.isPaid ? (
          <Link href={getBookingHref(course)} className={stickyCtaClasses}>
            {copy.stickyLabel}
          </Link>
        ) : (
          <JoinCommunityDialog courseTitle={course.title}>
            <button type="button" className={stickyCtaClasses}>
              {copy.stickyLabel}
            </button>
          </JoinCommunityDialog>
        )}
      </div>
    </div>
  );
}
