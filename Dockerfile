# Stage 1: Build the JAR with Gradle
FROM gradle:8.10-jdk21 AS builder

# Set working directory
WORKDIR /app

# Copy Gradle files first (cache dependencies)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# Download dependencies (cached if Gradle files unchanged)
RUN gradle dependencies --no-daemon

# Copy source code
COPY src ./src

# Build the executable Spring Boot JAR
# -x test = skip tests (run them in CI, not in Docker build)
RUN gradle clean bootJar --no-daemon -x test

# Stage 2: Small runtime image (only JRE, no Gradle)
FROM eclipse-temurin:21-jre-alpine

# Create non-root user (security best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the built JAR from builder stage
# --chown gives ownership to non-root user
COPY --from=builder --chown=appuser:appgroup /app/build/libs/*.jar app.jar

# Switch to non-root user
USER appuser

# Expose default Spring Boot port
EXPOSE 8080

# Run the app (exec form for proper signal handling)
ENTRYPOINT ["java", "-jar", "app.jar"]