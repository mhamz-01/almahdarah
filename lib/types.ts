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
  index: string;
  category: string;
  title: string;
  description: string;
  meta: string[];
  accent: AccentToken;
  popular?: boolean;
}

export interface FreeCourse {
  glyph: string;
  title: string;
  description: string;
  duration: string;
  accent: AccentToken;
}

export interface FacultyMember {
  name: string;
  subject: string;
  bio: string;
  accent: AccentToken;
}

export interface BlogPost {
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  accent: AccentToken;
}
