# Class Diagram - Security and Authentication

```mermaid
classDiagram
    class SecurityConfig {
      -JwtAuthenticationFilter jwtAuthenticationFilter
      -OAuth2SuccessHandler oAuth2SuccessHandler
      +securityFilterChain(HttpSecurity http, JwtDecoder jwtDecoder) SecurityFilterChain
      +jwtDecoder(String secret) JwtDecoder
      +bearerTokenResolver() BearerTokenResolver
      +corsConfigurationSource() CorsConfigurationSource
    }

    class JwtAuthenticationFilter {
      -JwtUtil jwtUtil
      -UserDetailsService userDetailsService
      +doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) void
      +shouldNotFilter(HttpServletRequest request) boolean
    }

    class JwtUtil {
      -SecretKey key
      -long expirationMs
      +generateToken(UUID studentId, String email, String displayName) String
      +validateToken(String token) boolean
      +getSubject(String token) String
      +getExpiration(String token) Date
    }

    class OAuth2SuccessHandler {
      -JwtUtil jwtUtil
      -StudentRepository studentRepository
      -String frontendRedirectUrl
      +onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) void
    }

    class StudentUserDetailsService {
      -StudentRepository studentRepository
      +loadUserByUsername(String username) UserDetails
    }

    class StudentRepository
    class JwtDecoder
    class BearerTokenResolver

    SecurityConfig --> JwtAuthenticationFilter
    SecurityConfig --> OAuth2SuccessHandler
    SecurityConfig --> JwtDecoder
    SecurityConfig --> BearerTokenResolver

    JwtAuthenticationFilter --> JwtUtil
    JwtAuthenticationFilter --> StudentUserDetailsService
    StudentUserDetailsService --> StudentRepository

    OAuth2SuccessHandler --> JwtUtil
    OAuth2SuccessHandler --> StudentRepository
```

## Notes
- `SecurityConfig` combines OAuth2 login and resource-server JWT verification.
- `OAuth2SuccessHandler` issues JWT after Google login and redirects frontend.
- `JwtAuthenticationFilter` provides compatibility authentication from bearer token.
