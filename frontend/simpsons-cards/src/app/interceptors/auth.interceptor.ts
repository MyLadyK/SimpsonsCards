import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  console.log('[AuthInterceptor] Interceptor ejecutado para URL:', req.url);

  const token = localStorage.getItem('token');
  console.log('[AuthInterceptor] Token en localStorage:', token);

  // Excluir rutas públicas (si aplica)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    console.log('[AuthInterceptor] Ruta pública detectada, sin token:', req.url);
    return next(req);
  }

  if (token) {
    // Crear nuevas headers con el token
    const headers = req.headers.set('Authorization', `Bearer ${token}`);
    const authReq = req.clone({ headers });

    console.log('[AuthInterceptor] Headers antes de enviar:', {
      url: authReq.url,
      method: authReq.method,
      headers: {
        all: authReq.headers.keys(),
        auth: authReq.headers.get('Authorization')
      }
    });

    return next(authReq).pipe(
      catchError(error => {
        console.error('[AuthInterceptor] Error en la petición interceptada:', {
          error,
          request: {
            url: authReq.url,
            method: authReq.method,
            headers: {
              all: authReq.headers.keys(),
              auth: authReq.headers.get('Authorization')
            }
          }
        });
        return throwError(() => error);
      })
    );
  } else {
    console.log('[AuthInterceptor] Sin token en localStorage. URL:', req.url);
  }

  return next(req);
};
