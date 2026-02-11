import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const traceId = (request as any).traceId || 'unknown';

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Erro interno do servidor';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || message;
                error = (exceptionResponse as any).error || error;
            }
        }

        // Log estruturado do erro
        this.logger.error({
            message: 'Exception caught',
            traceId,
            status,
            error,
            path: request.url,
            method: request.method,
            exception: exception instanceof Error ? exception.message : exception,
            stack: exception instanceof Error ? exception.stack : undefined,
        });

        // Resposta padronizada
        response.status(status).json({
            error: message,
            context: 'rh-system',
            trace_id: traceId,
            hint: 'Ver logs do servidor para mais detalhes',
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
