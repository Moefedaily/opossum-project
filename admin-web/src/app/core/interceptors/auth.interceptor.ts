import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  // Get the auth token from the service
  const authToken = authService.getToken();

  // If we have a token, add it to the request
  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  // Handle the request and catch any authentication errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get 401 Unauthorized, redirect to login
      if (error.status === 401) {
        toastService.error(
          'Your session has expired. Please login again.',
          'Authentication Required'
        );
        authService.logout().subscribe({
          complete: () => {
            router.navigate(['/auth/login']);
          },
        });
      }

      // If we get 403 Forbidden, show access denied message
      if (error.status === 403) {
        toastService.error(
          'You do not have permission to perform this action.',
          'Access Denied'
        );
      }

      // Re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};
