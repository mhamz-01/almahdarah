"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentRequestStatus, StudentRequestView } from "@/lib/types";

interface StudentRequestsPanelProps {
  requests: StudentRequestView[];
  loadError: string | null;
}

const FILTERS: { value: StudentRequestStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function StudentRequestsPanel({ requests, loadError }: StudentRequestsPanelProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<StudentRequestStatus>("pending");
  const [busy, setBusy] = useState<{ id: number; action: "accept" | "reject" } | null>(null);
  const [error, setError] = useState<{ id: number; message: string } | null>(null);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; message: string } | null>(null);

  const visible = requests.filter((r) => r.status === filter);
  const count = (status: StudentRequestStatus) => requests.filter((r) => r.status === status).length;

  async function review(id: number, action: "accept" | "reject") {
    setBusy({ id, action });
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/student-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; emailSent?: boolean; emailError?: string | null };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Request failed");
      if (action === "accept") {
        setNotice(
          json.emailSent
            ? { tone: "ok", message: "Request accepted. A welcome email with their sign-in details was sent." }
            : { tone: "warn", message: `Request accepted, but the welcome email wasn't sent: ${json.emailError ?? "unknown error"}. Share their sign-in details with them directly.` },
        );
      }
      router.refresh();
    } catch (e) {
      setError({ id, message: e instanceof Error ? e.message : "Couldn't update this request" });
    } finally {
      setBusy(null);
    }
  }

  function togglePassword(id: number) {
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <h1 className="font-display text-[24px] tracking-[-0.01em] text-ink uppercase">Join requests</h1>
      <p className="mt-1 text-[14px] text-muted">
        Submitted from the student sign-in page. Accept a request and that person can sign in straight away. They are
        emailed their sign-in details.
      </p>

      {notice && (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            notice.tone === "ok" ? "border-green/30 bg-green/10 text-green" : "border-red-600/30 bg-red-600/10 text-red-600"
          }`}
        >
          {notice.message}
        </p>
      )}

      {loadError && (
        <p className="mt-4 rounded-xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-600">
          Couldn&apos;t load requests: {loadError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`flex h-9 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-[12.5px] font-bold transition-colors ${
              filter === f.value
                ? "border-primary bg-primary text-white"
                : "border-border-strong bg-surface text-muted hover:border-primary hover:text-ink"
            }`}
          >
            {f.label}
            <span className="opacity-75">· {count(f.value)}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-[16px] border border-border bg-surface px-6 py-12 text-center text-muted">
          {filter === "pending" ? "No requests waiting for review." : `No ${filter} requests.`}
        </p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {visible.map((r) => (
            <div key={r.id} className="flex flex-col rounded-[16px] border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-bold text-ink">{r.name}</div>
                  <div className="font-mono text-[12px] text-muted">{r.username}</div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted">{formatDate(r.created_at)}</span>
              </div>

              <dl className="mt-4 flex flex-col gap-3 text-[13.5px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <dt className="text-[11px] font-bold tracking-[0.08em] text-muted uppercase">Email</dt>
                    <dd className="mt-1 break-all text-text">{r.email ?? "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-bold tracking-[0.08em] text-muted uppercase">Mobile</dt>
                    <dd className="mt-1 text-text">{r.phone ?? "—"}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.08em] text-muted uppercase">Time with Al-Mahdrah</dt>
                  <dd className="mt-1 text-text">{r.time_at_almahdrah}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.08em] text-muted uppercase">
                    Expects from the portal
                  </dt>
                  <dd className="mt-1 leading-[1.6] break-words whitespace-pre-wrap text-text">{r.expectations}</dd>
                </div>
                {r.status === "pending" && (
                  <div>
                    <dt className="text-[11px] font-bold tracking-[0.08em] text-muted uppercase">Chosen password</dt>
                    <dd className="mt-1 flex items-center gap-2 font-mono text-text">
                      {r.password === null ? (
                        <span className="font-sans text-[12px] text-muted">Not viewable</span>
                      ) : (
                        <>
                          <span className="font-bold">{shown.has(r.id) ? r.password : "••••••••"}</span>
                          <button
                            type="button"
                            onClick={() => togglePassword(r.id)}
                            className="font-sans text-[11.5px] font-bold text-primary"
                          >
                            {shown.has(r.id) ? "Hide" : "Show"}
                          </button>
                        </>
                      )}
                    </dd>
                  </div>
                )}
              </dl>

              {r.status === "pending" ? (
                <div className="mt-5 border-t border-border pt-4">
                  {error?.id === r.id && (
                    <p className="mb-3 text-[12.5px] font-semibold text-red-600">{error.message}</p>
                  )}
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => review(r.id, "reject")}
                      disabled={busy?.id === r.id}
                      className="h-10 flex-1 rounded-lg border-[1.5px] border-red-600/30 bg-red-600/10 text-[13px] font-bold text-red-600 transition-colors hover:border-red-600/50 disabled:opacity-60"
                    >
                      {busy?.id === r.id && busy.action === "reject" ? "Rejecting…" : "Reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => review(r.id, "accept")}
                      disabled={busy?.id === r.id}
                      className="h-10 flex-1 rounded-lg bg-primary text-[13px] font-bold text-white transition-colors hover:brightness-[1.07] disabled:opacity-60"
                    >
                      {busy?.id === r.id && busy.action === "accept" ? "Accepting…" : "Accept"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 border-t border-border pt-4 text-[12.5px] text-muted">
                  <span className={`font-bold ${r.status === "accepted" ? "text-green" : "text-red-600"}`}>
                    {r.status === "accepted" ? "Accepted" : "Rejected"}
                  </span>
                  {r.reviewed_at && ` · ${formatDate(r.reviewed_at)}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
