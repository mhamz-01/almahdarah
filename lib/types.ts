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
