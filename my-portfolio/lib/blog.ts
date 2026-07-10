// lib/blog.ts
// Build-time blog loader. Reads markdown files from content/blog/*.md, parses
// their frontmatter, and exposes a typed API to the blog pages. Runs only in
// server components at build time (SSG) — no runtime filesystem access.

import fs from "node:fs";
import path from "node:path";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date string
  tags: string[];
  content: string; // markdown body
  readingTime: number; // minutes
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Minimal YAML-frontmatter parser for the constrained subset we use:
 * `key: value` pairs, quoted/unquoted strings, booleans, inline arrays
 * (`[a, b]`), and block arrays (`- item` lines). Not a general YAML parser.
 */
type Frontmatter = Record<string, string | boolean | string[]>;

function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: normalized };
  }

  const [, fmBlock, body] = match;
  const data: Frontmatter = {};
  const lines = fmBlock.split("\n");

  let currentListKey: string | null = null;

  for (const line of lines) {
    if (line.trim() === "") continue;

    // Block-array item: "  - value"
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      (data[currentListKey] as string[]).push(stripQuotes(listItem[1].trim()));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const rawValue = kv[2].trim();

    if (rawValue === "") {
      // Start of a block array (items follow on subsequent lines)
      data[key] = [];
      currentListKey = key;
      continue;
    }

    currentListKey = null;

    // Inline array: [a, b, c]
    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      const inner = rawValue.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(",").map((s) => stripQuotes(s.trim())).filter(Boolean)
        : [];
      continue;
    }

    // Boolean
    if (rawValue === "true" || rawValue === "false") {
      data[key] = rawValue === "true";
      continue;
    }

    data[key] = stripQuotes(rawValue);
  }

  return { data, body: body ?? "" };
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function computeReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function toStringArray(value: string | boolean | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];
  return [];
}

function readPost(fileName: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);

  // Respect an explicit opt-out even if a file lands here.
  if (data.publish === false || data.draft === true) return null;

  const slug =
    (typeof data.slug === "string" && data.slug) ||
    fileName.replace(/\.md$/, "");
  const title = typeof data.title === "string" ? data.title : slug;
  const description =
    typeof data.description === "string" ? data.description : "";
  const date = typeof data.date === "string" ? data.date : "1970-01-01";

  return {
    slug,
    title,
    description,
    date,
    tags: toStringArray(data.tags),
    content: body.trim(),
    readingTime: computeReadingTime(body),
  };
}

/** All published posts, newest first. */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readPost)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** A single published post by slug, or undefined. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Slugs for generateStaticParams. */
export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
