import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from './logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      
      // Errores específicos de MySQL
      if (exception.message.includes('ER_DUP_ENTRY')) {
        status = HttpStatus.CONFLICT;
        message = 'El registro ya existe';
      } else if (exception.message.includes('ER_NO_REFERENCED_ROW')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Referencia inválida';
      } else if (exception.message.includes('ER_ROW_IS_REFERENCED')) {
        status = HttpStatus.CONFLICT;
        message = 'No se puede eliminar: el registro está siendo usado';
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errors && { errors }),
    };

    this.logger.error(
      `HTTP Exception: ${status} - ${message}`,
      JSON.stringify({
        url: request.url,
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
        exception: exception instanceof Error ? exception.stack : exception,
      }),
    );

    response.status(status).json(errorResponse);
  }
}