#!/usr/bin/env node
// scripts/publish-blog.mjs
//
// Publishes blog posts written in Obsidian to the portfolio.
//
// Flow: read notes from your Obsidian vault's blog folder → keep only those
// with `publish: true` → transform Obsidian syntax (embeds, wikilinks,
// callouts, comments) into web-safe markdown → copy embedded images into
// public/blog/<slug>/ → write clean markdown to content/blog/<slug>.md →
// git add/commit/push (Cloud Build then auto-deploys).
//
// Usage:
//   npm run blog:publish            # transform, write, commit, push
//   npm run blog:publish -- --dry-run   # show what would happen, touch nothing
//   npm run blog:publish -- --no-push   # write + commit, but don't push
//
// Config (in .env.local at the repo root):
//   OBSIDIAN_VAULT_PATH=/absolute/path/to/your/Vault   (required)
//   OBSIDIAN_BLOG_FOLDER=Blog                           (optional, default "Blog")

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(REPO_ROOT, "content", "blog");
const PUBLIC_BLOG_DIR = path.join(REPO_ROOT, "public", "blog");

const IMAGE_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif",
]);
const LARGE_IMAGE_WARN_BYTES = 500 * 1024;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const NO_PUSH = args.includes("--no-push");

// ---------- small utilities ----------

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function fail(msg) {
  console.error(c.red(`\n✗ ${msg}\n`));
  process.exit(1);
}

function warn(msg) {
  console.warn(c.yellow(`  ⚠ ${msg}`));
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Read KEY=VALUE pairs from .env.local (so the script shares config with Next).
function loadEnvLocal() {
  const envPath = path.join(REPO_ROOT, ".env.local");
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

// ---------- frontmatter ----------

function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: normalized };

  const [, fmBlock, body] = match;
  const data = {};
  let currentListKey = null;

  for (const line of fmBlock.split("\n")) {
    if (line.trim() === "") continue;
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(stripQuotes(listItem[1].trim()));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();
    if (value === "") {
      data[key] = [];
      currentListKey = key;
      continue;
    }
    currentListKey = null;
    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(",").map((s) => stripQuotes(s.trim())).filter(Boolean)
        : [];
    } else if (value === "true" || value === "false") {
      data[key] = value === "true";
    } else {
      data[key] = stripQuotes(value);
    }
  }
  return { data, body: body ?? "" };
}

function stripQuotes(v) {
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function buildFrontmatter({ title, description, date, tags, slug }) {
  const esc = (s) => String(s).replace(/"/g, '\\"');
  const lines = ["---"];
  lines.push(`title: "${esc(title)}"`);
  lines.push(`description: "${esc(description)}"`);
  lines.push(`date: ${date}`);
  lines.push(`tags: [${(tags || []).join(", ")}]`);
  lines.push(`slug: ${slug}`);
  lines.push("publish: true");
  lines.push("---");
  return lines.join("\n");
}

// ---------- vault indexing ----------

// Recursively index every file in the vault by basename so ![[embeds]] resolve
// regardless of the user's attachment-folder configuration.
function indexVault(vaultPath) {
  const byBasename = new Map(); // basename -> [fullPath, ...]
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue; // skip .obsidian, .trash, etc.
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const list = byBasename.get(entry.name) || [];
        list.push(full);
        byBasename.set(entry.name, list);
      }
    }
  };
  walk(vaultPath);
  return byBasename;
}

function resolveAttachment(name, vaultIndex) {
  // Try exact basename, then case-insensitive.
  if (vaultIndex.has(name)) return vaultIndex.get(name);
  const lower = name.toLowerCase();
  for (const [key, paths] of vaultIndex) {
    if (key.toLowerCase() === lower) return paths;
  }
  return [];
}

// ---------- transform ----------

function transform(body, { slug, vaultIndex, publishedTitleToSlug, copyImage }) {
  let out = body;

  // Strip Obsidian %% comments %%
  out = out.replace(/%%[\s\S]*?%%/g, "");

  // Image embeds: ![[file.png]] or ![[file.png|alt]]
  out = out.replace(/!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_m, file, alt) => {
    const name = file.trim();
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      warn(`Embed "${name}" is not an image type — skipping.`);
      return "";
    }
    const matches = resolveAttachment(name, vaultIndex);
    if (matches.length === 0) {
      warn(`Image "${name}" not found in vault — leaving a broken reference.`);
      return `![${alt || ""}](/blog/${slug}/${name})`;
    }
    if (matches.length > 1) {
      warn(`Multiple files named "${name}" in vault; using the first.`);
    }
    const publicName = copyImage(matches[0], name);
    return `![${alt || ""}](/blog/${slug}/${publicName})`;
  });

  // Wikilinks: [[Note]] or [[Note|display]]
  out = out.replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_m, target, display) => {
    const text = (display || target).trim();
    const targetSlug = publishedTitleToSlug.get(target.trim().toLowerCase());
    if (targetSlug) {
      return `[${text}](/blog/${targetSlug})`;
    }
    // Link to an unpublished/private note → render as plain text (no leak).
    return text;
  });

  // Collapse 3+ blank lines
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim() + "\n";
}

// ---------- main ----------

function main() {
  const env = { ...loadEnvLocal(), ...process.env };
  const vaultPath = env.OBSIDIAN_VAULT_PATH;
  const blogFolder = env.OBSIDIAN_BLOG_FOLDER || "Blog";

  console.log(c.bold("\n📝 Obsidian → Portfolio blog publish\n"));
  if (DRY_RUN) console.log(c.cyan("   (dry run — nothing will be written)\n"));

  if (!vaultPath) {
    fail(
      "OBSIDIAN_VAULT_PATH is not set.\n" +
        "  Add it to .env.local, e.g.:\n" +
        "    OBSIDIAN_VAULT_PATH=/Users/you/Documents/MyVault\n" +
        `    OBSIDIAN_BLOG_FOLDER=Blog   (optional, default "Blog")`
    );
  }
  const blogDir = path.join(vaultPath, blogFolder);
  if (!fs.existsSync(blogDir)) {
    fail(`Blog folder not found: ${blogDir}\n  Check OBSIDIAN_VAULT_PATH / OBSIDIAN_BLOG_FOLDER.`);
  }

  console.log(c.dim(`   Vault:  ${vaultPath}`));
  console.log(c.dim(`   Folder: ${blogFolder}\n`));

  const vaultIndex = indexVault(vaultPath);

  // First pass: parse all notes, decide which are published, build the
  // title→slug map so wikilinks between posts resolve.
  const noteFiles = fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".md"));

  const parsed = [];
  for (const file of noteFiles) {
    const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    parsed.push({ file, data, body });
  }

  const publishable = parsed.filter((p) => p.data.publish === true);
  const skipped = parsed.filter((p) => p.data.publish !== true);

  if (publishable.length === 0) {
    console.log(c.yellow("No notes with `publish: true` found. Nothing to do.\n"));
    if (skipped.length > 0) {
      console.log(c.dim(`   (${skipped.length} note(s) without publish: true were skipped)`));
    }
    return;
  }

  // Seed the title→slug map with already-published posts so wikilinks can
  // resolve to posts that aren't part of this publish batch.
  const publishedTitleToSlug = new Map();
  if (fs.existsSync(CONTENT_DIR)) {
    for (const f of fs.readdirSync(CONTENT_DIR).filter((n) => n.endsWith(".md"))) {
      const { data } = parseFrontmatter(fs.readFileSync(path.join(CONTENT_DIR, f), "utf8"));
      const existingSlug = data.slug || f.replace(/\.md$/, "");
      if (data.title) {
        publishedTitleToSlug.set(String(data.title).toLowerCase().trim(), existingSlug);
      }
      publishedTitleToSlug.set(f.replace(/\.md$/, "").toLowerCase().trim(), existingSlug);
      publishedTitleToSlug.set(String(existingSlug).toLowerCase().trim(), existingSlug);
    }
  }

  // Validate + resolve slugs
  const posts = [];
  const seenSlugs = new Set();

  for (const p of publishable) {
    const title = p.data.title;
    if (!title) {
      warn(`${p.file}: missing "title" — skipping.`);
      continue;
    }
    if (!p.data.date) {
      warn(`${p.file}: missing "date" — skipping.`);
      continue;
    }
    const slug = p.data.slug || slugify(p.file.replace(/\.md$/, ""));
    if (seenSlugs.has(slug)) {
      warn(`Duplicate slug "${slug}" (${p.file}) — skipping.`);
      continue;
    }
    seenSlugs.add(slug);
    publishedTitleToSlug.set(String(title).toLowerCase().trim(), slug);
    publishedTitleToSlug.set(p.file.replace(/\.md$/, "").toLowerCase().trim(), slug);
    posts.push({ ...p, slug, title });
  }

  // Second pass: transform + write
  const written = [];
  for (const post of posts) {
    const { slug, title, data, body } = post;
    const imagesCopied = [];

    const copyImage = (srcPath, name) => {
      const destDir = path.join(PUBLIC_BLOG_DIR, slug);
      const destPath = path.join(destDir, name);
      const size = fs.statSync(srcPath).size;
      if (size > LARGE_IMAGE_WARN_BYTES) {
        warn(`${name} is ${(size / 1024).toFixed(0)}KB — consider resizing.`);
      }
      if (!DRY_RUN) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcPath, destPath);
      }
      imagesCopied.push(name);
      return name;
    };

    const transformed = transform(body, {
      slug,
      vaultIndex,
      publishedTitleToSlug,
      copyImage,
    });

    const frontmatter = buildFrontmatter({
      title,
      description: data.description || "",
      date: data.date,
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      slug,
    });

    const outPath = path.join(CONTENT_DIR, `${slug}.md`);
    const fileContent = `${frontmatter}\n\n${transformed}`;

    if (!DRY_RUN) {
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
      fs.writeFileSync(outPath, fileContent, "utf8");
    }

    written.push({ slug, title, images: imagesCopied.length });
    console.log(
      `   ${c.green("✓")} ${c.bold(title)} ${c.dim(`→ content/blog/${slug}.md`)}` +
        (imagesCopied.length ? c.dim(`  (${imagesCopied.length} image)`) : "")
    );
  }

  console.log("");
  for (const p of skipped) {
    console.log(c.dim(`   – skipped ${p.file} (no publish: true)`));
  }

  if (written.length === 0) {
    console.log(c.yellow("\nNothing valid to publish.\n"));
    return;
  }

  if (DRY_RUN) {
    console.log(c.cyan(`\nDry run complete — ${written.length} post(s) would be published.\n`));
    return;
  }

  // Commit + push
  const titles = written.map((w) => w.title).join(", ");
  try {
    execSync(`git add content/blog public/blog`, { cwd: REPO_ROOT, stdio: "pipe" });
    const status = execSync(`git status --porcelain content/blog public/blog`, {
      cwd: REPO_ROOT,
    }).toString().trim();
    if (!status) {
      console.log(c.dim("\nNo changes to commit (content already up to date).\n"));
      return;
    }
    execSync(`git commit -m ${JSON.stringify(`blog: publish ${titles}`)}`, {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
    console.log(c.green(`\n✓ Committed: blog: publish ${titles}`));

    if (NO_PUSH) {
      console.log(c.dim("  (--no-push set; run `git push` when ready)\n"));
      return;
    }
    execSync(`git push`, { cwd: REPO_ROOT, stdio: "pipe" });
    console.log(c.green("✓ Pushed — Cloud Build will deploy shortly.\n"));
  } catch (err) {
    fail(`git step failed: ${err.message}`);
  }
}

main();
