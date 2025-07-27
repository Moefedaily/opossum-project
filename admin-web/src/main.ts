// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';

// Toast notifications
import { ToastrModule } from 'ngx-toastr';

// App component and routes
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Interceptors
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    // Router
    provideRouter(routes),

    // HTTP client with interceptors
    provideHttpClient(withInterceptors([authInterceptor])),

    // Animations for Angular Material
    provideAnimations(),

    // Toast notifications
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: true,
        newestOnTop: true,
      })
    ),
  ],
}).catch((err) => console.error(err));
