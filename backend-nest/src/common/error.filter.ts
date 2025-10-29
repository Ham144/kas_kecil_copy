import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  async catch(exception: any, host: ArgumentsHost) {
    const response = await host.switchToHttp().getResponse();
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        message: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        message: exception.message,
      });
    } else {
      response.status(500).json({
        message: exception.message,
      });
    }
  }
}
