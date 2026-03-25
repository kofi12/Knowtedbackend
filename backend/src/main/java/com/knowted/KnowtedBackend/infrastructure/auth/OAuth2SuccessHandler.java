package com.knowted.KnowtedBackend.infrastructure.auth;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Component
@SuppressWarnings("unused")
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    @Value("${frontend.redirect-url}")
    private String frontendRedirectUrl;
    @Autowired
    private StudentRepository studentRepository;

    public OAuth2SuccessHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        if (authentication instanceof OAuth2AuthenticationToken token) {
            OAuth2User principal = token.getPrincipal();
            Map<String, Object> attributes = principal.getAttributes();

            // 1. Extract Google's stable identifier (sub)
            String googleSub = (String) attributes.get("sub");
            if (googleSub == null) {
                // This should never happen with Google OpenID Connect
                throw new IllegalStateException("Google did not provide 'sub' claim");
            }

            String email = (String) attributes.get("email");
            String displayName = (String) attributes.getOrDefault("name", "");

            // 2. Use the repository to look for existing user
            Optional<Student> existingStudent = studentRepository
                    .findByProviderUserIdAndAuthProvider(googleSub, "google");

            Student student;

            if (existingStudent.isPresent()) {
                // Returning user – login
                student = existingStudent.get();

                // Optional: sync any changed profile info
                if (!Objects.equals(student.getEmail(), email)) {
                    student.setEmail(email);
                    studentRepository.save(student); // or only if you want to update
                }

            } else {
                // First time – signup (automatic account creation)
                student = Student.createFromGoogle(googleSub, email, displayName);
                student = studentRepository.save(student); // UUID is generated here
            }
            // Generate minimal JWT
            String jwt = jwtUtil.generateToken(
                    student.getStudentId(),
                    student.getEmail(),
                    student.getDisplayName()
            );

            ResponseCookie tokenCookie = ResponseCookie.from("token", jwt)
                    .httpOnly(true)
                    .secure(request.isSecure())
                    .sameSite("Lax")
                    .path("/")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, tokenCookie.toString());

            // Redirect to frontend with token in query param
            String targetUrl = frontendRedirectUrl + "?token=" + jwt;

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            super.onAuthenticationSuccess(request, response, authentication);
        }
    }
}
