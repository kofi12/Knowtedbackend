package com.knowted.KnowtedBackend.infrastructure.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

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
        String token = jwtUtil.generateToken("user@example.com");
        assertThat(token).isNotBlank();
    }

    @Test
    void getSubject_extractsSubjectFromToken() {
        String subject = "user@example.com";
        String token = jwtUtil.generateToken(subject);
        assertThat(jwtUtil.getSubject(token)).isEqualTo(subject);
    }

    @Test
    void validateToken_validToken_returnsTrue() {
        String token = jwtUtil.generateToken("test");
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
