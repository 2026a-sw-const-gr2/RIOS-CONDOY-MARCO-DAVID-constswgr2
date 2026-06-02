import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Error interno del servidor';
    const detail = exception instanceof Error ? exception.message : String(exception);

    this.logger.error({
      action: 'UNHANDLED_EXCEPTION',
      status,
      path: request.url,
      method: request.method,
      detail,
      timestamp: new Date().toISOString(),
    });

    response.status(status).json({
      statusCode: status,
      error: status >= 500 ? 'Internal Server Error' : 'Bad Request',
      message,
      detail,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
