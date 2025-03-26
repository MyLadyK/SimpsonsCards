import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('token');
  
  console.log('Auth interceptor:', { 
    hasToken: !!token, 
    url: req.url,
    method: req.method,
    headers: req.headers.keys(),
    token: token ? 'TOKEN_PRESENT' : 'NO_TOKEN'
  });
  
  // Only add token to requests that need authentication
  if (token && !req.url.includes('/auth/login')) {
    const authReq = req.clone({
      setHeaders: {
        'authorization': `Bearer ${token}`
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
