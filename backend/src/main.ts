import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TraceIdInterceptor } from './common/interceptors/trace-id.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Global Interceptors
  app.useGlobalInterceptors(new TraceIdInterceptor());

  // Global Filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend rodando em http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
