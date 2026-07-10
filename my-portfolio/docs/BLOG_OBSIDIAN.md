# Blogging from Obsidian

Write blog posts in Obsidian, run one command, and they're published to the
portfolio. No CMS, no database — posts are markdown files that get statically
built into pages and served by Cloud Run.

## How it flows

```
Obsidian vault (you write)
  → npm run blog:publish   (transform + copy images + commit + push)
    → Cloud Build trigger   (already configured)
      → content/blog/*.md read at build time → static pages
        → Cloud Run serves them
```

## One-time setup

1. In your Obsidian vault, make a folder for posts (default name: `Blog`).
2. Tell the publish script where your vault is. Edit `.env.local` in the repo:

   ```
   OBSIDIAN_VAULT_PATH=/Users/you/Documents/YourVault
   OBSIDIAN_BLOG_FOLDER=Blog
   ```

   (`OBSIDIAN_BLOG_FOLDER` is optional; defaults to `Blog`.)

## Writing a post

Create a note in your `Blog/` folder. Add these properties (Obsidian shows them
as a Properties panel; in source mode it's YAML frontmatter):

```markdown
---
title: My Post Title
description: One-line summary shown on the blog index and in previews.
date: 2026-07-09
tags: [machine-learning, notes]
publish: true
---

Write your post here in normal markdown.
```

- **`publish: true` is required.** Anything without it is skipped — so drafts and
  private notes never go live by accident.
- `slug` is optional; it defaults to a URL-safe version of the filename.
- `date` controls ordering (newest first) and the displayed date.

### What's supported in the body

| You write | Result |
| --- | --- |
| `# … ####` headings | Styled headings |
| `**bold**`, `*italic*`, `` `code` `` | Inline formatting |
| ` ```lang … ``` ` | Fenced code blocks |
| `- item` / `1. item` | Bullet / numbered lists |
| `> quote` | Blockquote |
| `> [!note] Title` + `>` lines | Callout box |
| `[text](https://…)` | Link |
| `![[image.png]]` | Image — copied into the site automatically |
| `[[Another Post]]` | Links to that post if it's published; otherwise plain text |
| `%% comment %%` | Removed |

Images are found anywhere in your vault by filename, so your Obsidian attachment
settings don't matter. Links to unpublished notes render as plain text, so
private note titles never leak.

## Publishing

From the repo root:

```bash
npm run blog:preview     # dry run — shows what would publish, changes nothing
npm run blog:publish     # transform, copy images, commit, and push (auto-deploys)
```

Useful flags:

```bash
npm run blog:publish -- --no-push    # commit locally but don't push yet
```

After `blog:publish` pushes, Cloud Build rebuilds and deploys automatically.

## Where things land

- Post markdown → `content/blog/<slug>.md`
- Post images → `public/blog/<slug>/<image>` (served at `/blog/<slug>/<image>`)
- Both are committed to the repo, so the deploy is fully self-contained.

## Notes & gotchas

- Editing a published post: just edit the note in Obsidian and run
  `blog:publish` again — it overwrites the generated file.
- Removing a post: set `publish: false` (or delete the note) **and** delete the
  corresponding `content/blog/<slug>.md` — the script doesn't delete files it
  didn't just write.
- Large images: the script warns above ~500KB. Consider resizing before
  publishing to keep the deploy image small.
- An RSS feed is generated automatically at `/rss.xml`.
