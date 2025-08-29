"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    const port = process.env.PORT || 10000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map