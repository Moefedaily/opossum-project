# OPOSSUM Admin Interface

Angular web application for platform administration. Administrators can manage users, moderate announcements, oversee messaging, and monitor platform analytics.

## What's Built

- **User Management**: Complete CRUD operations with role assignment and advanced filtering
- **Announcement Oversight**: Full moderation capabilities with status controls
- **Message Moderation**: Conversation management with status controls and content oversight
- **Dashboard Analytics**: Statistics, metrics, and platform insights
- **Security Controls**: Admin-only authentication with comprehensive role-based access
- ** UI**: Material Design with responsive layout and accessibility features

## Tech Stack

- Angular 17+
- TypeScript 5.7+
- Angular Material
- RxJS for reactive programming
- SCSS with custom theming
- JWT Authentication
- Vercel deployment

## Quick Start

### 1. Prerequisites

```bash
- Node.js 18+
- Angular CLI 17+ (`npm install -g @angular/cli`)
- OPOSSUM Backend running (see backend README)
```

### 2. Clone and Setup

```bash
git clone <repository-url>
cd opossum-project/admin-web
npm install
```

### 3. Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "https://opossum-project.onrender.com/api",
  appName: "OPOSSUM Admin",
  version: "1.0.0",
};
```

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://opossum-project.onrender.com/api",
  appName: "OPOSSUM Admin",
  version: "1.0.0",
};
```

### 4. Start Development

```bash
# Start development server
ng serve

# Access admin interface at http://localhost:4200
```

## Live Production Instance

**URL**: https://opossum-admin-b01lfhtqf-moefedailys-projects.vercel.app

### Admin Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

Test the complete admin functionality with real data from the production backend.

## Important Setup Notes

### Backend Connection (Critical)

The admin interface requires the OPOSSUM backend running. Without it, authentication and all admin functions will fail.

- Backend is deployed at: `https://opossum-project.onrender.com`
- Test connection: https://opossum-project.onrender.com/actuator/health should return 200
- API documentation: https://opossum-project.onrender.com/swagger-ui/index.html

### Admin Authentication

- Only users with ADMIN role can access the interface
- JWT tokens are automatically managed with refresh logic
- Session timeout handled gracefully with re-authentication prompts
- Automatic logout on token expiration

### CORS Configuration

The production backend is configured to accept requests from:

- `https://opossum-admin-b01lfhtqf-moefedailys-projects.vercel.app` (production)
- `http://localhost:4200` (development)

## Application Structure

```
admin-web/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services and guards
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts    # Route protection
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts # JWT injection
│   │   │   └── services/
│   │   │       ├── api.service.ts   # HTTP client foundation
│   │   │       ├── auth.service.ts  # Authentication logic
│   │   │       ├── user.service.ts  # User management
│   │   │       ├── announcement.service.ts # Announcement oversight
│   │   │       ├── message.service.ts # Message moderation
│   │   │       └── toast.service.ts # User notifications
│   │   ├── features/               # Feature modules
│   │   │   ├── auth/
│   │   │   │   └── login/          # Admin login interface
│   │   │   ├── dashboard/          # Analytics dashboard
│   │   │   ├── users/              # User management
│   │   │   │   ├── user-list/      # User table with filtering
│   │   │   │   ├── create-user/    # User creation form
│   │   │   │   └── edit-user/      # User editing interface
│   │   │   ├── announcements/      # Announcement oversight
│   │   │   │   ├── announcement-list/ # Moderation table
│   │   │   │   └── announcement-detail/ # Detail view with gallery
│   │   │   └── messages/           # Message moderation
│   │   │       ├── conversation-list/ # Conversation management
│   │   │       └── conversation-detail/ # Message timeline
│   │   ├── layout/
│   │   │   └── main-layout/        # Responsive sidebar navigation
│   │   ├── shared/                 # Shared components and utilities
│   │   └── app.routes.ts          # Lazy-loaded routing
│   ├── environments/              # Environment configurations
│   ├── styles/                    # Design system
│   │   ├── variables.scss         # Oxblood Dreams theme
│   │   ├── global.scss           # Utility classes
│   │   └── styles.scss           # Angular Material theming
│   └── main.ts                   # Modern Angular bootstrap
├── vercel.json                   # Production deployment config
└── package.json                  # Dependencies and scripts
```

## Design System ("Oxblood Dreams")

The admin interface uses a design system with:

- **Primary**: Rich Oxblood (#800020) for primary actions and branding
- **Secondary**: Warm Taupe (#8B7D6B) for secondary elements
- **Background**: Soft Rose (#FAF7F0) for warm, professional atmosphere
- **Success**: Forest Green (#228B22) for positive actions
- **Warning**: Amber (#FFC107) for caution states
- **Danger**: Deep Red (#DC3545) for destructive actions
- **Typography**: Professional hierarchy with DM Sans and system fonts
- **Material Design**: Angular Material components with custom theming

## Key Features

### User Management

**Complete CRUD Operations:**

- Create new users with role assignment
- Edit user profiles and account information
- Change user roles (USER ↔ ADMIN) with confirmations
- Activate/deactivate user accounts
- Delete users with admin protection

**Advanced Filtering System:**

- Text search across username, email, and names
- Role filtering (All Roles, User, Admin)
- Status filtering (All Status, Active, Inactive)
- Verification filtering (All Users, Verified, Unverified)
- Statistics with live user counts

**Professional Interface:**

- Material Design table with sorting and pagination
- Color-coded status indicators and role chips
- Responsive mobile-optimized layout
- Loading states and error handling

### Announcement Management

**Moderation Capabilities:**

- View all announcements with comprehensive details
- Activate/deactivate announcements with status controls
- Delete inappropriate content with confirmations
- Image gallery viewing with navigation controls
- Admin bypass for ownership restrictions

**Enhanced Features:**

- Professional two-column layout (images + details)
- Comprehensive information cards for all data
- File gallery system with thumbnails and main display
- Responsive design adapting to screen sizes

### Message Oversight

**Conversation Management:**

- View all platform conversations with participants
- Change conversation status (ACTIVE/ARCHIVED/BLOCKED)
- Delete individual messages with confirmations
- Delete entire conversations with protection
- Advanced filtering by participants and status

**Chat Interface:**

- Message timeline with date separators
- Message bubbles with different styling for participants
- Statistics and conversation metrics
- Mobile enforcement preventing messaging in restricted conversations

### Dashboard Analytics

**Statistics:**

- Total users with admin/regular breakdown
- Active announcements with category distribution
- Conversation metrics with status breakdown
- Message counts and activity trends
- System health and performance indicators

**Visual Insights:**

- Statistics cards with icons
- Color-coded metrics for quick understanding
- Responsive grid layout adapting to screen size
- Live updates without page refresh

## Security Features

### Authentication & Authorization

- JWT token authentication with automatic refresh
- Role-based access control (ADMIN only)
- Route protection with auth guards
- Automatic token injection in API requests
- Session management with secure logout

### Admin Protections

- Cannot delete admin users (self-protection)
- Confirmation dialogs for all destructive actions
- Processing states during operations
- Error handling with user-friendly messages
- Audit trail for admin actions

### Data Security

- Input validation on all forms
- XSS protection through Angular sanitization
- CSRF protection via JWT tokens
- No sensitive data in client storage

## API Integration

The admin interface connects to backend endpoints:

### User Management Endpoints

```
GET    /api/users                 # List users with filtering
POST   /api/users                 # Create new user (admin)
GET    /api/users/{id}           # Get user details
PUT    /api/users/{id}           # Update user profile
PATCH  /api/users/{id}/role      # Change user role
PATCH  /api/users/{id}/activate  # Activate/deactivate user
DELETE /api/users/{id}           # Delete user
GET    /api/users/stats          # User statistics
```

### Announcement Admin Endpoints

```
GET    /api/announcements/admin/all        # Admin view all
PATCH  /api/announcements/admin/{id}/activate    # Activate
PATCH  /api/announcements/admin/{id}/deactivate  # Deactivate
DELETE /api/announcements/admin/{id}       # Admin delete
GET    /api/files/announcement/{id}        # Get image files
```

### Message Admin Endpoints

```
GET    /api/conversations/admin/all        # Admin view conversations
GET    /api/conversations/admin/stats      # Conversation statistics
PATCH  /api/conversations/admin/{id}/status # Change status
DELETE /api/conversations/admin/{id}       # Delete conversation
DELETE /api/messages/admin/{id}            # Delete message
```

## Advanced Features

### Real-time Updates

- Live statistics refresh without page reload
- Immediate UI feedback after operations
- Error recovery with retry mechanisms

### Responsive Design

- Mobile-first approach with proper breakpoints
- Consistent experience across all screen sizes

## Common Issues

**Login fails**: Verify admin user exists in backend and has ADMIN role

**API calls fail**: Check backend is running and CORS is configured for your domain

**Build fails**: Ensure Angular CLI version matches project requirements

**Styling issues**: Verify Angular Material is properly imported and themed

**Route protection**: Confirm auth guard is properly configured and JWT tokens are valid

## Development

```bash
# Run development server
ng serve

# Run tests
ng test

# Run e2e tests
ng e2e

# Build for production
ng build --configuration=production

# Lint code
ng lint

# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/admin-web/stats.json
```

## Deployment

### Vercel Deployment (Production)

The admin interface is deployed on Vercel with optimized configuration:

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "ng build --configuration=production --budget-warning=false",
  "outputDirectory": "dist/admin-web/browser",
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Environment-Specific Builds

```bash
# Development build
ng build

# Production build
ng build --configuration=production

```

## Contributing

### Code Style

- **TypeScript**: Strict typing enabled
- **ESLint**: Code quality rules
- **Prettier**: Consistent code formatting

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests
4. Create pull request
5. Code review and merge

## Roadmap

### Planned Features

- **Real-time Notifications**: WebSocket integration
