// data/experience.ts
// Roles + education for the homepage experience strip, sourced from resume.

export type Role = {
  company: string;
  title: string;
  location: string;
  period: string;
  summary: string;
};

export const experience: Role[] = [
  {
    company: "FINRA",
    title: "Graduate AI Engineering Intern",
    location: "Rockville, MD",
    period: "May 2026 – Aug 2026",
    summary:
      "Built an automated LLM evaluation pipeline on AWS Bedrock + S3 that raised measured groundedness to 95% across 1,200 internal chats over dense SEC filings.",
  },
  {
    company: "Georgia Tech",
    title: "ML Security Researcher",
    location: "Atlanta, GA",
    period: "Aug 2025 – Present",
    summary:
      "Designing an ML attack in PyTorch against a 105-bit iris-based key-derivation scheme, and a modular LangChain + Ollama framework that improved reproducibility of attacks and defenses by 3×.",
  },
  {
    company: "VeriSign",
    title: "Product Engineering Intern",
    location: "Reston, VA",
    period: "May 2025 – Aug 2025",
    summary:
      "Architected a Spring Boot REST API with Spring Security and token auth that cut a multi-hour manual DNS data process down to sub-5-second automated responses.",
  },
];

export type Education = {
  school: string;
  degree: string;
  detail: string;
  period: string;
};

export const education: Education[] = [
  {
    school: "Georgia Institute of Technology",
    degree: "M.S. Computer Science — Artificial Intelligence",
    detail: "GPA 4.00",
    period: "Dec 2026",
  },
  {
    school: "Georgia Institute of Technology",
    degree: "B.S. Computer Science — Faculty Honors",
    detail: "GPA 3.96",
    period: "Dec 2025",
  },
];
