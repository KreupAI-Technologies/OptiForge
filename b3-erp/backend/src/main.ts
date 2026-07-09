import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureSecurityHeaders, getCorsConfig } from './common/security/security.config';
import cookieParser from 'cookie-parser';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';




async function bootstrap() {
  // Dev output was extremely noisy: a per-request HTTP log, hundreds of
  // "Mapped … route" lines at startup, and seeder chatter — all at the 'log'
  // level. Show only warnings/errors by default. Set NEST_VERBOSE=1 to restore
  // full logging (route map, request logs, seeder info, debug/verbose).
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NEST_VERBOSE === '1'
        ? ['error', 'warn', 'log', 'debug', 'verbose']
        : ['error', 'warn'],
  });
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Cookie Parser
  app.use(cookieParser());


  // Security Headers
  configureSecurityHeaders(app);

  // CORS
  const frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:3000';
  app.enableCors(getCorsConfig(frontendUrl));

  // Filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),

  );

  // Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = configService.get('PORT') || 8000;

  // Swagger documentation (Disabled in production)

  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('OptiForge ERP API')
      .setDescription('OptiForge ERP System API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication')
      .addTag('CRM')
      .addTag('Sales')
      .addTag('Inventory')
      .addTag('Production')
      .addTag('Finance')
      .addTag('HR')
      .addTag('Procurement')
      .addTag('Logistics')
      .addTag('Support')
      .addTag('IT Admin')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }


  await app.listen(port);


  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);

}

bootstrap();
