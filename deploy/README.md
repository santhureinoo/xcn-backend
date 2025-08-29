# Deployment Package

This directory contains the built files for deployment to RENDER. The application has been pre-built locally to avoid memory issues on RENDER's free tier.

## Deployment Instructions

1. Commit these files to your repository
2. Connect your repository to RENDER
3. Set up your RENDER service with the following configuration:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add your environment variables in the RENDER dashboard
5. Deploy!

## What's Included

- `dist/`: Compiled application files
- `prisma/`: Database schema and migrations
- `package.json`: Simplified package file with only runtime dependencies
- `.env`: Environment variables (if applicable)

## Database Migrations

After deployment, you may need to run database migrations:

```bash
npm run db:migrate
```

If you have seed data:

```bash
npm run db:seed
```

## Notes

- This deployment package was created locally to avoid memory issues on RENDER's free tier
- The build process has already been completed, so RENDER only needs to install dependencies and start the application