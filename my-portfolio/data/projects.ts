// data/projects.ts
// Single source of truth for projects. The homepage grid renders all of them
// as tiles (with a modal); the /projects page renders `featured` ones as full
// case studies. Edit here to update both views.

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  title: string;
  // Short tech/role line, e.g. "PyTorch · Adversarial ML"
  tagline: string;
  // One-sentence summary for grid tiles
  summary: string;
  // Metric-led headline for the case-study view
  headline: string;
  // Longer description for the modal + case study
  details: string;
  role: string;
  year: string;
  tags: string[];
  image?: string; // e.g. "/projects/fine-tuning.png"
  links?: ProjectLink[];
  featured?: boolean; // show as a full case study on /projects
};

export const projects: Project[] = [
  {
    id: "llm-security-benchmarking",
    title: "LLM Security Benchmarking Platform",
    tagline: "Python · LangChain · Slurm",
    summary:
      "A solo agentic platform benchmarking LLM attacks and defenses across research papers.",
    headline:
      "5 attacks and 3 defenses, benchmarked head-to-head on GT's HPC cluster.",
    details:
      "Developed a solo agentic benchmarking platform (Python, LangChain, Slurm on the Georgia Tech HPC cluster) implementing 5 attacks and 3 defenses drawn from 5 papers. The runs revealed that 2 attacks defeated all defenses while 1 defense failed against basic prompt injection — grounding ongoing research into dynamic ML security defenses.",
    role: "ML Security Research",
    year: "2026",
    tags: ["LangChain", "LLM Security", "Slurm", "Agents"],
    featured: true,
  },
  {
    id: "adversarial-finetuning",
    title: "Fine-tuning on Adversarial Images",
    tagline: "Python · PyTorch",
    summary:
      "GPU-accelerated adversarial fine-tuning that recovers accuracy lost to perturbed inputs.",
    headline: "Recovered 25% robust accuracy on perturbed images with a PGD pipeline.",
    details:
      "Built a PyTorch adversarial fine-tuning pipeline for ResNet50 that recovered accuracy on perturbed images by 25%. Streamed ImageNet-1k through a GPU-accelerated adversarial-robustness pipeline performing 20-step PGD attacks on 5K+ samples.",
    role: "ML Research · Python · PyTorch",
    year: "2025",
    tags: ["PyTorch", "Adversarial ML", "ResNet50", "PGD"],
    image: "/projects/fine-tuning.png",
    featured: true,
  },
  {
    id: "iris-key-derivation-attack",
    title: "Iris Key-Derivation ML Attack",
    tagline: "PyTorch · Stable Diffusion",
    summary:
      "An ML attack testing whether a 105-bit iris key-derivation scheme meets its claimed entropy.",
    headline:
      "Reconstructing authenticating feature vectors to test a 105-bit iris key scheme.",
    details:
      "Designing an ML attack in PyTorch against a 105-bit iris-based key-derivation scheme, exploiting subsample Hamming-distance correlations to reconstruct authenticating feature vectors. Using a Stable Diffusion model evaluated on the IITD and ND iris datasets to test whether the scheme's effective entropy falls below its claimed bound.",
    role: "ML Security Research · Georgia Tech",
    year: "2025",
    tags: ["PyTorch", "Biometrics", "Stable Diffusion", "Security"],
    featured: true,
  },
  {
    id: "llm-groundedness-eval",
    title: "LLM Groundedness Evaluation Pipeline",
    tagline: "AWS Bedrock · LLM-as-a-judge",
    summary:
      "An automated evaluation pipeline that measures and improves LLM answer reliability over SEC filings.",
    headline: "Raised measured groundedness to 95% across 1,200 chats over dense SEC filings.",
    details:
      "At FINRA, built an automated evaluation pipeline on AWS Bedrock and S3 that scored precision, recall, and used LLM-as-a-judge at the chunk and document level to guide retrieval and prompt improvements — raising measured groundedness to 95% across 1,200 internal chats. Also developed an MCP extension that models task-completion time from live conversation context, quantifying ~8 hrs/wk in productivity gains across 100 users.",
    role: "Graduate AI Engineering Intern · FINRA",
    year: "2026",
    tags: ["AWS Bedrock", "RAG", "Evaluation", "MCP"],
    featured: true,
  },
  {
    id: "dns-data-api",
    title: "DNS Data Automation API",
    tagline: "Spring Boot · Spring Security",
    summary:
      "A secured REST API that turned a multi-hour manual DNS process into sub-5-second responses.",
    headline: "Cut a multi-hour manual DNS process down to sub-5-second automated responses.",
    details:
      "At VeriSign, architected and implemented a Spring Boot RESTful API to automate domain-name data retrieval, enabling engineering teams to fine-tune DNS ML systems and generate performance-analysis reports for latency checks. Integrated Spring Security with a custom login filter and token-based authentication, combined with server-side caching and dynamic rate-limiting.",
    role: "Product Engineering Intern · VeriSign",
    year: "2025",
    tags: ["Spring Boot", "Spring Security", "REST", "Caching"],
    featured: true,
  },
  {
    id: "personal-portfolio",
    title: "Personal Portfolio & Blog",
    tagline: "Next.js · Tailwind · GCP",
    summary:
      "This site — a warm, motion-polished portfolio with a live GCS-backed photo collage.",
    headline: "A warm, motion-polished home for my work, writing, and photos.",
    details:
      "A Next.js 16 and Tailwind v4 portfolio focused on smooth layouts, a warm earthy palette, and dark-mode support. Features a live photo collage streamed from Google Cloud Storage through secured API routes, deployed on Google Cloud Run.",
    role: "Product Design · Frontend",
    year: "2026",
    tags: ["Next.js", "Tailwind CSS", "Framer Motion", "Cloud Run"],
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
