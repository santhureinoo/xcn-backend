# Deployment to Google Cloud Run

This document provides instructions for deploying the application to Google Cloud Run.

## Prerequisites

1. Google Cloud SDK installed
2. Docker installed
3. Google Cloud account with billing enabled

## Environment Variables

The application requires several environment variables to be set. These should be configured in Google Cloud Run:

1. `DATABASE_URL` - Connection string for your database
2. `JWT_SECRET` - Secret key for JWT token generation
3. `MAIL_HOST` - SMTP server for email sending
4. `MAIL_PORT` - Port for SMTP server
5. `MAIL_USER` - Username for SMTP server
6. `MAIL_PASS` - Password for SMTP server
7. `MAIL_FROM` - Email address to send from
8. `FRONTEND_URL` - URL of your frontend application
9. `SMILE_ONE_BASE_URL` - Base URL for Smile One API
10. `SMILE_ONE_EMAIL` - Email for Smile One API
11. `SMILE_ONE_UID` - UID for Smile One API
12. `SMILE_ONE_KEY` - Key for Smile One API
13. `SMILE_ONE_USER_ID` - User ID for Smile One API
14. `SMILE_ONE_ZONE_ID` - Zone ID for Smile One API

## Setting Environment Variables in Google Cloud Run

You can set environment variables in Google Cloud Run using the gcloud command:

```bash
gcloud run services update digital-asset-be \
  --update-env-vars DATABASE_URL="your_database_url",JWT_SECRET="your_jwt_secret",MAIL_HOST="your_mail_host",MAIL_PORT="your_mail_port",MAIL_USER="your_mail_user",MAIL_PASS="your_mail_pass",MAIL_FROM="your_mail_from",FRONTEND_URL="your_frontend_url",SMILE_ONE_BASE_URL="your_smile_one_base_url",SMILE_ONE_EMAIL="your_smile_one_email",SMILE_ONE_UID="your_smile_one_uid",SMILE_ONE_KEY="your_smile_one_key",SMILE_ONE_USER_ID="your_smile_one_user_id",SMILE_ONE_ZONE_ID="your_smile_one_zone_id"
```

Or you can set them through the Google Cloud Console:
1. Go to the Google Cloud Console
2. Navigate to Cloud Run
3. Select your service
4. Click "Edit & Deploy New Revision"
5. Go to the "Variables & Secrets" section
6. Add each environment variable

## Deploying to Google Cloud Run

To deploy the application:

```bash
gcloud run deploy digital-asset-be \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Database Migrations

If you need to run database migrations:

```bash
gcloud run jobs create digital-asset-migrate \
  --source . \
  --command "npx prisma migrate deploy"
```

Or you can run migrations manually by connecting to a container instance.