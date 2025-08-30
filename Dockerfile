# Use Node.js 18 alpine image as base
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies including Prisma CLI
RUN npm ci --only=production

# Copy Prisma files
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy built application files
COPY dist/src/ ./dist/src/
COPY dist/prisma/ ./dist/prisma/

# Verify main.js exists
RUN ls -la dist/src/main.js

# Expose port (Cloud Run will set the PORT environment variable)
EXPOSE 8080

# Run database migrations (optional)
# RUN npx prisma migrate deploy

# Start the application
CMD [ "node", "dist/src/main.js" ]