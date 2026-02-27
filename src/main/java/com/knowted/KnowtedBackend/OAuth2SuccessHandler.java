package com.knowted.KnowtedBackend;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;


@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    @Value("${frontend.redirect-url}")
    private String frontendRedirectUrl;

    public OAuth2SuccessHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        if (authentication instanceof OAuth2AuthenticationToken token) {
            var attributes = token.getPrincipal().getAttributes();

            // Use email (or sub) as subject
            String email = (String) attributes.get("email");
            if (email == null) {
                email = (String) attributes.get("sub"); // fallback
            }

            // Generate minimal JWT
            String jwt = jwtUtil.generateToken(email);

            // Redirect to frontend with token in query param
            String targetUrl = frontendRedirectUrl + "?token=" + jwt;

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            super.onAuthenticationSuccess(request, response, authentication);
        }
    }
}
