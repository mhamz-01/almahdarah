import type { Testimonial, TrustStat } from "@/lib/types";

export const trustStats: TrustStat[] = [
  { value: "2,000+", label: "students taught" },
  { value: "30+", label: "countries reached" },
  { value: "95%", label: "continue after demo" },
  { value: "4.9★", label: "average rating" },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "My two children look forward to every class. The teachers are patient, the curriculum is authentic, and the free demo made it completely risk-free to begin. Al-Mahdrah has become part of our family routine.",
    name: "Umm Abdullah",
    role: "Homeschooling parent · Lahore, Pakistan",
    accent: "navy",
    featured: true,
  },
  {
    quote:
      "I started with zero Arabic. Six months later I'm reading the Qur'an with proper tajwīd. The 1:1 attention made all the difference.",
    name: "Bilal R.",
    role: "Adult learner · UK",
    accent: "primary",
  },
  {
    quote:
      "The Aqīdah course gave my teenager clarity and confidence in her deen. Exactly the grounding we were searching for.",
    name: "Fatima S.",
    role: "Parent · Canada",
    accent: "primary-2",
  },
  {
    quote:
      "Authentic teaching upon the understanding of the Sahabah — and the free demo proved the quality before we committed. Truly trustworthy.",
    name: "Yusuf A.",
    role: "Parent · UAE",
    accent: "gold",
  },
];
