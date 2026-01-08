# Setting Up GitHub Auto-Deployment

This guide will help you connect your GitHub repository to Google Cloud Build for automatic deployments.

## Quick Setup (Recommended)

The easiest way is to set this up via the Google Cloud Console:

### Step 1: Connect Your Repository

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Select your project
3. Click **"Connect Repository"**
4. Choose **"GitHub (Cloud Build GitHub App)"**
5. Authenticate with GitHub (you'll be redirected)
6. Select your repository: `your-username/personalPortfolio`
7. Click **"Connect"**

### Step 2: Create the Trigger

1. After connecting, click **"Create Trigger"**
2. Fill in the configuration:

   **Basic Information:**
   - **Name**: `deploy-portfolio` (or your service name)
   - **Description**: `Auto-deploy portfolio from GitHub on push to main branch`

   **Event Configuration:**
   - **Event**: `Push to a branch`
   - **Branch**: `^main$` (or your branch name, use `^master$` if that's your branch)

   **Configuration:**
   - **Type**: `Cloud Build configuration file (yaml or json)`
   - **Location**: `cloudbuild.yaml`

   **Substitution variables** (click "Show included and ignored files" if needed):
   - `_SERVICE_NAME`: `portfolio` (or your Cloud Run service name)
   - `_IMAGE_NAME`: `portfolio` (lowercase version of service name, for Docker image)
   - `_REGION`: `us-central1` (or your region)

3. Click **"Create"**

### Step 3: Test It

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. Check the [Cloud Build dashboard](https://console.cloud.google.com/cloud-build/builds) to see the build in progress

## What Happens on Each Push

When you push to your configured branch:
1. ✅ Cloud Build detects the push
2. ✅ Builds your Docker image using `Dockerfile`
3. ✅ Pushes image to Container Registry
4. ✅ Deploys to Cloud Run automatically
5. ✅ Your website is updated!

## Troubleshooting

### "Repository not found" error
- Make sure you've connected the repository in Step 1
- Verify the repository name is correct

### Build fails
- Check that `cloudbuild.yaml` exists in your repository root
- Verify `Dockerfile` is present
- Check build logs in the Cloud Build console

### Permission errors
- Ensure Cloud Build has permission to deploy to Cloud Run
- Run: `./scripts/setup-permissions.sh YOUR_PROJECT_ID`

## Alternative: Using the Script

You can also try the automated script (after connecting the repository):

```bash
./scripts/setup-github-trigger.sh PROJECT_ID SERVICE_NAME REGION REPO_NAME BRANCH
```

Example:
```bash
./scripts/setup-github-trigger.sh burnished-edge-481720-j3 portfolio us-central1 yashc/personalPortfolio main
```

## Monitor Your Deployments

- **Build History**: https://console.cloud.google.com/cloud-build/builds
- **Triggers**: https://console.cloud.google.com/cloud-build/triggers
- **Cloud Run Services**: https://console.cloud.google.com/run

