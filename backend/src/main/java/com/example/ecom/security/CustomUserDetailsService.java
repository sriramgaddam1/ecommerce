package com.example.ecom.security;

import java.util.Arrays;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.ecom.model.User;
import com.example.ecom.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        // Try to find by username first, then by email
        Optional<User> user = userRepository.findByUsername(username);
        if (!user.isPresent()) {
            user = userRepository.findByEmail(username);
        }

        User foundUser = user.orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                foundUser.getUsername(),
                foundUser.getPassword(),
                Arrays.asList(new SimpleGrantedAuthority(foundUser.getRole()))
        );
    }
}
