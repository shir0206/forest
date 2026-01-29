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

   This command will:

   - Build your project with `vite build`
   - Deploy the `dist` folder to the `gh-pages` branch
   - GitHub Pages will automatically serve from this branch

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
3. Choose the **`gh-pages`** branch
4. Save the settings

Your site will be available at: `https://username.github.io/repository-name/`

## Final Steps

After running `yarn deploy`, make sure to:

1. **Check GitHub Pages settings**: Ensure your repository is configured to serve from the `gh-pages` branch
2. **Wait for deployment**: GitHub Pages may take a few minutes to update
3. **Clear browser cache**: If you still see 404 errors, clear your browser cache and try again

## Troubleshooting

If you still encounter 404 errors:

1. Verify that the `gh-pages` branch exists and contains your built files
2. Check that GitHub Pages is configured to serve from the `gh-pages` branch (not `main` or `pages`)
3. Ensure the `base` property in `vite.config.ts` is set to `"/forest/"` for your repository
4. Wait 5-10 minutes for GitHub Pages to process the new deployment
