# Personal Portfolio

A modern, dynamic portfolio website built with Next.js and deployed on Google Cloud Run.

## Features

- 🎨 Modern, responsive design
- 📝 Blog section
- 💼 Projects showcase
- 📄 Resume/CV page
- 📸 Rotating image collage with images from Google Cloud Storage
- 🚀 Automatic deployment via GitHub CI/CD

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Deployment**: Google Cloud Run
- **CI/CD**: Google Cloud Build with GitHub integration
- **Storage**: Google Cloud Storage (for images)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Cloud account with a project set up
- `gcloud` CLI installed and configured

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/personalPortfolio.git
   cd personalPortfolio/my-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Image Collage Setup (Local)

For local development with the image collage feature:

1. **Authenticate with Google Cloud** (REQUIRED):
   ```bash
   gcloud auth application-default login
   ```
   ⚠️ **Important:** You must do this before running `npm run dev`, otherwise you'll get a "Could not load the default credentials" error.

2. Create `.env.local`:
   ```bash
   GCS_BUCKET=rotating_image_collage_bucket
   GCS_PREFIX=collage/
   ```

## Deployment

### Quick Deploy

The easiest way to deploy is using the automated scripts:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy to Cloud Run
./scripts/deploy-cloud-run.sh SERVICE_NAME PROJECT_ID REGION
```

### Automatic Deployment (CI/CD)

The repository is configured for automatic deployment via GitHub:

1. Push to the `main` branch
2. Cloud Build automatically builds and deploys to Cloud Run
3. Your site is updated automatically!

See [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) for detailed setup instructions.

## Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete deployment instructions
- **[GitHub CI/CD Setup](docs/GITHUB_SETUP.md)** - Setting up automatic deployments
- **[Image Setup Guide](docs/IMAGE_SETUP.md)** - **NEW!** Upload images and fix "failed to fetch manifest" error
- **[Image Collage Setup](docs/COLLAGE_SETUP.md)** - Configuring the image collage feature
- **[Image Collage Quick Start](docs/README_COLLAGE.md)** - Quick reference for image collage

## Project Structure

```
my-portfolio/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── [pages]/           # Page routes
├── components/            # React components
├── data/                  # Data files
├── public/                # Static assets
├── scripts/               # Deployment and setup scripts
├── docs/                  # Documentation
├── cloudbuild.yaml        # Cloud Build configuration
├── Dockerfile            # Docker image configuration
└── package.json          # Dependencies
```

## Scripts

All deployment and setup scripts are located in the `scripts/` directory:

- `deploy-cloud-run.sh` - Deploy to Google Cloud Run
- `upload-images-to-gcs.sh` - **NEW!** Upload images from `public/me/` to GCS bucket
- `setup-github-trigger.sh` - Set up GitHub CI/CD trigger
- `setup-permissions.sh` - Grant required IAM permissions
- `setup-collage-iam.sh` - Set up image collage permissions
- `check-deployment.sh` - Verify deployment status

### Quick Fix for "Failed to fetch collage manifest"

If you're seeing this error, run:

```bash
# 1. Upload your images to GCS
./scripts/upload-images-to-gcs.sh PROJECT_ID

# 2. Grant permissions
./scripts/setup-collage-iam.sh PROJECT_ID SERVICE_NAME REGION

# 3. Deploy (or push to GitHub for auto-deploy)
```

See [docs/IMAGE_SETUP.md](docs/IMAGE_SETUP.md) for detailed instructions.

## License

This project is open source and available under the MIT License.
