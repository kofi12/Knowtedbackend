package com.knowted.KnowtedBackend.infrastructure.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Utility class for generating, validating, and parsing JWT tokens.
 * Tokens use HMAC-SHA512 and include the internal student UUID as subject.
 */
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:3600000}") long expirationMs) {
        // Ensure secret is at least 256 bits (32 bytes) for HS512
        if (secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters long for HS512");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Generates a JWT for the authenticated student.
     *
     * @param studentId      Internal student UUID (as string)
     * @param email          Student's email (from Google)
     * @param displayName    Student's display name (from Google)
     * @return Signed JWT token
     */
    public String generateToken(UUID studentId, String email, String displayName) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(studentId.toString())              // Primary identifier
                .claim("email", email)                      // For frontend display
                .claim("display_name", displayName)         // For frontend display
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    /**
     * Extracts the subject (student UUID string) from a valid JWT.
     *
     * @param token The JWT token
     * @return The subject (student UUID as string)
     * @throws JwtException if token is invalid/expired
     */
    public String getSubject(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Validates the token signature and expiration.
     *
     * @param token The JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            // Log if needed: token expired
            return false;
        } catch (JwtException e) {
            // Signature invalid, malformed, etc.
            return false;
        }
    }

    /**
     * Gets the expiration time from the token (without full validation).
     * Useful for frontend to know when to refresh.
     *
     * @param token The JWT token
     * @return Expiration date or null if invalid
     */
    public Date getExpiration(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();
        } catch (JwtException e) {
            return null;
        }
    }
}