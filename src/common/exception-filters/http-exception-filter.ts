import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

// https://docs.nestjs.com/exception-filters
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const responseBody: any = exception.getResponse();
      const errorsResponse = {
        errorsMessages: [],
      };

      // Обработка одной ошибки или массива ошибок
      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((error) => {
          errorsResponse.errorsMessages.push(error);
        });
      } else if (typeof responseBody.message === 'string') {
        // Если ошибка представлена в виде простой строки
        errorsResponse.errorsMessages.push({ message: responseBody.message, field: responseBody.field });
      } else {
        errorsResponse.errorsMessages.push(responseBody.message);
      }

      response.status(status).json(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
