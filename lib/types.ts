export type AccentToken = "primary" | "primary-2" | "navy" | "green" | "gold";

export interface NavLink {
  label: string;
  href: string;
}

export interface VisionPillar {
  number: string;
  title: string;
  description: string;
  accent: AccentToken;
}

export interface TrustStat {
  value: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  accent: AccentToken;
  featured?: boolean;
}

export interface MentoredCourse {
  slug: string;
  index: string;
  category: string;
  title: string;
  description: string;
  meta: string[];
  accent: AccentToken;
  popular?: boolean;
}

export interface FreeCourse {
  slug: string;
  glyph: string;
  title: string;
  description: string;
  duration: string;
  schedule: string;
  accent: AccentToken;
  live?: boolean;
}

export interface FacultyMember {
  slug: string;
  name: string;
  subject: string;
  bio: string;
  accent: AccentToken;
}

export interface FacultySpecialty {
  icon: string;
  title: string;
  text: string;
}

export interface BookingFormState {
  name: string;
  phone: string;
  email: string;
  country: string;
  ageGroup: string;
  course: string;
  notes: string;
}

export interface JoinCommunityFormState {
  name: string;
  age: string;
  contact: string;
  message: string;
  courseTitle: string;
}

export type ReviewerType = "parent" | "student";

export interface ReviewFormState {
  reviewerType: ReviewerType | "";
  name: string;
  country: string;
  city: string;
  rating: number;
  reviewText: string;
}

export type LeadSource = "demo_booking" | "free_course";

export interface LeadRow {
  id: string;
  created_at: string;
  source: LeadSource;
  name: string;
  phone: string | null;
  email: string | null;
  details: Record<string, unknown>;
}

export interface ReviewRow {
  id: string;
  created_at: string;
  reviewer_type: ReviewerType;
  name: string;
  country: string;
  city: string;
  rating: number;
  review_text: string;
  approved: boolean;
}

export interface FacultyProfile {
  slug: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  credentials: string[];
  specialties: FacultySpecialty[];
  courseSlugs: string[];
  accent: AccentToken;
}

export interface BlogPost {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  accent: AccentToken;
}

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export interface ArticleDetail {
  slug: string;
  tag: string;
  title: string;
  subtitle: string;
  authorName: string;
  authorRole: string;
  date: string;
  readTime: string;
  coverGlyph: string;
  accent: AccentToken;
  body: ArticleBlock[];
  closingNote: string;
  authorBio: string;
}

export interface CourseModule {
  title: string;
  meta: string;
  lessons: string[];
}

export interface CourseFaq {
  q: string;
  a: string;
}

export interface CourseLogisticsRow {
  label: string;
  value: string;
}

export interface CourseStep {
  num: string;
  title: string;
  text: string;
}

export interface CourseTestimonial {
  quote: string;
  name: string;
  role: string;
  accent: AccentToken;
}

export interface CourseDetail {
  slug: string;
  type: "paid" | "free";
  category: string;
  title: string;
  subtitle: string;
  rating: string;
  studentsLine: string;
  levelLine: string;
  teacherName: string;
  teacherRole: string;
  teacherBio: string;
  teacherQuote: string;
  heroQuote: string;
  heroQuoteSource: string;
  durationLine: string;
  statStudents: string;
  statCountries?: string;
  statCompletion?: string;
  formatLine?: string;
  accent: AccentToken;
  outcomes: string[];
  modules: CourseModule[];
  logistics: CourseLogisticsRow[];
  audience: string[];
  testimonials: CourseTestimonial[];
  ctaHeadline: string;
  ctaSub: string;
  steps: CourseStep[];
  faqs: CourseFaq[];
}

export interface QuoteEntry {
  id: number;
  topicKey: string;
  type: "quote" | "passage";
  title?: string;
  text: string;
  author: string;
  publishedAt: string | null;
}

export interface QuoteRow {
  id: number;
  created_at: string;
  published_at: string | null;
  topic_key: string;
  kind: "quote" | "passage";
  title: string | null;
  body: string;
  author: string;
  published: boolean;
}

export interface QuoteInsert {
  topic_key: string;
  kind: "quote" | "passage";
  title: string | null;
  body: string;
  author: string;
  published: boolean;
}

export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
export type SlotStatus = "scheduled" | "cancelled" | "rescheduled";

export interface ClassScheduleRow {
  id: number;
  day: Weekday;
  subject: string;
  start_time: string;
  duration: string;
  teacher: string;
  color: string;
  status: SlotStatus;
  note: string;
  sort_order: number;
  updated_at: string;
  published_at: string | null;
}

export interface ClassScheduleUpdate {
  subject?: string;
  start_time?: string;
  duration?: string;
  teacher?: string;
  status?: SlotStatus;
  note?: string;
}

export interface ClassScheduleInsert {
  day: Weekday;
  subject: string;
  start_time: string;
  duration: string;
  teacher: string;
  color: string;
  status: SlotStatus;
  note: string;
}

export interface StudentRow {
  id: number;
  created_at: string;
  name: string;
  username: string;
  avatar_color: string;
  email: string | null;
  phone: string | null;
  approved_at: string;
  first_login_at: string | null;
}

export interface StudentInsert {
  name: string;
  username: string;
  avatar_color: string;
}

export type AttendanceStatus = "present" | "absent";

export interface AttendanceRow {
  id: number;
  student_id: number;
  class_date: string;
  day: Weekday;
  status: AttendanceStatus;
  created_at: string;
}

export interface StudentNoteInsert {
  student_id: number;
  body: string;
}

export interface AttendanceCell {
  day: Weekday;
  status: AttendanceStatus | null;
}

export interface AttendanceWeek {
  range: string;
  startDate: string;
  cells: AttendanceCell[];
}

export interface StudentWithStats extends StudentRow {
  streak: number;
  missedTotal: number;
  attendedThisWeek: number;
  lastMissed: string;
  weeks: AttendanceWeek[];
}

// Full DB row, including auth fields — never pass this to a client
// component as-is. Used only inside login/credential-generation routes.
export interface StudentAuthRow extends StudentRow {
  password_hash: string | null;
  password_enc: string | null;
  last_login_at: string | null;
}

// Client-safe login status, derived server-side from StudentAuthRow.
export interface StudentWithLoginStatus extends StudentWithStats {
  hasLogin: boolean;
  // Decrypted server-side for the admin panel only. Null when the login
  // predates viewable passwords (hash only) or can't be decrypted.
  password: string | null;
  lastLoginAt: string | null;
}

export interface StudentNoteRow {
  id: number;
  student_id: number;
  body: string;
  created_at: string;
  read: boolean;
}

export interface TaskRow {
  id: number;
  created_at: string;
  subject: string;
  title: string;
  description: string;
  due_date: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
}

export interface TaskInsert {
  subject: string;
  title: string;
  description: string;
  due_date: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
}

export type TaskUpdate = Partial<TaskInsert>;

export interface StudentTaskAttachment {
  url: string;
  name: string;
  path: string;
}

export interface StudentTaskRow {
  id: number;
  student_id: number;
  created_at: string;
  subject: string | null;
  title: string;
  description: string;
  due_date: string | null;
  planned_date: string | null;
  completed: boolean;
  completed_at: string | null;
  /** The student's own running notes on the task (separate from the description). */
  notes: string;
  attachments: StudentTaskAttachment[];
}

export interface StudentEmailPrefsRow {
  student_id: number;
  weekly_digest: boolean;
  plan_reminder: boolean;
  /** ISO weekdays, 1 = Monday ... 7 = Sunday. */
  reminder_days: number[];
  last_digest_sent_on: string | null;
  last_reminder_sent_on: string | null;
  last_test_at: string | null;
  updated_at: string;
}

export type BoardStatus = "todo" | "in_progress" | "done";

export interface BoardCardRow {
  id: number;
  student_id: number;
  personal_task_id: number | null;
  assigned_task_id: number | null;
  status: BoardStatus;
  created_at: string;
  moved_at: string;
}

export type StudentRequestStatus = "pending" | "accepted" | "rejected";

// Full DB row — password_hash / password_enc must never reach the client.
export interface StudentRequestRow {
  id: number;
  created_at: string;
  name: string;
  username: string;
  password_hash: string;
  password_enc: string;
  email: string | null;
  phone: string | null;
  time_at_almahdrah: string;
  expectations: string;
  status: StudentRequestStatus;
  reviewed_at: string | null;
  student_id: number | null;
}

// Client-safe view of a request, including the password the applicant chose
// (decrypted server-side) so the admin can see exactly what they'd be approving.
export interface StudentRequestView {
  id: number;
  created_at: string;
  name: string;
  username: string;
  password: string | null;
  email: string | null;
  phone: string | null;
  time_at_almahdrah: string;
  expectations: string;
  status: StudentRequestStatus;
  reviewed_at: string | null;
}

export interface CourseRow {
  id: number;
  created_at: string;
  title: string;
  description: string;
  instructor: string;
  youtube_playlist_id: string | null;
  thumbnail_url: string | null;
  sort_order: number;
  published: boolean;
}

export interface CourseLessonRow {
  id: number;
  course_id: number;
  position: number;
  title: string;
  youtube_video_id: string;
  duration_seconds: number | null;
  created_at: string;
}

export type LessonNoteStatus = "transcribing" | "composing" | "ready" | "failed";

export interface LessonNoteRow {
  lesson_id: number;
  status: LessonNoteStatus;
  segments_total: number;
  error: string | null;
  draft_md: string | null;
  published_md: string | null;
  generated_at: string | null;
  published_at: string | null;
  has_unpublished_changes: boolean;
  updated_at: string;
}

export interface LessonTranscriptSegmentRow {
  lesson_id: number;
  idx: number;
  start_seconds: number;
  end_seconds: number;
  text: string;
  created_at: string;
}

export interface LessonProgressRow {
  student_id: number;
  lesson_id: number;
  last_position_seconds: number;
  completed: boolean;
  updated_at: string;
}
