package com.kag.springangularauth.security.oauth2;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User extends User implements OAuth2User {
    private Long id;
    private Map<String, Object> attributes;

    public CustomOAuth2User(Long id, String email, String password, Collection<? extends GrantedAuthority> authorities, Map<String, Object> attributes) {
        super(email, password, authorities);
        this.id = id;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<GrantedAuthority> getAuthorities() {
        return super.getAuthorities();
    }

    @Override
    public String getName() {
        return String.valueOf(id);
    }
} 