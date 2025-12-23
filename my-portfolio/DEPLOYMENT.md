# Deploying to Google Cloud

This guide covers multiple deployment options for your Next.js portfolio on Google Cloud.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK**: Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Authentication**: Run `gcloud auth login` to authenticate
4. **Billing**: Enable billing for your Google Cloud project (required for Cloud Run and App Engine)

## Option 1: Cloud Run (Recommended for Dynamic Sites)

Cloud Run is a fully managed serverless platform that automatically scales your application. It's ideal for dynamic Next.js applications with server-side rendering capabilities.

### Setup Steps

#### 1. Create a Google Cloud Project

```bash
# Create a new project (or use existing)
gcloud projects create YOUR_PROJECT_ID --name="Portfolio Project"

# Set the project as active
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Deploy Using the Script

Make the deployment script executable and run it:

```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh SERVICE_NAME PROJECT_ID REGION
```

Or run it interactively (it will prompt for values):

```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

**Parameters:**
- `SERVICE_NAME`: Name for your Cloud Run service (e.g., `portfolio`)
- `PROJECT_ID`: Your Google Cloud project ID
- `REGION`: GCP region (default: `us-central1`)

#### 3. Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy SERVICE_NAME \
  --image gcr.io/YOUR_PROJECT_ID/SERVICE_NAME \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### Accessing Your Site

After deployment, Cloud Run will provide you with a URL like:
- `https://SERVICE_NAME-XXXXX-uc.a.run.app`

You can also get the URL with:
```bash
gcloud run services describe SERVICE_NAME --region REGION --format 'value(status.url)'
```

### Updating Your Site

#### Manual Update

To update your site, simply run the deployment script again:
```bash
./deploy-cloud-run.sh SERVICE_NAME PROJECT_ID REGION
```

#### Automatic Updates from GitHub (CI/CD)

Set up automatic deployment so that every push to your GitHub repository automatically deploys to Cloud Run.

**Quick Setup:**

```bash
chmod +x setup-github-trigger.sh
./setup-github-trigger.sh PROJECT_ID SERVICE_NAME REGION REPO_NAME BRANCH
```

**Example:**
```bash
./setup-github-trigger.sh burnished-edge-481720-j3 portfolio us-central1 yashc/personalPortfolio main
```

**Parameters:**
- `PROJECT_ID`: Your Google Cloud project ID
- `SERVICE_NAME`: Your Cloud Run service name
- `REGION`: GCP region (default: `us-central1`)
- `REPO_NAME`: GitHub repository in format `owner/repo` (e.g., `yashc/personalPortfolio`)
- `BRANCH`: Branch to trigger on (default: `main`)

**What This Does:**

1. Connects your GitHub repository to Google Cloud Build
2. Creates a trigger that automatically builds and deploys when you push to the specified branch
3. Uses the `cloudbuild.yaml` configuration file in your repository

**After Setup:**

Once configured, every time you push to your GitHub repository:
```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

Cloud Build will automatically:
1. Build your Docker image
2. Push it to Container Registry
3. Deploy to Cloud Run

**Monitor Builds:**

View your builds at:
- Console: https://console.cloud.google.com/cloud-build/builds
- Or run: `gcloud builds list`

**Manual Setup (Alternative):**

If you prefer to set up the trigger manually:

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Create Trigger"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `deploy-portfolio`
   - **Event**: Push to a branch
   - **Branch**: `^main$`
   - **Configuration**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`
   - **Substitution variables**:
     - `_SERVICE_NAME`: `portfolio`
     - `_REGION`: `us-central1`

### Cost Considerations

- **Free Tier**: 2 million requests per month, 360,000 GB-seconds of memory, 180,000 vCPU-seconds
- **Pricing**: After free tier, $0.40 per million requests, $0.0000025 per GB-second, $0.0000100 per vCPU-second
- For a typical portfolio site, you'll likely stay within the free tier

---

## Option 2: App Engine

App Engine is a fully managed platform that handles infrastructure management for you. It's another good option for dynamic Next.js applications.

### Setup Steps

#### 1. Create a Google Cloud Project

```bash
# Create a new project (or use existing)
gcloud projects create YOUR_PROJECT_ID --name="Portfolio Project"

# Set the project as active
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Deploy Using the Script

Make the deployment script executable and run it:

```bash
chmod +x deploy-app-engine.sh
./deploy-app-engine.sh PROJECT_ID
```

Or run it interactively:
```bash
chmod +x deploy-app-engine.sh
./deploy-app-engine.sh
```

#### 3. Manual Deployment (Alternative)

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable App Engine API
gcloud services enable appengine.googleapis.com

# Create App Engine app (first time only)
gcloud app create --region=us-central

# Deploy
gcloud app deploy app.yaml
```

### Accessing Your Site

After deployment, your app will be available at:
- `https://YOUR_PROJECT_ID.uc.r.appspot.com`

Or use:
```bash
gcloud app browse
```

### Cost Considerations

- **Free Tier**: 28 instance hours per day for F1 instances
- **Pricing**: After free tier, F1 instances cost ~$0.05 per hour
- For a typical portfolio site with minimal traffic, you'll likely stay within the free tier

---

## Option 3: Cloud Storage (Static Sites Only)

For static Next.js sites (with `output: 'export'`), Cloud Storage is the most cost-effective option.

### Setup Steps

#### 1. Create a Google Cloud Project

```bash
# Create a new project (or use existing)
gcloud projects create YOUR_PROJECT_ID --name="Portfolio Project"

# Set the project as active
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Enable Required APIs

```bash
# Enable Cloud Storage API
gcloud services enable storage-component.googleapis.com
```

#### 3. Choose Your Bucket Name

Your bucket name must be globally unique. Common patterns:
- `yourname-portfolio`
- `yourname-website`
- `portfolio-yourname`

#### 4. Deploy Using the Script

Make the deployment script executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh YOUR_BUCKET_NAME YOUR_PROJECT_ID
```

Or run it interactively (it will prompt for values):

```bash
./deploy.sh
```

#### 5. Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build the static site
npm run build

# Create bucket (if it doesn't exist)
gsutil mb -p YOUR_PROJECT_ID gs://YOUR_BUCKET_NAME

# Configure for static website hosting
gsutil web set -m index.html -e 404.html gs://YOUR_BUCKET_NAME

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://YOUR_BUCKET_NAME

# Upload files
gsutil -m rsync -r -d out/ gs://YOUR_BUCKET_NAME/
```

### Accessing Your Site

After deployment, your site will be available at:
- `https://storage.googleapis.com/YOUR_BUCKET_NAME/index.html`
- Or: `https://YOUR_BUCKET_NAME.storage.googleapis.com`

### Cost Considerations

- **Free Tier**: 5GB storage and 1GB egress per month
- **Pricing**: After free tier, storage is ~$0.020/GB/month, and egress is ~$0.12/GB
- For a typical portfolio site, you'll likely stay within the free tier

---

## Custom Domain Setup

### For Cloud Run

1. **Map your domain** in Cloud Run:
   ```bash
   gcloud run domain-mappings create --service SERVICE_NAME --domain yourdomain.com --region REGION
   ```

2. **Add DNS records** as instructed by the command output

### For App Engine

1. **Add custom domain** in App Engine:
   ```bash
   gcloud app domain-mappings create yourdomain.com
   ```

2. **Add DNS records** as instructed

### For Cloud Storage

1. **Verify domain ownership** in Google Search Console
2. **Create a CNAME record** pointing to `c.storage.googleapis.com`
3. **Configure bucket** for your domain:
   ```bash
   gsutil web set -m index.html gs://YOUR_BUCKET_NAME
   ```

---

## Troubleshooting

### Build Errors

- Ensure all dependencies are installed: `npm install`
- Check Dockerfile for correct Node.js version
- Verify `next.config.ts` has `output: 'standalone'` for Cloud Run/App Engine

### Permission Errors (PERMISSION_DENIED)

If you see `PERMISSION_DENIED` errors when running `gcloud builds submit`, you need to grant yourself the necessary IAM roles.

#### Quick Fix: Run the Setup Script

```bash
chmod +x setup-permissions.sh
./setup-permissions.sh YOUR_PROJECT_ID
```

This will grant you the following roles:
- Cloud Build Editor (`roles/cloudbuild.builds.editor`)
- Service Account User (`roles/iam.serviceAccountUser`)
- Cloud Run Admin (`roles/run.admin`)
- Storage Admin (`roles/storage.admin`)
- Service Usage Admin (`roles/serviceusage.serviceUsageAdmin`)

#### Manual Fix: Grant Roles via Console

1. Go to [Google Cloud Console IAM page](https://console.cloud.google.com/iam-admin/iam)
2. Select your project
3. Find your email address (`yashchauhan132017@gmail.com`)
4. Click "Edit" (pencil icon)
5. Click "Add Another Role"
6. Add the following roles:
   - Cloud Build Editor
   - Service Account User
   - Cloud Run Admin
   - Storage Admin
   - Service Usage Admin
7. Click "Save"

#### Alternative: Grant Owner Role

If you're the project creator, you can grant yourself the "Owner" role which includes all necessary permissions:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="user:YOUR_EMAIL@gmail.com" \
    --role="roles/owner"
```

#### Verify Permissions

- Make sure you're authenticated: `gcloud auth login`
- Verify project permissions: `gcloud projects list`
- Check billing is enabled: `gcloud billing accounts list`
- Check your current roles: `gcloud projects get-iam-policy YOUR_PROJECT_ID --flatten="bindings[].members" --filter="bindings.members:user:YOUR_EMAIL@gmail.com"`

### Docker Build Issues

- Ensure Docker is running locally (if testing locally)
- Check `.dockerignore` file is correct
- Verify `next.config.ts` has standalone output enabled

### Service Not Accessible

- For Cloud Run: Check that `--allow-unauthenticated` flag was used
- For App Engine: Verify app.yaml configuration
- Check IAM permissions for the service

### 404 Errors

- Verify routes are correctly configured
- Check that all static assets are included in the build
- For Cloud Storage: Ensure `index.html` exists in the root

---

## Which Option Should I Choose?

- **Cloud Run**: Best for dynamic Next.js apps with SSR, API routes, or server-side features. Scales to zero when not in use.
- **App Engine**: Good for dynamic apps, fully managed, but less flexible than Cloud Run.
- **Cloud Storage**: Only for static sites. Most cost-effective but no server-side features.

For a dynamic Next.js portfolio, **Cloud Run is recommended**.
