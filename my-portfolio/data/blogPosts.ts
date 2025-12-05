// data/blogPosts.ts

export type BlogPost = {
    slug: string;
    title: string;
    description: string;
    date: string;       // ISO string or simple text
    tags?: string[];
    content: string;    // simple text/markdown for now
  };
  
  export const blogPosts: BlogPost[] = [
    {
      slug: "why-i-built-this-portfolio",
      title: "Why I Built This Portfolio",
      description: "A quick story about building my personal website and what I learned.",
      date: "2025-12-01",
      tags: ["portfolio", "next.js", "tailwind"],
      content: `
  I wanted a single place to show who I am as a developer, a student, and a person.
  
  This portfolio started out as a playground to learn modern React, Next.js, Tailwind, and some fun UI like glassmorphism and motion.
  
  Along the way I realized:
  - It’s a great way to practice good design.
  - It forces me to polish how I talk about my work.
  - It’s a living artifact I can keep improving over time.
  
  In this post I talk about some of the design decisions, the tech stack, and where I want to take it next.
      `,
    },
    {
      slug: "recent-projects-im-proud-of",
      title: "Recent Projects I’m Proud Of",
      description: "A highlight reel of recent projects and what I focused on in each.",
      date: "2025-11-20",
      tags: ["projects", "learning"],
      content: `
  Here are a few projects that taught me the most recently.
  
  I talk about:
  - What the project was.
  - The hardest technical problem.
  - What I would do differently if I rebuilt it today.
      `,
    },
    {
      slug: "things-im-learning-right-now",
      title: "Things I’m Learning Right Now",
      description: "Some notes on what I’m currently studying and experimenting with.",
      date: "2025-11-05",
      tags: ["learning", "growth"],
      content: `
  Learning never really stops, but I like to be intentional about it.
  
  In this post I go over what I'm:
  - Reading
  - Building
  - Trying to understand more deeply
  
  And how it all connects back to where I want to go.
      `,
    },
  ];