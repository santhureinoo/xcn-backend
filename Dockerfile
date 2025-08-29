# Use Node.js 18 alpine image as base
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application files
COPY dist/ ./dist/
COPY prisma/ ./prisma/

# Expose port (Cloud Run will set the PORT environment variable)
EXPOSE 8080

# Run database migrations (optional)
# RUN npx prisma migrate deploy

# Start the application
CMD [ "node", "dist/main.js" ]