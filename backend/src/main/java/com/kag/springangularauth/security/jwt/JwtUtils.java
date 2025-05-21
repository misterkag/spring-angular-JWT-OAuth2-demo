package com.kag.springangularauth.security.jwt;

import java.util.Date;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.kag.springangularauth.security.services.UserDetailsImpl;
import org.springframework.security.oauth2.core.user.OAuth2User;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecretString;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    private SecretKey key;

    @PostConstruct
    public void init() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(this.jwtSecretString);
            this.key = Keys.hmacShaKeyFor(keyBytes);
            logger.info("Clé secrète JWT initialisée avec succès.");
        } catch (Exception e) {
            logger.error("Erreur lors de l'initialisation de la clé secrète JWT à partir de la chaîne Base64: {}", e.getMessage());
            throw new RuntimeException("Impossible d'initialiser la clé secrète JWT", e);
        }
    }

    public String generateJwtToken(Authentication authentication) {
        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userPrincipal = (UserDetailsImpl) principal;
            username = userPrincipal.getUsername();
        } else if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            username = oauth2User.getAttribute("email");
            if (username == null) {
                logger.error("L'attribut email est null pour l'utilisateur OAuth2 lors de la génération du token JWT. Tentative d'utilisation du 'name'.");
                username = oauth2User.getName();
            }
        } else {
            logger.error("Type de Principal non supporté pour la génération du token JWT: {}",
                    (principal != null ? principal.getClass().getName() : "null"));
            throw new IllegalArgumentException("Impossible de générer un token JWT pour le type de Principal non supporté.");
        }

        if (username == null) {
            logger.error("Le nom d'utilisateur (username/email) est null après extraction du Principal pour la génération du token JWT.");
            throw new IllegalArgumentException("Le nom d'utilisateur (username/email) ne peut pas être null pour la génération du token JWT.");
        }

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
    
    public String generateTokenFromUsername(String username) {
        return Jwts.builder().setSubject(username).setIssuedAt(new Date())
            .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
            .signWith(key, SignatureAlgorithm.HS512)
            .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                   .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            logger.error("Signature ou Token JWT invalide: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expiré: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT non supporté: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("La chaîne des claims JWT est vide ou invalide: {}", e.getMessage());
        }
        return false;
    }

    public String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
} 