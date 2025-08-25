backend/README.md

# OPOSSUM Mobile App

React Native/Expo app for lost and found items. Users can create announcements with photos, search on interactive maps, filter by categories, and chat with other users about items.

## What's Built

- **Authentication Flow**: Login, registration, email verification with production-grade error handling
- **Dashboard**: Statistics, recent items, and quick action buttons
- **Create Announcements**: 3-screen wizard with camera/gallery, GPS location, and category selection
- **Browse & Search**: List view with category filtering and advanced search
- **Interactive Map**: Real-time markers, location-based filtering, and radius search (5km-50km)
- **Announcement Details**: Image gallery, contact actions, and comprehensive item info
- **Messaging System**: Real-time conversations linked to announcements
- **User Profile**: Account management, announcements list, and settings
- **Account Deletion**: Multi-step confirmation with backend cascading

## Tech Stack

- React Native (Expo 50+)
- TypeScript
- Expo Router (file-based navigation)
- React Native Maps (iOS/Android)
- Expo Location & ImagePicker
- JWT Authentication with refresh tokens
- Axios with request/response interceptors

## Quick Start

### 1. Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your phone
- OPOSSUM Backend running (see backend README)

### 2. Clone and Setup

```bash
git clone <repository-url>
cd opossum-project/mobile
npm install
```

### 3. Environment Variables

Create `.env` file in mobile directory:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://opossum-project.onrender.com

# App Configuration
EXPO_PUBLIC_APP_NAME=OPOSSUM
EXPO_PUBLIC_APP_VERSION=1.0.0

# Environment
EXPO_PUBLIC_ENVIRONMENT=development
```

### 4. Start Development

```bash
# Start Expo development server
npx expo start

# Scan QR code with Expo Go app on your phone
```

Scan QR code with Expo Go app to run on your device.

## Important Setup Notes

### Backend Connection (Critical)

The app requires the OPOSSUM backend running. Without it, authentication and all features will fail.

- Backend is deployed at: `https://opossum-project.onrender.com`
- Test connection: https://opossum-project.onrender.com/actuator/health should return 200
- For local development: change URL to `http://your-computer-ip:8080` (not localhost)

### Email Verification

Email verification works through production backend:

- Click email link → redirects to success screen in app
- Automatic verification, no manual token entry required
- Works on Expo Go without additional setup

### Photo Upload System

- **Camera**: Compressed to 60% quality for optimal upload speed
- **Gallery**: Compressed to 50% quality (already optimized)
- **File Size**: Automatically handles iPhone camera photos (2-4MB)
- **Storage**: Files uploaded to Cloudinary via backend

## App Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   │   ├── login.tsx      # Login screen
│   │   ├── register.tsx   # Registration screen
│   │   └── forgot-password.tsx
│   ├── (tabs)/            # Main app navigation
│   │   ├── dashboard/     # Home dashboard
│   │   ├── announcements/ # Browse & create
│   │   ├── map/          # Interactive map search
│   │   ├── messages/     # Conversations
│   │   └── profile/      # User account
│   └── _layout.tsx       # Root layout with providers
├── contexts/             # React Context providers
│   └── AuthContext.tsx   # Authentication state
├── services/             # API integration
│   ├── api.ts           # Axios setup with interceptors
│   ├── auth.ts          # Authentication endpoints
│   ├── announcement.ts   # CRUD operations
│   ├── messaging.ts     # Chat functionality
│   └── user.ts          # Profile management
├── types/               # TypeScript definitions
├── styles/              # Design system
└── utils/               # Storage and helpers
```

## Design System ("Oxblood Dreams")

The app uses a consistent design system with:

- **Primary**: Rich Oxblood (#800020) for main actions
- **Secondary**: Warm Taupe (#8B7D6B) for secondary elements
- **Background**: Soft Rose (#FAF7F0) for warm, welcoming feel
- **Typography**: System fonts with proper hierarchy
- **Icons**: Ionicons for consistent iconography

## Key Features

### Authentication

- Smart error detection (verification/credentials/network)
- Enhanced error display with specific user guidance
- One-click resend verification functionality
- Secure token storage with refresh logic

### Create Announcement Flow

- **Step 1**: Basic info (title, description, type, category)
- **Step 2**: Photos (camera/gallery with compression)
- **Step 3**: Location (GPS auto-detect or manual search)
- Form validation with real-time error feedback
- Success flow with proper navigation

### Interactive Map

- Google Maps integration with custom markers
- Color-coded markers (Red=LOST, Teal=FOUND)
- Advanced filtering (Type, Category, Distance)
- Bottom sheet with horizontal scrolling cards
- Location-based search with proximity filtering

### Messaging System

- Real-time conversations linked to announcements
- Clean chat interface with read receipts
- Message encryption handled by backend
- Professional conversation threading

### User Account Management

- Complete profile editing with photo upload
- My announcements management interface
- Multi-step account deletion with warnings
- Logout with proper token cleanup

## Testing

### Test Users (Backend)

- Regular User: `dodo` / `nono123`
- Admin User: `admin` / `admin123`

### Basic Test Flow

1. Register new account → verify email via deep link
2. Create announcement → add photos and location
3. Browse map → filter by categories and distance
4. View announcement details → contact owner
5. Start conversation → send messages
6. Test account management → profile editing

## API Integration

The app uses Axios with sophisticated interceptors:

```typescript
// Automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Automatically refresh token and retry request
    }
    return Promise.reject(error);
  }
);
```

### Error Handling

- Network timeout handling (30s default, 60s for uploads)
- Automatic retry for failed requests
- User-friendly error messages
- Graceful degradation for offline scenarios

## Platform Features

### Expo Go

- Cross-platform development with live reload
- Camera and location permissions handled automatically
- Real device testing without builds
- Photo upload with automatic compression

## Common Issues

**App won't connect to backend**: Check `EXPO_PUBLIC_API_BASE_URL` is correct and backend is running

**Photos won't upload**: Verify Cloudinary is configured in backend and file size limits

**Email verification fails**: Ensure `EXPO_PUBLIC_DEEP_LINK_SCHEME` matches backend redirect URLs

**Map not loading**: Check Google Maps API key is configured in backend for location services

**JWT token errors**: Clear app storage and re-login, ensure backend JWT_SECRET is configured

## Development

```bash
# Clear Expo cache
npx expo start --clear

# Run TypeScript checks
npx tsc --noEmit

# Reset Expo Go app data
# Go to Expo Go app → Settings → Clear cache
```

## Deployment

The app runs on Expo Go for development and testing. No builds required!

- **Development**: Uses production backend at Render
- **Testing**: Share QR code with team members
- **Demo**: Anyone with Expo Go can scan and test

For production deployment to app stores, you would need to:

1. Set up EAS Build
2. Configure app store accounts
3. Build native binaries

But for now, Expo Go provides everything needed for development and testing.

## Performance Notes

- **Image Optimization**: Automatic compression reduces bandwidth
- **Map Performance**: Efficient marker clustering for large datasets
- **Memory Management**: Proper cleanup of event listeners
- **Bundle Size**: Tree-shaking eliminates unused dependencies

## Security Features

- Secure token storage using Expo SecureStore
- Automatic token refresh prevents session timeouts
- Input validation on all forms
- Photo metadata stripping before upload
- Network request timeout protection
