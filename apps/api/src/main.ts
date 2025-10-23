import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/error.filter';
import { EnvService } from './core/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const envService = app.get(EnvService);
  
  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configurar prefijo global de la API
  app.setGlobalPrefix(envService.apiPrefix);

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = envService.port;
  await app.listen(port);
  
  console.log(`🚀 API ejecutándose en: http://localhost:${port}/${envService.apiPrefix}`);
  console.log(`📊 Ambiente: ${envService.nodeEnv}`);
}

bootstrap();