package com.kag.springangularauth.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.kag.springangularauth.model.User;
import com.kag.springangularauth.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username or email: " + usernameOrEmail)));

        logger.info("User found in database...");
        logger.info("- ID: {}", user.getId());
        logger.info("- Username: {}", user.getUsername());
        logger.info("- Email: {}", user.getEmail());
        logger.info("- Mot de passe hashé: {}", user.getPassword() != null ? "[PRESENT]" : "[ABSENT]");
        logger.info("- Rôles: {}", user.getRoles());
        
        UserDetails userDetails = UserDetailsImpl.build(user);
        logger.info("UserDetails créé avec succès");
        logger.info("=== Fin du chargement de l'utilisateur ===");
        
        return userDetails;
    }
} 