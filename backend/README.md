# OPOSSUM Backend

REST API for a lost and found items application. Users can report lost/found objects, upload photos, search by location, and message each other about items.

## What's Built

- **User Management**: Registration, login, email verification, password reset
- **Authentication**: JWT tokens with role-based access (USER/ADMIN)
- **Announcements**: CRUD operations for lost/found items with GPS coordinates
- **File Upload**: Photo storage via Cloudinary with automatic thumbnails
- **Messaging**: Encrypted user-to-user conversations linked to announcements
- **Location Search**: Find nearby items using distance calculations
- **Categories**: 13 predefined item categories (electronics, clothing, etc.)

## Tech Stack

- Java 17
- Spring Boot 3.2
- PostgreSQL
- JWT Authentication
- Cloudinary (file storage)
- Docker

## Quick Start

### 1. Prerequisites

```bash
- Java 17+
- Docker & Docker Compose
- PostgreSQL (via Docker)
```

### 2. Clone and Setup

```bash
git clone <repository-url>
cd opossum-project/backend
```

### 3. Environment Variables

Create `.env` file in project root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=opossum_db
DB_USERNAME=opossum_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-jwt-secret-key-at-least-256-bits-long
JWT_EXPIRATION=86400000

# Email (Gmail SMTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=OPOSSUM Support
MAIL_BASE_URL=http://localhost:8080

# Cloudinary (REQUIRED)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# File Upload
MAX_FILE_SIZE=10485760
```

### 4. Start Database

```bash
docker-compose up -d
```

### 5. Run Application

```bash
./mvnw spring-boot:run
```

Application starts at `http://localhost:8080`

## Cloudinary Setup (Important)

The app requires Cloudinary for photo storage. Without it, file uploads will fail.

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from dashboard
3. Add them to your `.env` file
4. That's it - the app handles the rest

## API Documentation

- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **Health Check**: http://localhost:8080/actuator/health

## Testing with Postman

Import the collection and environment from project root:

- `postman_collection_clean.json`
- `postman_environment_clean.json`

### Test Users

- **Regular User**: `dodo` / `nono123`
- **Admin User**: `admin` / `admin123`

### Basic Test Flow

1. Login as user → creates announcement
2. Login as different user → starts conversation about announcement
3. Send messages back and forth
4. Test file uploads, GPS search, etc.

The collection includes token switching and automated variable extraction.

## Key Endpoints

### Authentication

```
POST /api/auth/register     # Sign up
POST /api/auth/login        # Sign in
GET  /api/auth/me          # Current user info
```

### Announcements

```
GET    /api/announcements                    # List all
POST   /api/announcements                    # Create new
GET    /api/announcements/nearby             # Search by location
GET    /api/announcements/sorted-by-distance # Sort by distance
```

### Messaging

```
POST /api/conversations/start      # Start conversation
GET  /api/conversations           # User's conversations
POST /api/messages                # Send message
GET  /api/messages/conversation/{id} # Get conversation messages
```

### Files

```
POST /api/files/upload            # Upload photo
GET  /api/files/announcement/{id} # Get announcement photos
```

## Database

Uses PostgreSQL with these main tables:

- `ops_users` - User accounts and authentication
- `ops_announcements` - Lost/found items with GPS data
- `ops_conversations` - User-to-user conversations
- `ops_messages` - Individual messages (AES encrypted)
- `ops_files` - Photo metadata (files stored in Cloudinary)

## Security Features

- Argon2 password hashing
- JWT tokens with role-based access
- AES-256 message encryption
- File upload validation
- CORS configuration
- Input validation on all endpoints

## Common Issues

**App won't start**: Check your `.env` file has all required variables

**File upload fails**: Verify Cloudinary credentials are correct

**Email not sending**: Use Gmail app password, not regular password

**Database connection error**: Make sure PostgreSQL container is running

**JWT errors**: Ensure JWT_SECRET is at least 32 characters long

## Development

```bash
# Run tests
./mvnw test

# Package jar
./mvnw package

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Docker Build

```bash
docker build -t opossum-backend .
docker run -p 8080:8080 --env-file .env opossum-backend
```
