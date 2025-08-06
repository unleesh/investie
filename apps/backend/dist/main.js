"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
    console.log(`💬 Chat health: http://localhost:${port}/api/v1/chat/health`);
}
bootstrap().catch((error) => {
    console.error('❌ Application failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map