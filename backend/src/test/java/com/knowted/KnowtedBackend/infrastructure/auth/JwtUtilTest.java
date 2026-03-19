package com.knowted.KnowtedBackend.infrastructure.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private static final String SECRET = "super-long-dummy-secret-for-tests-only-1234567890123456";
    private static final long EXPIRATION_MS = 3600000L;

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION_MS);
    }

    @Test
    void generateToken_producesValidToken() {
        String token = jwtUtil.generateToken(
                UUID.randomUUID(),              // dummy studentId
                "user@example.com",             // dummy email
                "Test User"                     // dummy display name
        );
        assertThat(token).isNotBlank();
    }

    @Test
    void getSubject_extractsSubjectFromToken() {
        UUID studentId = UUID.randomUUID();
        String token = jwtUtil.generateToken(studentId, "test@example.com", "Test Subject");
        assertThat(jwtUtil.getSubject(token)).isEqualTo(studentId.toString());
    }

    @Test
    void validateToken_validToken_returnsTrue() {
        String token = jwtUtil.generateToken(
                UUID.randomUUID(),
                "test@example.com",
                "Test"
        );
        assertThat(jwtUtil.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_invalidToken_returnsFalse() {
        assertThat(jwtUtil.validateToken("invalid.jwt.token")).isFalse();
    }

    @Test
    void validateToken_malformedToken_returnsFalse() {
        assertThat(jwtUtil.validateToken("not-a-jwt")).isFalse();
    }

    @Test
    void validateToken_emptyToken_returnsFalse() {
        assertThat(jwtUtil.validateToken("")).isFalse();
    }
}
