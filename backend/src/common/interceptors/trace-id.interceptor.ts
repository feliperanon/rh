import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        // Gera trace_id único para cada request
        const traceId = request.headers['x-trace-id'] || randomUUID();

        // Adiciona trace_id ao request para uso posterior
        request.traceId = traceId;

        // Adiciona trace_id ao response header
        response.setHeader('X-Trace-Id', traceId);

        return next.handle();
    }
}
