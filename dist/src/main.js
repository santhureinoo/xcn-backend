"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const port = parseInt(process.env.PORT || '8080', 10);
    console.log(`Starting application on port ${port}`);
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        console.log('NestJS application created');
        app.enableCors({
            origin: [
                'http://localhost:3000',
                'http://localhost:4000',
                'http://localhost:5173',
                /^https:\/\/.*\.ngrok\.io$/,
                /^https:\/\/.*\.ngrok-free\.app$/,
                /^https:\/\/.*\.vercel\.app$/,
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'Authorization',
                'ngrok-skip-browser-warning'
            ],
            credentials: true,
        });
        console.log(`Attempting to listen on port ${port}`);
        await app.listen(port);
        console.log(`Application listening on port ${port}`);
    }
    catch (error) {
        console.error('Error starting application:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map