# Sequence Diagram - OAuth Login and JWT Issuance

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant Backend as Spring Security/OAuth2
    participant Google as Google OAuth2
    participant Success as OAuth2SuccessHandler
    participant StudentRepo as StudentRepository
    participant JwtUtil
    participant Frontend

    User->>Browser: Click "Login with Google"
    Browser->>Backend: GET /oauth2/authorization/google
    Backend->>Google: Redirect to Google auth
    Google-->>Browser: Redirect with auth code
    Browser->>Backend: GET /login/oauth2/code/google?code=...

    Backend->>Success: onAuthenticationSuccess(...)
    Success->>Google: Read principal attributes (sub, email, name)
    Success->>StudentRepo: findByProviderUserIdAndAuthProvider(sub, "google")
    alt Existing student
        StudentRepo-->>Success: student
        Success->>StudentRepo: save(...) only if email changed
    else First login
        Success->>StudentRepo: save(Student.createFromGoogle(...))
        StudentRepo-->>Success: student with UUID
    end

    Success->>JwtUtil: generateToken(studentId, email, displayName)
    JwtUtil-->>Success: signed JWT (HS512)
    Success-->>Browser: Set-Cookie token=<jwt>; HttpOnly
    Success-->>Browser: Redirect frontend.redirect-url?token=<jwt>
    Browser->>Frontend: Open redirected URL
```

## Result
- Student is created or updated.
- JWT is issued and returned to frontend via query parameter and cookie.
