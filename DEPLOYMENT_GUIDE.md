# GitHub Pages Deployment Guide

## Prerequisites

- A GitHub repository set up for your project
- Node.js and yarn installed

## Steps to Deploy

1. **Build your project**:

   ```bash
   yarn build
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   yarn deploy
   ```

## Troubleshooting

If you encounter a 404 error after deployment:

1. Make sure your repository name matches the expected URL structure
2. Verify that GitHub Pages is enabled in your repository settings
3. Check that the `base` property in `vite.config.ts` is set correctly:
   - For root deployment: `base: "/"` (current setting)
   - For subdirectory deployment: `base: "/your-repo-name/"`

## Repository Settings

In your GitHub repository:

1. Go to Settings → Pages
2. Under "Source", select "Deploy from a branch"
3. Choose the branch you want to deploy from (usually `main` or `master`)
4. Save the settings

Your site will be available at: `https://username.github.io/repository-name/`
