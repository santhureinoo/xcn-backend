# Deployment Scripts

This directory contains scripts to help with deployment, particularly to avoid memory issues on platforms with limited resources like RENDER's free tier.

## deploy.js

This script builds the application locally and prepares a deployment package that can be deployed to RENDER without requiring a build step on their servers.

### Usage

From the `digital-asset-be` directory, run:

```bash
npm run deploy
```

Or directly:

```bash
node scripts/deploy.js
```

### What it does

1. Builds the application using `npm run build`
2. Creates a `deploy` directory with the built files
3. Copies necessary files to the deploy directory:
   - `dist/` - Compiled application files
   - `prisma/` - Database schema and migrations
   - `.env` - Environment variables (if present)
4. Creates a simplified `package.json` with only runtime dependencies
5. Includes deployment instructions in a README.md file

### Benefits

- Avoids memory issues on platforms with limited build resources
- Faster deployment since the build step is skipped on the server
- More control over the build environment