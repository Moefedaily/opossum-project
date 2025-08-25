import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService, User } from '../../core/services/auth.service';
import {
  UserService,
  UpdateProfileDto,
  ChangePasswordRequest,
} from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoadingProfile = false;
  isUpdatingProfile = false;
  isChangingPassword = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load current user profile
   */
  loadCurrentUser(): void {
    this.isLoadingProfile = true;

    this.authService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user as User;
          this.populateProfileForm();
          this.isLoadingProfile = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.isLoadingProfile = false;
        },
      });
  }

  /**
   * Populate profile form with current user data
   */
  populateProfileForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName || '',
        lastName: this.currentUser.lastName || '',
        phone: this.currentUser.phone || '',
      });
    }
  }

  /**
   * Update user profile
   */
  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isUpdatingProfile = true;

    const profileData: UpdateProfileDto = {
      firstName: this.profileForm.value.firstName || undefined,
      lastName: this.profileForm.value.lastName || undefined,
      phone: this.profileForm.value.phone || undefined,
    };

    this.userService
      .updateProfile(profileData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Reload user data to show updated info
          this.loadCurrentUser();
          this.isUpdatingProfile = false;
        },
        error: (error) => {
          console.error('Profile update failed:', error);
          this.isUpdatingProfile = false;
        },
      });
  }

  /**
   * Change password
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isChangingPassword = true;

    const passwordData: ChangePasswordRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
    };

    this.userService
      .changePassword(passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Reset password form
          this.passwordForm.reset();
          this.isChangingPassword = false;
        },
        error: (error) => {
          console.error('Password change failed:', error);
          this.isChangingPassword = false;
        },
      });
  }

  /**
   * Custom validator for password confirmation
   */
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get display name for user
   */
  getDisplayName(): string {
    if (!this.currentUser) return 'Unknown User';

    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }

    if (this.currentUser.firstName) return this.currentUser.firstName;
    if (this.currentUser.lastName) return this.currentUser.lastName;

    return this.currentUser.username;
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    if (!this.currentUser) return 'U';

    if (this.currentUser.firstName && this.currentUser.lastName) {
      return (
        this.currentUser.firstName.charAt(0) +
        this.currentUser.lastName.charAt(0)
      ).toUpperCase();
    }

    if (this.currentUser.firstName)
      return this.currentUser.firstName.charAt(0).toUpperCase();
    if (this.currentUser.username)
      return this.currentUser.username.charAt(0).toUpperCase();

    return 'U';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
