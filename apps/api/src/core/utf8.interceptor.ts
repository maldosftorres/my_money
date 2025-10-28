import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class Utf8Interceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Configurar headers UTF-8
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Accept-Charset', 'utf-8');
    
    return next.handle().pipe(
      map(data => {
        // Asegurar que los strings tengan codificación correcta
        return this.ensureUtf8(data);
      })
    );
  }

  private ensureUtf8(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Manejar fechas correctamente
    if (obj instanceof Date) {
      return obj.toISOString().split('T')[0]; // Convertir a formato YYYY-MM-DD
    }

    if (typeof obj === 'string') {
      // Corregir caracteres mal codificados específicos del español
      return obj
        .replace(/á/g, 'á')
        .replace(/é/g, 'é')
        .replace(/í/g, 'í')
        .replace(/ó/g, 'ó')
        .replace(/ú/g, 'ú')
        .replace(/ñ/g, 'ñ')
        .replace(/Á/g, 'Á')
        .replace(/É/g, 'É')
        .replace(/Í/g, 'Í')
        .replace(/Ó/g, 'Ó')
        .replace(/Ú/g, 'Ú')
        .replace(/Ñ/g, 'Ñ')
        .replace(/¿/g, '¿')
        .replace(/¡/g, '¡')
        .replace(/�/g, '');
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.ensureUtf8(item));
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = this.ensureUtf8(obj[key]);
        }
      }
      return result;
    }
    return obj;
  }
}