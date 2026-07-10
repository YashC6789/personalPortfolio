# Working on this project from a new computer

Everything you need to clone this repo onto another machine and be fully set up
to develop, write blog posts, and deploy. Follow it top to bottom.

> **The one thing git does NOT bring over:** `.env.local` (it's intentionally
> gitignored). You must recreate it — see [Step 4](#4-create-envlocal). Nothing
> in it is secret, so the exact values are listed below.

---

## 0. What this project is (quick map)

- **Repo:** `github.com/YashC6789/personalPortfolio`. The Next.js app lives in the
  **`my-portfolio/`** subfolder — run all commands from there.
- **Live site:** https://yashkaran.com (Google Cloud Run, region `us-east4`).
- **Deploy:** push to `main` → Cloud Build trigger `deploy-portfolio` → Cloud Run.
- **Blog:** write in Obsidian → `npm run blog:publish` → auto-deploys.
- Full hosting details: [DEPLOYMENT / cloud notes](#8-deploy-reference).
- Blog details: [BLOG_OBSIDIAN.md](BLOG_OBSIDIAN.md).

---

## 1. Install prerequisites

| Tool | Version | Install |
| --- | --- | --- |
| **Node.js** | 20 or newer (Docker build uses Node 20) | https://nodejs.org or `brew install node` |
| **git** | any recent | `brew install git` (or Xcode CLT) |
| **Google Cloud CLI** | recent | https://cloud.google.com/sdk/docs/install or `brew install --cask google-cloud-sdk` |
| **Obsidian** | any | https://obsidian.md (only needed for blogging) |

Verify:
```bash
node -v   # v20+  (v25 is fine)
npm -v
gcloud --version
git --version
```

---

## 2. Clone the repo

```bash
git clone https://github.com/YashC6789/personalPortfolio.git
cd personalPortfolio/my-portfolio
```

All commands from here on run inside `personalPortfolio/my-portfolio`.

---

## 3. Install dependencies

```bash
npm install
```

---

## 4. Create `.env.local`

This file is gitignored, so it won't exist on a fresh clone. Create it at
`my-portfolio/.env.local` with this content:

```bash
# Google Cloud Storage bucket that backs the homepage photo collage.
GCS_BUCKET=rotating_image_collage_bucket
GCS_PREFIX=

# Obsidian blog publishing (used by `npm run blog:publish`).
# Set this to your blog vault's path ON THIS MACHINE (see Step 6).
OBSIDIAN_VAULT_PATH=
OBSIDIAN_BLOG_FOLDER=Blog
```

Notes:
- `GCS_PREFIX` is intentionally **empty** (images live at the bucket root, matching
  production).
- Leave `OBSIDIAN_VAULT_PATH` blank for now; fill it in Step 6.
- None of these are secrets.

---

## 5. Authenticate with Google Cloud

Needed for deploying and for the collage to talk to GCS. Run once per machine:

```bash
gcloud auth login                       # opens a browser; sign in as yashchauhan132017@gmail.com
gcloud config set project burnished-edge-481720-j3
gcloud auth application-default login   # lets local dev read the GCS bucket
```

> The homepage photo collage may still appear empty when running locally even
> after this — that's expected (it depends on the bucket's project billing being
> active for your local credentials). It works correctly in production. Everything
> else on the site renders fine locally without it.

---

## 6. Set up the blog vault

You write posts in an Obsidian vault; the publish script reads from it.

1. **Pick/point to your blog vault.** If it's an **iCloud** vault, it syncs across
   your Macs automatically and the path looks like:
   ```
   ~/Library/Mobile Documents/iCloud~md~obsidian/Documents/<VaultName>
   ```
   If it's a local vault, e.g. `~/Documents/blog-vault`.

2. **Put the full path in `.env.local`:**
   ```bash
   OBSIDIAN_VAULT_PATH=/Users/<you>/path/to/your/blog-vault
   OBSIDIAN_BLOG_FOLDER=Blog
   ```
   - Posts live in the `OBSIDIAN_BLOG_FOLDER` subfolder (default `Blog`).
   - To keep posts at the vault root instead, set `OBSIDIAN_BLOG_FOLDER=.`

3. **macOS permission (iCloud vaults only):** the first time you run the publish
   command from **Terminal**, macOS asks to allow access to your iCloud/Documents
   folder — click **Allow**. If it doesn't prompt, enable your terminal under
   **System Settings → Privacy & Security → Full Disk Access**.

4. A copy-ready starter post template lives in the vault's `Blog/` folder as
   `_TEMPLATE.md` (it has `publish: false`, so it never publishes by accident).

---

## 7. Everyday commands

Run from `personalPortfolio/my-portfolio`:

```bash
npm run dev            # local dev server at http://localhost:3000
npm run build          # production build (catches type/build errors)
npm run lint           # lint

npm run blog:preview   # DRY RUN: shows which posts would publish, changes nothing
npm run blog:publish   # transform posts, copy images, commit, push -> auto-deploy
```

### Writing and publishing a post
1. In Obsidian's `Blog/` folder, copy `_TEMPLATE.md` and write your post.
2. Set `publish: true` in its properties when ready.
3. `npm run blog:preview` to sanity-check, then `npm run blog:publish`.
4. ~3 minutes later it's live at https://yashkaran.com.

(iCloud tip: make sure the note is fully downloaded locally — not a cloud
placeholder — before publishing.)

---

## 8. Deploy reference

You rarely touch this directly — pushing to `main` deploys automatically. For
reference:

- **GCP project:** `burnished-edge-481720-j3` (project number 244046110116)
- **Cloud Run service:** `portfolio` in **`us-east4`**
- **Domain:** `yashkaran.com` (DNS at Squarespace; apex A/AAAA records already
  point to Google — verified and cert provisioned)
- **Trigger:** `deploy-portfolio` (us-east4) watches `main`, builds
  `my-portfolio/Dockerfile` per `my-portfolio/cloudbuild.yaml`, deploys to Cloud Run
- **Config:** `min-instances=0` (scale to zero, ~2-4s cold start), `max-instances=2`
  (cost cap), `NEXT_PUBLIC_SITE_URL=https://yashkaran.com` baked in at build time

### Manual deploy (if ever needed)
```bash
git push origin main            # normal path — trigger handles the rest
# or trigger a build by hand:
gcloud builds triggers run deploy-portfolio --branch=main --region=us-east4
```

### Handy checks
```bash
gcloud run services list                                   # see the service
gcloud builds list --region=us-east4 --limit=5             # recent builds
curl -s -o /dev/null -w "%{http_code}\n" https://yashkaran.com/
```

---

## 9. Quick sanity checklist for a fresh machine

- [ ] `node -v` shows 20+
- [ ] `gcloud auth login` + project set + `application-default login` done
- [ ] repo cloned, `npm install` run inside `my-portfolio/`
- [ ] `.env.local` created (Step 4) with `OBSIDIAN_VAULT_PATH` filled in
- [ ] `npm run dev` serves http://localhost:3000
- [ ] `npm run blog:preview` runs without a permissions error (grant iCloud access if prompted)
- [ ] `npm run build` succeeds
