import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Decodificar el token para ver su contenido
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      console.log('Auth interceptor - Token Payload:', {
        hasToken: true,
        url: req.url,
        method: req.method,
        payload: payload,
        tokenPresent: 'TOKEN_PRESENT'
      });
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  } else {
    console.log('Auth interceptor:', { 
      hasToken: false, 
      url: req.url,
      method: req.method,
      headers: req.headers.keys(),
      token: 'NO_TOKEN'
    });
  }
  
  // Añadir token a todas las peticiones que requieren autenticación
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`  
      }
    });
    console.log('Request with token:', { 
      url: authReq.url,
      headers: authReq.headers.keys(),
      token: 'TOKEN_ADDED'
    });
    return next(authReq);
  }
  
  return next(req);
};
