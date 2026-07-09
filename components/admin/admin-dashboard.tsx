"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StarRating } from "@/components/ui/star-rating";
import type { LeadRow, LeadSource, ReviewRow, ReviewerType } from "@/lib/types";

interface AdminDashboardProps {
  leads: LeadRow[];
  leadsError: string | null;
  reviews: ReviewRow[];
  reviewsError: string | null;
}

type Tab = "leads" | "reviews";

const sourceLabels: Record<LeadSource, string> = {
  demo_booking: "Demo booking",
  free_course: "Free course",
};

const sourceBadgeClasses: Record<LeadSource, string> = {
  demo_booking: "bg-primary/12 text-primary",
  free_course: "bg-green/15 text-green",
};

const reviewerLabels: Record<ReviewerType, string> = {
  parent: "Parent",
  student: "Student",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminDashboard({ leads, leadsError, reviews, reviewsError }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("leads");
  const [leadSourceFilter, setLeadSourceFilter] = useState<LeadSource | "all">("all");
  const [leadSearch, setLeadSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);

  const [reviewSearch, setReviewSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  const filteredLeads = useMemo(() => {
    const query = leadSearch.trim().toLowerCase();
    return leads.filter((lead) => {
      if (leadSourceFilter !== "all" && lead.source !== leadSourceFilter) return false;
      if (!query) return true;
      return (
        lead.name.toLowerCase().includes(query) ||
        (lead.phone ?? "").toLowerCase().includes(query) ||
        (lead.email ?? "").toLowerCase().includes(query)
      );
    });
  }, [leads, leadSourceFilter, leadSearch]);

  const filteredReviews = useMemo(() => {
    const query = reviewSearch.trim().toLowerCase();
    return reviews.filter((review) => {
      if (ratingFilter !== "all" && review.rating !== ratingFilter) return false;
      if (!query) return true;
      return (
        review.name.toLowerCase().includes(query) ||
        review.city.toLowerCase().includes(query) ||
        review.country.toLowerCase().includes(query)
      );
    });
  }, [reviews, ratingFilter, reviewSearch]);

  const demoCount = leads.filter((l) => l.source === "demo_booking").length;
  const freeCourseCount = leads.filter((l) => l.source === "free_course").length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("leads")}
          className={`flex h-10 items-center rounded-full px-5 text-[13.5px] font-bold transition-colors ${
            tab === "leads" ? "bg-primary text-white" : "border border-border-strong bg-surface text-muted"
          }`}
        >
          Leads ({leads.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("reviews")}
          className={`flex h-10 items-center rounded-full px-5 text-[13.5px] font-bold transition-colors ${
            tab === "reviews" ? "bg-primary text-white" : "border border-border-strong bg-surface text-muted"
          }`}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {tab === "leads" ? (
        <section className="mt-7">
          <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Leads</h1>
          <p className="mt-1 text-[14px] text-muted">
            {demoCount} demo booking{demoCount === 1 ? "" : "s"} · {freeCourseCount} free course sign-up
            {freeCourseCount === 1 ? "" : "s"}
          </p>

          {leadsError && (
            <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
              Couldn&apos;t load leads: {leadsError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <input
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              type="text"
              placeholder="Search by name, phone, or email…"
              className="h-11 w-full max-w-[320px] rounded-xl border-[1.5px] border-border-strong bg-surface px-4 text-[14px] text-ink outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              {(["all", "demo_booking", "free_course"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLeadSourceFilter(value)}
                  className={`flex h-11 items-center rounded-xl border-[1.5px] px-4 text-[13px] font-semibold transition-colors ${
                    leadSourceFilter === value
                      ? "border-primary bg-primary text-white"
                      : "border-border-strong bg-surface text-muted hover:border-primary hover:text-ink"
                  }`}
                >
                  {value === "all" ? "All sources" : sourceLabels[value]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-[18px] border border-border bg-surface">
            <table className="w-full min-w-[720px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-border text-[11.5px] font-bold tracking-[0.08em] text-muted uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold ${sourceBadgeClasses[lead.source]}`}
                      >
                        {sourceLabels[lead.source]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{lead.name}</td>
                    <td className="px-4 py-3 text-text">{lead.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-text">{lead.email ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLead(lead)}
                        className="text-[13px] font-bold text-primary hover:underline"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted">
                      No leads match yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="mt-7">
          <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Reviews</h1>
          <p className="mt-1 text-[14px] text-muted">{reviews.length} total submissions</p>

          {reviewsError && (
            <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
              Couldn&apos;t load reviews: {reviewsError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <input
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
              type="text"
              placeholder="Search by name, city, or country…"
              className="h-11 w-full max-w-[320px] rounded-xl border-[1.5px] border-border-strong bg-surface px-4 text-[14px] text-ink outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              {(["all", 5, 4, 3, 2, 1] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatingFilter(value)}
                  className={`flex h-11 items-center rounded-xl border-[1.5px] px-3.5 text-[13px] font-semibold transition-colors ${
                    ratingFilter === value
                      ? "border-primary bg-primary text-white"
                      : "border-border-strong bg-surface text-muted hover:border-primary hover:text-ink"
                  }`}
                >
                  {value === "all" ? "All ratings" : `${value}★`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="rounded-[18px] border border-border bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-ink">{review.name}</span>
                      <span className="inline-flex items-center rounded-full bg-navy/12 px-2.5 py-0.5 text-[11.5px] font-bold text-navy">
                        {reviewerLabels[review.reviewer_type]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {review.city}, {review.country} · {formatDate(review.created_at)}
                    </p>
                  </div>
                  <StarRating count={review.rating} />
                </div>
                <p className="mt-3 text-[14.5px] text-text">{review.review_text}</p>
              </div>
            ))}
            {filteredReviews.length === 0 && (
              <p className="rounded-[18px] border border-border bg-surface px-4 py-10 text-center text-muted">
                No reviews match yet.
              </p>
            )}
          </div>
        </section>
      )}

      <Dialog open={selectedLead !== null} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent>
          {selectedLead && (
            <div>
              <span className="inline-flex items-center gap-2.5 text-[11.5px] font-bold tracking-[0.2em] text-primary uppercase">
                <span className="h-0.5 w-[18px] bg-primary" />
                {sourceLabels[selectedLead.source]}
              </span>
              <DialogTitle className="mt-2.5">{selectedLead.name}</DialogTitle>
              <DialogDescription>Submitted {formatDate(selectedLead.created_at)}</DialogDescription>

              <div className="mt-5 flex flex-col gap-2.5 text-[14px]">
                {Object.entries({
                  phone: selectedLead.phone,
                  email: selectedLead.email,
                  ...selectedLead.details,
                }).map(([key, value]) =>
                  value === null || value === undefined || value === "" ? null : (
                    <div key={key} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                      <span className="font-semibold text-muted capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="text-right text-ink">{String(value)}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
