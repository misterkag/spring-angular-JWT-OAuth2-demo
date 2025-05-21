package com.kag.springangularauth.security.jwt;

import com.kag.springangularauth.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtUtilsTest {

    private JwtUtils jwtUtils;

    private Authentication authentication;
    private UserDetailsImpl userDetails;
    private final String testSecretBase64 = "X8zJ0f9P3aH7dF5rT2sB6gJ1vX4kL9yW0uP8hN7mG5vB3cR1oI9sF6eD4jU2kL8zJ0f9P3aH7dF5rT2sB6gJ1vX4kL9yW==";
    private final int testExpirationMs = 3600000; // 1 heure

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecretString", testSecretBase64);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", testExpirationMs);
        jwtUtils.init();

        userDetails = new UserDetailsImpl(
                1L,
                "testuser",
                "test@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @Test
    void generateJwtToken_Success() {
        String token = jwtUtils.generateJwtToken(authentication);
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3);
    }

    @Test
    void getUserNameFromJwtToken_Success() {
        String token = jwtUtils.generateJwtToken(authentication);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        assertEquals("testuser", username);
    }

    @Test
    void validateJwtToken_ValidToken() {
        String token = jwtUtils.generateJwtToken(authentication);
        assertTrue(jwtUtils.validateJwtToken(token));
    }

    @Test
    void validateJwtToken_InvalidSignature() {
        String token = jwtUtils.generateJwtToken(authentication);

        JwtUtils jwtUtilsInvalidKey = new JwtUtils();
        String invalidSecret = "Y9aK1g0Q4bI8eG6sU3tC7hK2wY5lL0zX1vQ9iN8nH6wC4dS2pJ0tG7fE5kV3mL9aK1g0Q4bI8eG6sU3tC7hK2wY5lL0zX==";
        ReflectionTestUtils.setField(jwtUtilsInvalidKey, "jwtSecretString", invalidSecret);
        ReflectionTestUtils.setField(jwtUtilsInvalidKey, "jwtExpirationMs", testExpirationMs);
        jwtUtilsInvalidKey.init();

        assertFalse(jwtUtilsInvalidKey.validateJwtToken(token));
    }

    @Test
    void validateJwtToken_MalformedToken() {
        String malformedToken = "this.isnot.ajwt";
        assertFalse(jwtUtils.validateJwtToken(malformedToken));
    }

    @Test
    void validateJwtToken_ExpiredToken() throws InterruptedException {
        JwtUtils jwtUtilsShortExp = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtilsShortExp, "jwtSecretString", testSecretBase64);
        ReflectionTestUtils.setField(jwtUtilsShortExp, "jwtExpirationMs", 10); // 10 ms expiration
        jwtUtilsShortExp.init();
        
        String token = jwtUtilsShortExp.generateJwtToken(authentication);
        Thread.sleep(50);
    }

    @Test
    void validateJwtToken_UnsupportedToken() {
        String unsupportedToken = "";
        assertFalse(jwtUtils.validateJwtToken(unsupportedToken));
    }

    @Test
    void validateJwtToken_EmptyClaims() {
        String nonJwt = "just a random string";
        assertFalse(jwtUtils.validateJwtToken(nonJwt));
    }
} 