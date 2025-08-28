import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for ngrok and local development
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:5173', // Vite default port
      /^https:\/\/.*\.ngrok\.io$/, // Allow any ngrok subdomain
      /^https:\/\/.*\.ngrok-free\.app$/, // New ngrok domain format
      /^https:\/\/.*\.vercel\.app$/, // If deploying frontend to Vercel
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'ngrok-skip-browser-warning' // Add this for ngrok
    ],
    credentials: true,
  });
  
  await app.listen(4000);
}
bootstrap();
