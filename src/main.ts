import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = parseInt(process.env.PORT || '8080', 10);
  console.log(`Starting application on port ${port}`);
  
  try {
    const app = await NestFactory.create(AppModule);
    console.log('NestJS application created');
    
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
    
    console.log(`Attempting to listen on port ${port}`);
    await app.listen(port);
    console.log(`Application listening on port ${port}`);
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}
bootstrap();
