# Know-ted Backend

Spring Boot backend for the Know-ted study platform.

## Requirements

- Java 21 (e.g., Eclipse Temurin / Adoptium)
- Gradle 8.10+ (wrapper included – `./gradlew`)

## Quick Start (Local Development)

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/knowted-backend.git
   cd knowted-backend


## Environment variables (secrets must be shared securely, do not commmit)
### Google OAuth credentials (from Google Cloud Console)

GOOGLE_CLIENT_ID=your-real-client-id

GOOGLE_CLIENT_SECRET=your-real-client-secret

### JWT secret – generate a strong one (at least 32 chars)

JWT_SECRET=your-secret

### Optional: frontend redirect after login

FRONTEND_REDIRECT_URL=https://knowtedfrontend-oimw-oy68n10tr-aaron-haizels-projects.vercel.app/dashboard?loggedIn=true

### Optional: server port
SERVER_PORT=8080


## Build and Run
 
 Build and start the server (downloads dependencies automatically)

./gradlew bootRun

Produces executable JAR in build/libs/

./gradlew bootJar

Run the jar manually

java -jar build/libs/knowted-backend-*.jar

Server runs at locally http://localhost:8080

Deployment pending
