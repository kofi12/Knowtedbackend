package com.knowted.KnowtedBackend.infrastructure.auth;

import com.knowted.KnowtedBackend.domain.entity.Student;
import com.knowted.KnowtedBackend.domain.repository.StudentRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;                    // your existing util (for legacy/compatibility)
    private final UserDetailsService userDetailsService;  // ← new: loads full user + authorities

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            // 1. Validate & decode the token
            if (!jwtUtil.validateToken(token)) {
                // Optional: log warning
                filterChain.doFilter(request, response);
                return;
            }

            // 2. Extract subject (should be studentId UUID string)
            String subject = jwtUtil.getSubject(token);
            UUID studentId;

            try {
                studentId = UUID.fromString(subject);
            } catch (IllegalArgumentException e) {
                // Invalid UUID format in sub claim
                filterChain.doFilter(request, response);
                return;
            }

            // 3. Load full UserDetails (Student + authorities)
            UserDetails userDetails = userDetailsService.loadUserByUsername(subject);

            // 4. Create authenticated token
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,           // principal = full UserDetails
                            null,                  // no credentials needed
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 5. Set in SecurityContext → available in controllers/services
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            // Catch-all for any decoding/validation errors
            // Optional: log error
            SecurityContextHolder.clearContext();
            // You can send 401 here, but usually better to let chain continue and handle in @ControllerAdvice
        }

        filterChain.doFilter(request, response);
    }

    // Optional: override to skip filter for certain paths (login, oauth2 callback, public APIs)
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/") ||
                path.startsWith("/login/") ||
                path.startsWith("/oauth2/");
    }
}