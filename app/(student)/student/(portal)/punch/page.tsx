import { redirect } from "next/navigation";

// Punching in now lives on the Attendance page (today's card at the top).
export default function StudentPunchPage() {
  redirect("/student/attendance");
}
