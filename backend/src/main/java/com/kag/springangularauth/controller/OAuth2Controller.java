package com.kag.springangularauth.controller;

import com.kag.springangularauth.security.jwt.JwtUtils;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth/oauth2")
public class OAuth2Controller {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2Controller.class);

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/success")
    public void oauth2Success(HttpServletResponse response) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            logger.error("OAuth2 success but no authentication found in context.");
            response.sendRedirect("http://localhost:4200/login?error=authentication_failure");
            return;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof OAuth2User)) {
            logger.error("OAuth2 principal is not an instance of OAuth2User: {}", principal.getClass().getName());
            response.sendRedirect("http://localhost:4200/login?error=principal_type_mismatch");
            return;
        }

        String jwt = jwtUtils.generateJwtToken(authentication);
        logger.info("OAuth2 authentication successful, JWT generated for user: {}", authentication.getName());

        String frontendRedirectUrl = "http://localhost:4200/oauth2/callback?token=" + jwt;
        response.sendRedirect(frontendRedirectUrl);
    }

    @GetMapping("/failure")
    public void oauth2Failure(HttpServletResponse response) throws IOException {
        logger.error("OAuth2 authentication failed");
        response.sendRedirect("http://localhost:4200/login?error=oauth2_failure");
    }
} 