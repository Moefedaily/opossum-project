import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

import { UserService, UserListItem } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatChipsModule,
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {
  userForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  userId!: number;
  currentUser: UserListItem | null = null;

  roleOptions = [
    { value: 'USER', label: 'User' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      firstName: [''],
      lastName: [''],
      phone: [''],
      role: ['', Validators.required],
      isActive: [true],
      isVerified: [true],
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.userId = +params['id'];
      this.loadUser();
    });
  }

  private loadUser() {
    this.isLoading = true;

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.populateForm(user);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.toastService.error('Failed to load user details');
        this.router.navigate(['/users']);
      },
    });
  }

  private populateForm(user: UserListItem) {
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    });
  }

  onSubmit() {
    if (this.userForm.valid && this.currentUser) {
      this.isSubmitting = true;

      // Prepare complete user data for update
      const updateData = {
        id: this.currentUser.id,
        username: this.currentUser.username,
        email: this.currentUser.email,
        firstName: this.userForm.get('firstName')?.value || null,
        lastName: this.userForm.get('lastName')?.value || null,
        phone: this.userForm.get('phone')?.value || null,
        role: this.currentUser.role,
        isActive: this.userForm.get('isActive')?.value,
        isVerified: this.userForm.get('isVerified')?.value,
        // Include any other fields that your UserDto expects
        createdAt: this.currentUser.createdAt,
        updatedAt: this.currentUser.updatedAt,
        lastLogin: this.currentUser.lastLogin,
        avatarUrl: this.currentUser.avatarUrl,
      };

      console.log('Updating user:', updateData);

      this.userService.updateUser(this.userId, updateData).subscribe({
        next: (updatedUser) => {
          // Check if role changed
          const newRole = this.userForm.get('role')?.value;
          if (newRole !== this.currentUser?.role) {
            // Update role separately
            this.updateUserRole(newRole, updatedUser);
          } else {
            this.toastService.success(
              `User ${updatedUser.username} updated successfully`
            );
            this.router.navigate(['/users']);
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.toastService.error('Failed to update user');
          this.isSubmitting = false;
        },
      });
    }
  }

  private updateUserRole(newRole: string, updatedUser: UserListItem) {
    this.userService
      .assignRole(this.userId, newRole as 'USER' | 'ADMIN')
      .subscribe({
        next: () => {
          this.toastService.success(
            `User ${updatedUser.username} updated successfully`
          );
          this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          this.toastService.error('User updated but failed to change role');
          this.router.navigate(['/users']);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/users']);
  }

  // Utility methods
  getUserDisplayName(): string {
    if (!this.currentUser) return '';

    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    } else if (this.currentUser.firstName) {
      return this.currentUser.firstName;
    } else {
      return this.currentUser.username;
    }
  }

  formatJoinDate(): string {
    if (!this.currentUser?.createdAt) return 'Unknown';
    return new Date(this.currentUser.createdAt).toLocaleDateString();
  }

  formatLastLogin(): string {
    if (!this.currentUser?.lastLogin) return 'Never';
    return new Date(this.currentUser.lastLogin).toLocaleDateString();
  }
}
