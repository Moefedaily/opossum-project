package com.opossum.security;

import com.opossum.entity.User;
import com.opossum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        log.debug("Loading user by login: {}", login);

        // Try to find user by username first, then by email
        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> {
                    log.error("User not found with login: {}", login);
                    return new UsernameNotFoundException("User not found with login: " + login);
                });

        log.debug("User found: {} (ID: {})", user.getUsername(), user.getId());

        // Create UserDetails with authorities
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .authorities(getUserAuthorities(user))
                .accountExpired(!user.isAccountNonExpired())
                .accountLocked(!user.isAccountNonLocked())
                .credentialsExpired(!user.isCredentialsNonExpired())
                .disabled(!user.isEnabled())
                .build();
    }

    // Get user authorities/roles
    private List<SimpleGrantedAuthority> getUserAuthorities(User user) {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Transactional(readOnly = true)
    public User getUserEntity(String login) {
        return userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + login));
    }
}