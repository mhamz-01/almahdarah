// HTML + plain-text bodies for the student emails. Email clients ignore most
// CSS, so layout uses tables and inline styles. Every piece of user text goes
// through esc() before it is placed in the HTML.

import { longDate } from "@/lib/email/dates";
import type { ClassDayStatus, PlanReminder, TaskGroup, WeeklyDigest } from "@/lib/email/digest";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const C = {
  ink: "#2b2a26",
  text: "#4c4942",
  muted: "#827d72",
  bg: "#ece7dc",
  surface: "#fbf9f3",
  border: "#ddd6c6",
  primary: "#1182a3",
  green: "#3e9e54",
  gold: "#8a6b12",
  goldBg: "#f8ecc2",
  red: "#c0392b",
};

export function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function shortDue(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function shell(opts: {
  preheader: string;
  title: string;
  subtitle: string;
  body: string;
  siteUrl: string;
  cta?: { label: string; href: string };
  // Replaces the "manage these emails" footer, for account-security emails students can't turn off.
  footer?: string;
}): string {
  const manage = `${opts.siteUrl}/student/reminders`;
  const cta = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 0;"><tr><td style="background:${C.primary};border-radius:999px;">
<a href="${esc(opts.cta.href)}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${esc(opts.cta.label)}</a>
</td></tr></table>`
    : "";
  const footer =
    opts.footer ??
    `You are receiving this because you are a student at Al-Mahdrah.<br>
<a href="${esc(manage)}" style="color:${C.primary};">Manage or turn off these emails</a>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Segoe UI,Helvetica,Arial,sans-serif;color:${C.text};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 4px 14px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${C.muted};font-weight:700;">Al-Mahdrah Islamic Academy</td></tr>
<tr><td style="background:${C.surface};border:1px solid ${C.border};border-radius:18px;padding:26px 24px;">
<h1 style="margin:0 0 4px;font-size:22px;line-height:1.25;color:${C.ink};">${esc(opts.title)}</h1>
<p style="margin:0 0 20px;font-size:14px;color:${C.muted};">${esc(opts.subtitle)}</p>
${opts.body}
${cta}
</td></tr>
<tr><td style="padding:16px 8px 0;font-size:12px;line-height:1.6;color:${C.muted};text-align:center;">
${footer}
</td></tr>
</table></td></tr></table></body></html>`;
}

function heading(label: string, color: string = C.muted): string {
  return `<h2 style="margin:22px 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${color};">${esc(label)}</h2>`;
}

function stat(value: string, label: string, color: string = C.ink): string {
  return `<td width="25%" align="center" style="padding:12px 4px;background:#ffffff;border:1px solid ${C.border};border-radius:12px;">
<div style="font-size:22px;font-weight:700;color:${color};line-height:1.1;">${esc(value)}</div>
<div style="margin-top:4px;font-size:11px;color:${C.muted};">${esc(label)}</div></td>`;
}

function taskList(group: TaskGroup, opts: { showDue?: boolean; strike?: boolean } = {}): string {
  const rows = group.lines
    .map((l) => {
      const meta = [l.subject, opts.showDue && l.due ? `due ${shortDue(l.due)}` : null].filter(Boolean).join(" · ");
      const overdue = l.overdue ? ` <span style="color:${C.red};font-weight:700;">overdue</span>` : "";
      return `<tr><td style="padding:7px 0;border-bottom:1px solid ${C.border};font-size:14px;color:${C.ink};">
<span style="${opts.strike ? "text-decoration:line-through;color:" + C.muted : ""}">${esc(l.title)}</span>${overdue}
${meta ? `<div style="font-size:12px;color:${C.muted};">${esc(meta)}</div>` : ""}</td></tr>`;
    })
    .join("");
  const more = group.total > group.lines.length ? `<tr><td style="padding:7px 0;font-size:12px;color:${C.muted};">+ ${group.total - group.lines.length} more</td></tr>` : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}${more}</table>`;
}

function taskListText(group: TaskGroup): string {
  const lines = group.lines.map((l) => `  - ${l.title}${l.subject ? ` (${l.subject})` : ""}${l.overdue ? " - overdue" : ""}`);
  if (group.total > group.lines.length) lines.push(`  + ${group.total - group.lines.length} more`);
  return lines.join("\n");
}

const CLASS_LABEL: Record<ClassDayStatus, { text: string; color: string }> = {
  present: { text: "Attended", color: C.green },
  absent: { text: "Missed", color: C.red },
  cancelled: { text: "Cancelled", color: C.gold },
  upcoming: { text: "Coming up", color: C.muted },
  none: { text: "No class", color: C.muted },
};

function encouragement(d: WeeklyDigest): string {
  const { held, attended, missed } = d.classes;
  if (held > 0 && missed === 0 && attended === held) return "Every class attended. Masha’Allah, keep it going.";
  if (missed > 0) return "A missed class isn’t the end. Sit the next one and begin again.";
  if (d.tasks.doneThisWeek.total > 0) return "Steady effort adds up. Well done on what you finished.";
  return "A new week is a fresh start. Even one small step counts.";
}

export function renderWeeklyDigest(d: WeeklyDigest, siteUrl: string): RenderedEmail {
  const { classes, tasks } = d;
  const title = d.inProgress ? `Your week so far, ${d.firstName}` : `Your week, ${d.firstName}`;
  const subject = d.inProgress ? `Your week so far · ${d.weekLabel}` : `Your week at Al-Mahdrah · ${d.weekLabel}`;

  const classRows = classes.days
    .map((day) => {
      const s = CLASS_LABEL[day.status];
      return `<tr><td style="padding:7px 0;border-bottom:1px solid ${C.border};font-size:14px;color:${C.ink};">${day.day}${day.subject ? `<span style="color:${C.muted};"> · ${esc(day.subject)}</span>` : ""}</td>
<td align="right" style="padding:7px 0;border-bottom:1px solid ${C.border};font-size:13px;font-weight:700;color:${s.color};">${s.text}</td></tr>`;
    })
    .join("");

  const sections: string[] = [];
  if (tasks.doneThisWeek.total) sections.push(heading(`Done this week · ${tasks.doneThisWeek.total}`, C.green) + taskList(tasks.doneThisWeek, { strike: true }));
  if (tasks.inProgress.total) sections.push(heading(`In progress · ${tasks.inProgress.total}`, C.primary) + taskList(tasks.inProgress, { showDue: true }));
  if (tasks.todo.total) sections.push(heading(`Still to do · ${tasks.todo.total}`) + taskList(tasks.todo, { showDue: true }));
  if (!sections.length) sections.push(`<p style="margin:8px 0 0;font-size:14px;color:${C.muted};">No tasks right now. Add your own in the portal to plan your week.</p>`);

  const overdue = tasks.overdueCount
    ? `<p style="margin:14px 0 0;padding:10px 12px;background:${C.goldBg};border-radius:10px;font-size:13px;color:${C.gold};font-weight:700;">${tasks.overdueCount} ${tasks.overdueCount === 1 ? "task is" : "tasks are"} overdue.</p>`
    : "";

  const body = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="6" style="margin:0 -6px;"><tr>
${stat(`${classes.attended}/${classes.held}`, "classes attended", C.primary)}
${stat(String(tasks.doneThisWeek.total), "tasks done", C.green)}
${stat(String(tasks.inProgress.total), "in progress")}
${stat(String(d.streak), d.streak === 1 ? "week streak" : "weeks streak", C.gold)}
</tr></table>
${heading("Classes")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${classRows}</table>
${sections.join("")}
${overdue}
<p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:${C.text};">${esc(encouragement(d))}</p>`;

  const text = [
    `Assalamu alaikum, ${d.firstName}`,
    ``,
    `${d.inProgress ? "Your week so far" : "Your week"} (${d.weekLabel})`,
    ``,
    `CLASSES: attended ${classes.attended} of ${classes.held}${classes.missed ? `, missed ${classes.missed}` : ""}`,
    ...classes.days.map((x) => `  ${x.day}: ${CLASS_LABEL[x.status].text}${x.subject ? ` (${x.subject})` : ""}`),
    `Streak: ${d.streak} ${d.streak === 1 ? "week" : "weeks"}`,
    ``,
    `TASKS`,
    tasks.doneThisWeek.total ? `Done this week (${tasks.doneThisWeek.total}):\n${taskListText(tasks.doneThisWeek)}` : "",
    tasks.inProgress.total ? `In progress (${tasks.inProgress.total}):\n${taskListText(tasks.inProgress)}` : "",
    tasks.todo.total ? `Still to do (${tasks.todo.total}):\n${taskListText(tasks.todo)}` : "",
    tasks.overdueCount ? `Overdue: ${tasks.overdueCount}` : "",
    ``,
    encouragement(d),
    ``,
    `Open your dashboard: ${siteUrl}/student`,
    `Manage these emails: ${siteUrl}/student/reminders`,
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  return {
    subject,
    html: shell({
      preheader: `${classes.attended} of ${classes.held} classes attended · ${tasks.doneThisWeek.total} tasks done`,
      title,
      subtitle: `Progress for ${d.weekLabel}`,
      body,
      siteUrl,
      cta: { label: "Open your dashboard", href: `${siteUrl}/student` },
    }),
    text,
  };
}

export function renderPlanReminder(r: PlanReminder, siteUrl: string): RenderedEmail {
  const date = longDate(r.todayIso);
  const sections: string[] = [];
  if (r.today.total) sections.push(heading(`Planned for today · ${r.today.total}`, C.primary) + taskList(r.today, { showDue: true }));
  if (r.missed.total) sections.push(heading(`Not finished yet · ${r.missed.total}`, C.gold) + taskList(r.missed, { showDue: true }));
  if (!sections.length) {
    sections.push(`<p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:${C.text};">You have nothing planned for today. Open your weekly plan and choose what to work on.</p>`);
  }

  const body = sections.join("") +
    `<p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:${C.text};">${
      r.today.total ? "Start with the first one. Small steps, done consistently." : "Pick one small thing to start with."
    }</p>`;

  const text = [
    `Assalamu alaikum, ${r.firstName}`,
    ``,
    `Your plan for ${date}`,
    ``,
    r.today.total ? `Planned for today (${r.today.total}):\n${taskListText(r.today)}` : "Nothing planned for today.",
    r.missed.total ? `\nNot finished yet (${r.missed.total}):\n${taskListText(r.missed)}` : "",
    ``,
    `Open your weekly plan: ${siteUrl}/student/tasks`,
    `Manage these emails: ${siteUrl}/student/reminders`,
  ].join("\n");

  return {
    subject: `Your plan for today · ${date}`,
    html: shell({
      preheader: r.today.total ? `${r.today.total} planned for today` : "Nothing planned yet for today",
      title: `Your plan for today`,
      subtitle: `${date}`,
      body,
      siteUrl,
      cta: { label: "Open your weekly plan", href: `${siteUrl}/student/tasks` },
    }),
    text,
  };
}

const SECURITY_FOOTER = "This is an account security email from Al-Mahdrah Islamic Academy. It is sent even if other emails are turned off.";

export function renderPasswordResetCode(code: string, ttlMinutes: number, siteUrl: string): RenderedEmail {
  const body = `
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${C.text};">Use this code to reset your student portal password:</p>
<p style="margin:0;padding:16px 0;background:#ffffff;border:1px solid ${C.border};border-radius:12px;text-align:center;font-family:Consolas,Menlo,monospace;font-size:32px;font-weight:700;letter-spacing:.3em;color:${C.ink};">${esc(code)}</p>
<p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:${C.text};">It expires in ${ttlMinutes} minutes and can only be used once. Never share it with anyone, including staff.</p>
<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:${C.muted};">Didn’t ask for this? You can ignore this email. Your password stays the same.</p>`;

  const text = [
    `Your Al-Mahdrah password reset code: ${code}`,
    ``,
    `It expires in ${ttlMinutes} minutes and can only be used once. Never share it with anyone, including staff.`,
    ``,
    `Didn't ask for this? You can ignore this email. Your password stays the same.`,
    ``,
    `${siteUrl}/student/forgot-password`,
  ].join("\n");

  return {
    subject: `${code} is your Al-Mahdrah password reset code`,
    html: shell({
      preheader: `Your password reset code. It expires in ${ttlMinutes} minutes.`,
      title: "Reset your password",
      subtitle: "Student portal",
      body,
      siteUrl,
      footer: esc(SECURITY_FOOTER),
    }),
    text,
  };
}

export function renderPasswordChanged(username: string, siteUrl: string): RenderedEmail {
  const body = `
<p style="margin:0;font-size:14px;line-height:1.6;color:${C.text};">The password for your student portal account <strong style="color:${C.ink};">${esc(username)}</strong> was just changed, and you were signed out on every other device.</p>
<p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:${C.text};">If this wasn’t you, reset your password again straight away and tell your class teacher.</p>`;

  const text = [
    `The password for your Al-Mahdrah student portal account "${username}" was just changed, and you were signed out on every other device.`,
    ``,
    `If this wasn't you, reset your password again straight away and tell your class teacher:`,
    `${siteUrl}/student/forgot-password`,
  ].join("\n");

  return {
    subject: "Your Al-Mahdrah password was changed",
    html: shell({
      preheader: "Your student portal password was changed.",
      title: "Password changed",
      subtitle: "Student portal",
      body,
      siteUrl,
      cta: { label: "Sign in", href: `${siteUrl}/student/login` },
      footer: esc(SECURITY_FOOTER),
    }),
    text,
  };
}

// Sign-in details for a new student: sent when a join request is accepted, and again
// from the admin Students panel ("Send welcome email") until they first sign in.
export function renderAccountApproved(opts: { name: string; username: string; password: string; siteUrl: string }): RenderedEmail {
  const firstName = opts.name.trim().split(/\s+/)[0] || opts.name;
  const loginUrl = `${opts.siteUrl}/student/login`;
  const detail = (label: string, value: string) =>
    `<tr><td style="padding:10px 14px;border-bottom:1px solid ${C.border};font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${C.muted};font-weight:700;width:110px;">${esc(label)}</td>
<td style="padding:10px 14px;border-bottom:1px solid ${C.border};font-family:Consolas,Menlo,monospace;font-size:15px;font-weight:700;color:${C.ink};">${esc(value)}</td></tr>`;
  const passwordValue = opts.password;

  const body = `
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${C.text};">Assalamu alaikum ${esc(firstName)}, your Al-Mahdrah student portal account is ready. You can sign in now with these details:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid ${C.border};border-radius:12px;border-collapse:separate;overflow:hidden;">
${detail("Username", opts.username)}
${detail("Password", passwordValue)}
</table>
<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:${C.muted};">Usernames are all lowercase. The password is case-sensitive, so type it exactly as shown.</p>
<p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:${C.text};">Keep this email private and never share your password with anyone. You can change it at any time with “Forgot password?” on the sign-in page.</p>`;

  const text = [
    `Assalamu alaikum ${firstName},`,
    ``,
    `Your Al-Mahdrah student portal account is ready. You can sign in now with these details:`,
    ``,
    `Username: ${opts.username}`,
    `Password: ${passwordValue}`,
    ``,
    `Usernames are all lowercase. The password is case-sensitive, so type it exactly as shown.`,
    ``,
    `Sign in: ${loginUrl}`,
    ``,
    `Keep this email private and never share your password with anyone. You can change it at any time with "Forgot password?" on the sign-in page.`,
  ].join("\n");

  return {
    subject: "Welcome to Al-Mahdrah: your student portal account is ready",
    html: shell({
      preheader: "Your student portal account is ready. Here are your sign-in details.",
      title: "Your account is ready",
      subtitle: "Student portal",
      body,
      siteUrl: opts.siteUrl,
      cta: { label: "Sign in to the portal", href: loginUrl },
      footer: esc(SECURITY_FOOTER),
    }),
    text,
  };
}
