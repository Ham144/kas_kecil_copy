import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/http-exception-filter';

async function bootstrap() {
  try {
    // Disable built-in body parser to configure custom limits
    const app = await NestFactory.create(AppModule, {
      bodyParser: false,
    });

    app.useGlobalFilters(new HttpExceptionFilter());

    // Configure body parser with increased limit (15MB)
    const express = require('express');
    app.use(express.json({ limit: '15mb' }));
    app.use(express.urlencoded({ limit: '15mb', extended: true }));

    // Enable cookie parser
    app.use(cookieParser());

    // Enable CORS
    app.enableCors({
      origin:
        process.env.NODE_ENV === 'production'
          ? [process.env.FRONTEND_URL_PROD]
          : ['http://localhost:3000', 'http://192.168.169.12:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.listen(3001);
    console.log('✓ Server listening on port 3001');
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace',
    );
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Unhandled error in bootstrap:', error);
  process.exit(1);
});
