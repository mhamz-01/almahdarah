export const FEEDBACK_AREAS = [
  { value: "tasks", label: "Tasks & planner" },
  { value: "schedule", label: "Weekly schedule" },
  { value: "courses", label: "Courses & lessons" },
  { value: "progress", label: "Progress tracking" },
  { value: "notifications", label: "Notifications & emails" },
  { value: "login", label: "Login & account" },
  { value: "design", label: "Design & ease of use" },
  { value: "other", label: "Something else" },
] as const;

export const FEEDBACK_RATINGS = [
  { value: 1, emoji: "😞", label: "Poor" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
] as const;

export interface FeedbackPayload {
  rating: number;
  areas: string[];
  message: string;
}
