import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ValidationService } from './validation.service';
import { PrismaService } from './prisma.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { AuthMiddleware } from './auth.middleware';
// import { R2Service } from './r2.service';
import { UploadImageLocalService } from './uploadImageLocal.service';
import { HttpExceptionFilter } from './http-exception-filter';
import { GenerateCsvService } from './generateCsv.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    // R2Service,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    UploadImageLocalService,
    HttpExceptionFilter,
    GenerateCsvService,
  ],
  exports: [
    PrismaService,
    ValidationService,
    // R2Service,
    UploadImageLocalService,
    HttpExceptionFilter,
    GenerateCsvService,
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('/api/*');
  }
}
