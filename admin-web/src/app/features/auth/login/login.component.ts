import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // If already logged in as admin, redirect to dashboard
    if (this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;

      console.log('Login attempt with:', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login success:', response);
          // Check if user has admin role
          if (response.user.role === 'ADMIN') {
            this.toastService.success('Welcome to OPOSSUM Admin!');
            this.router.navigate(['/dashboard']);
          } else {
            // User is not admin
            this.authService.logout();
            this.toastService.error(
              'Access denied. Admin privileges required.'
            );
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Full login error:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error response body:', error.error);

          // Handle specific error types
          if (error.status === 401) {
            this.toastService.error('Invalid login credentials.');
          } else if (error.status === 403) {
            this.toastService.error(
              'Access denied. Admin privileges required.'
            );
          } else if (error.message?.includes('verification')) {
            this.toastService.error(
              'Please verify your email before accessing admin panel.'
            );
          } else {
            this.toastService.error('Login failed. Please try again.');
          }
          this.loading = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  // Getter methods for correct form controls
  get login() {
    return this.loginForm.get('login');
  }

  get password() {
    return this.loginForm.get('password');
  }

  //Helper methods for validation messages
  getLoginErrorMessage() {
    if (this.login?.hasError('required')) {
      return 'Email or Username is required';
    }
    return '';
  }

  getPasswordErrorMessage() {
    if (this.password?.hasError('required')) {
      return 'Password is required';
    }
    if (this.password?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}
