"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const trace_id_interceptor_1 = require("./common/interceptors/trace-id.interceptor");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    });
    // Global Interceptors
    app.useGlobalInterceptors(new trace_id_interceptor_1.TraceIdInterceptor());
    // Global Filters
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    // Global Validation Pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Backend rodando em http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
