// data/site.ts
// Single source of truth for identity, navigation, and links.
// Update values here and every component/page picks them up.

export const site = {
  name: "Yashkaran Chauhan",
  shortName: "Yash",
  role: "AI/ML Engineer & Researcher",
  location: "Atlanta, GA",
  // Friendly one-liner used in hero + footer + metadata
  tagline:
    "I build AI systems and probe how they break — from LLM evaluation pipelines to adversarial machine-learning research.",
  email: "yashchauhan132017@gmail.com",
  resumePath: "/resume.pdf",
  // Optional hero photo. Drop a file at public/me/avatar.jpg and it appears
  // automatically; until then a designed placeholder renders in its place.
  avatar: "/me/avatar.jpg",
  socials: {
    github: "https://github.com/YashC6789",
    linkedin: "https://www.linkedin.com/in/yashc1/",
  },
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/projects" },
  { label: "Interests", href: "/interests" },
  { label: "Resume", href: "/resume" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
