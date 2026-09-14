"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const configuredFrontendOrigin = configService.get('FRONTEND_ORIGIN');
    const frontendOrigin = configuredFrontendOrigin
        ? configuredFrontendOrigin.startsWith('http')
            ? configuredFrontendOrigin
            : `https://${configuredFrontendOrigin}`
        : 'http://localhost:5173';
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: frontendOrigin,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    await app.listen(configService.get('PORT', 3000));
}
void bootstrap();
//# sourceMappingURL=main.js.map