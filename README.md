# OPOSSUM - Lost & Found Platform

> A complete, production-ready ecosystem for reporting and recovering lost items with real-time messaging, GPS-based search, and comprehensive administrative oversight.

[![Backend Status](https://img.shields.io/badge/Backend-Live-brightgreen?style=flat-square)](https://opossum-project.onrender.com/actuator/health)
[![Admin Interface](https://img.shields.io/badge/Admin-Live-brightgreen?style=flat-square)](https://opossum-admin-b01lfhtqf-moefedailys-projects.vercel.app)
[![Mobile App](https://img.shields.io/badge/Mobile-Complete-blue?style=flat-square)](#mobile-application)

## Overview

OPOSSUM is a multi-platform lost and found application that connects people who have lost items with those who have found them. Built with modern technologies and enterprise-grade architecture, it provides a seamless experience across mobile and web platforms.

### **Key Features**

- **Mobile App**: React Native/Expo app for posting and finding lost items
- **Admin Interface**: Angular web application for platform management
- **Backend API**: Spring Boot REST API with comprehensive functionality
- **GPS Integration**: Location-based search with interactive maps
- **Messaging**: Encrypted conversations between users
- ** Photo Management**: Cloud-based image storage with automatic optimization
- **Security**: JWT authentication with role-based access control

## Live Demo

| Platform            | URL                                                                                         | Credentials                 |
| ------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| **Admin Interface** | [opossum-admin.vercel.app](https://opossum-admin-b01lfhtqf-moefedailys-projects.vercel.app) | `admin` / `admin123`        |
| **Backend API**     | [opossum-project.onrender.com](https://opossum-project.onrender.com)                        | API Documentation available |
| **Mobile App**      | Expo Go (See mobile README)                                                                 | `dodo` / `nono123`          |

## Architecture

```
OPOSSUM Platform
├── Mobile App (React Native/Expo)
│   ├── User authentication & profiles
│   ├── Create & browse announcements
│   ├── Interactive map search
│   ├── Real-time messaging
│   └── Photo upload with GPS
│
├── Admin Interface (Angular 17+)
│   ├── User management & roles
│   ├── Content moderation
│   ├── Message oversight
│   ├── Analytics dashboard
│   └── Platform administration
│
└── Backend API (Spring Boot 3.2)
    ├── RESTful API endpoints
    ├── PostgreSQL database
    ├── JWT authentication
    ├── File storage (Cloudinary)
    ├── Email service (SMTP)
    └── Message encryption
```

## Technology Stack

### Backend

- **Java 17** - Modern JVM with latest features
- **Spring Boot 3.2** - Enterprise-grade framework
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **Cloudinary** - Cloud-based file storage
- **Docker** - Containerization

### Mobile App

- **React Native** - Cross-platform mobile development
- **Expo 50+** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation
- **React Native Maps** - Interactive mapping

### Admin Interface

- **Angular 17+** - Modern web framework
- **TypeScript 5.7+** - Enhanced type safety
- **Angular Material** - UI component library
- **RxJS** - Reactive programming
- **SCSS** - Advanced styling

### Infrastructure

- **Render** - Backend hosting with managed PostgreSQL
- **Vercel** - Frontend hosting with global CDN
- **Cloudinary** - Image CDN and processing
- **Gmail SMTP** - Email delivery service

## Project Structure

```
opossum-project/
├── 📁 backend/                 # Spring Boot REST API
│   ├── src/main/java/com/opossum/
│   │   ├── controller/         # REST endpoints
│   │   ├── service/           # Business logic
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Data access layer
│   │   ├── dto/              # Data transfer objects
│   │   ├── security/         # Authentication & authorization
│   │   └── config/           # Application configuration
│   ├── src/main/resources/
│   │   ├── templates/email/  # Email templates
│   │   └── application.properties
│   ├── Dockerfile
│   └── README.md
│
├── 📁 mobile/                  # React Native/Expo app
│   ├── app/                   # Expo Router screens
│   │   ├── (auth)/           # Authentication flow
│   │   └── (tabs)/           # Main app navigation
│   ├── contexts/             # React Context providers
│   ├── services/             # API integration
│   ├── types/                # TypeScript definitions
│   ├── styles/               # Design system
│   └── README.md
│
├── 📁 admin-web/              # Angular admin interface
│   ├── src/app/
│   │   ├── core/             # Core services & guards
│   │   ├── features/         # Feature modules
│   │   ├── layout/           # Application layout
│   │   └── shared/           # Shared components
│   ├── src/environments/     # Environment configs
│   ├── src/styles/          # Design system
│   ├── vercel.json          # Deployment config
│   └── README.md
│
├── 📁 docs/                   # Documentation
│   ├── api/                  # API documentation
│   ├── database/             # Database schema
│   └── deployment/           # Deployment guides
│
├── 📄 docker-compose.yml     # Local development stack
├── 📄 .gitignore
└── 📄 README.md              # This file
```

## Quick Start

### Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend applications)
- **Docker & Docker Compose** (for local database)
- **Git** (for version control)

### 1. Clone Repository

```bash
git clone <repository-url>
cd opossum-project
```

### 2. Start Backend

```bash
cd backend

# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL
docker-compose up -d

# Run backend
./mvnw spring-boot:run
```

Backend will be available at `http://localhost:8080`

### 3. Start Admin Interface

```bash
cd admin-web

# Install dependencies
npm install

# Start development server
ng serve
```

Admin interface will be available at `http://localhost:4200`

### 4. Start Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

Scan QR code with Expo Go app on your device.

## Component Documentation

Each component has detailed documentation in its respective directory:

- **📁 [Backend Documentation](./backend/README.md)** - REST API, database schema, deployment
- **📁 [Mobile App Documentation](./mobile/README.md)** - React Native setup, features, testing
- **📁 [Admin Interface Documentation](./admin-web/README.md)** - Angular setup, features, deployment

## Design System

The entire platform uses the **"Oxblood Dreams"** design system for consistent branding:

- **Primary**: Rich Oxblood (#800020) - Main actions and branding
- **Secondary**: Warm Taupe (#8B7D6B) - Secondary elements
- **Background**: Soft Rose (#FAF7F0) - Warm, welcoming atmosphere
- **Success**: Forest Green (#228B22) - Positive actions
- **Warning**: Amber (#FFC107) - Caution states
- **Danger**: Deep Red (#DC3545) - Destructive actions

## Security Features

### Authentication & Authorization

- **JWT Tokens** with automatic refresh
- **Role-based Access Control** (USER/ADMIN)
- **Password Hashing** with Argon2
- **Email Verification** for account security
- **Session Management** with secure logout

### Data Protection

- **AES-256 Encryption** for sensitive messages
- **Input Validation** on all endpoints
- **SQL Injection Prevention** through JPA
- **XSS Protection** via framework sanitization
- **File Upload Security** with type validation

### Infrastructure Security

- **HTTPS Encryption** for all communications
- **CORS Configuration** for controlled access
- **Environment Variables** for sensitive config
- **Database Security** with connection pooling

## Key Features

### For End Users (Mobile App)

#### **Authentication**

- Secure registration with email verification
- Password reset with email recovery
- Persistent login with token refresh
- Account management and deletion

#### **Announcements**

- Create lost/found item posts with photos
- GPS location tracking and manual entry
- Category selection from 13 predefined types
- Edit and delete personal announcements

#### **Search & Discovery**

- Browse all announcements with filtering
- Interactive map with location-based search
- Advanced filters (type, category, distance)
- Real-time results with pull-to-refresh

#### **Communication**## 📈 Performance

### Metrics

- **Backend Response Time**: < 200ms average
- \*\*Admin Load T
- Direct messaging with item owners/finders
- End-to-end encrypted conversations
- Real-time message updates
- Message history and management

#### **Profile Management**

- Edit personal information and photos
- View and manage personal announcements
- Account settings and preferences
- Privacy controls and data management

### For Administrators (Web Interface)

#### **User Management**

- Complete user lifecycle management
- Role assignment (USER ↔ ADMIN)
- Account activation/deactivation
- Advanced filtering and search

#### **Content Moderation**

- Review all platform announcements
- Activate/deactivate inappropriate content
- Delete policy-violating posts
- Image gallery viewing and management

#### **Message Oversight**

- Monitor platform conversations
- Manage conversation status (ACTIVE/ARCHIVED/BLOCKED)
- Delete inappropriate messages
- Content moderation tools

#### **Analytics Dashboard**

- Real-time platform statistics
- User engagement metrics
- Content performance insights
- System health monitoring

## Testing

### Backend Testing

```bash
cd backend
./mvnw test                    # Unit tests
```

### Frontend Testing

```bash
# Admin Interface
cd admin-web
ng test                        # Unit tests

# Mobile App
cd mobile
npm test                       # Component tests
```

### API Testing

- **Postman Collection**: Import `postman_collection_clean.json`
- **Swagger UI**: Available at `/swagger-ui/index.html`
- **Health Check**: Available at `/actuator/health`

## Deployment

### Production Deployments

The platform is deployed across multiple cloud providers for optimal performance:

#### Backend (Render)

- **URL**: https://opossum-project.onrender.com
- **Database**: Managed PostgreSQL with backups
- **Environment**: Production with SSL termination
- **Monitoring**: Health checks and logging

#### Admin Interface (Vercel)

- **URL**: https://opossum-admin-b01lfhtqf-moefedailys-projects.vercel.app
- **CDN**: Global edge network for fast loading
- **SSL**: Automatic HTTPS with certificates
- **Build**: Optimized Angular production build

#### Mobile App

- **Platform**: Expo Go for development/testing
- **Distribution**: Ready for App Store/Play Store deployment
- **Updates**: Over-the-air updates capability

### Local Development

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start each component individually
cd backend && ./mvnw spring-boot:run    # Backend on :8080
cd admin-web && ng serve                # Admin on :4200
cd mobile && npx expo start             # Mobile with QR code
```

ime\*\*: < 2 seconds globally

- **Mobile Performance**: 60fps smooth interactions
- **Database Queries**: Optimized with proper indexing
- **Image Delivery**: CDN-optimized with compression

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/woow-feature`)
3. Make your changes with tests
4. Commit your changes (`git commit -m 'Add woow feature'`)
5. Push to the branch (`git push origin feature/woow-feature`)
6. Open a Pull Request

### Code Standards

- **TypeScript** for type safety across all platforms
- **ESLint & Prettier** for consistent code formatting
- **Conventional Commits** for clear commit messages
- **Test Coverage** minimum 80% for new features
- **Documentation** updates for new features

## 🔗 Links

- **API Documentation**: https://opossum-project.onrender.com/swagger-ui/index.html
- **Admin Interface**: https://opossum-admin-b01lfhtqf-moefedailys-projects.vercel.app
- **Backend Health**: https://opossum-project.onrender.com/actuator/health
- **Mobile Setup**: [Mobile README](./mobile/README.md)
- **Backend Setup**: [Backend README](./backend/README.md)
- **Admin Setup**: [Admin README](./admin-web/README.md)

**Built with love , curiosity, and lots of coffee ☕☕☕☕☕**
