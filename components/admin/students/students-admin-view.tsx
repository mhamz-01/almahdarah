"use client";

import { useState } from "react";
import { StudentRequestsPanel } from "@/components/admin/students/student-requests-panel";
import { StudentsAdminPanel } from "@/components/admin/students/students-admin-panel";
import type { StudentRequestView, StudentWithLoginStatus } from "@/lib/types";

interface StudentsAdminViewProps {
  students: StudentWithLoginStatus[];
  requests: StudentRequestView[];
  loadError: string | null;
  requestsLoadError: string | null;
}

export function StudentsAdminView({ students, requests, loadError, requestsLoadError }: StudentsAdminViewProps) {
  const [tab, setTab] = useState<"students" | "requests">("students");
  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div role="tablist" className="mb-6 inline-flex rounded-full border border-border-strong bg-surface p-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "students"}
          onClick={() => setTab("students")}
          className={`h-9 rounded-full px-4 text-[13px] font-bold transition-colors ${
            tab === "students" ? "bg-ink text-bg" : "text-muted hover:text-ink"
          }`}
        >
          Students
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "requests"}
          onClick={() => setTab("requests")}
          className={`flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition-colors ${
            tab === "requests" ? "bg-ink text-bg" : "text-muted hover:text-ink"
          }`}
        >
          Join requests
          {pending > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 font-mono text-[10.5px] text-white">
              {pending}
            </span>
          )}
        </button>
      </div>

      {/* Remount when the set of students changes (e.g. a request was accepted
          and the page re-fetched) so the roster picks up the new student. */}
      {tab === "students" ? (
        <StudentsAdminPanel
          key={students.map((s) => s.id).join(",")}
          students={students}
          loadError={loadError}
        />
      ) : (
        <StudentRequestsPanel requests={requests} loadError={requestsLoadError} />
      )}
    </div>
  );
}
