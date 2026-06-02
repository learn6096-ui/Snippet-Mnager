package com.snipvcs.service;

import com.snipvcs.dto.LoginRequest;
import com.snipvcs.dto.LoginResponse;
import com.snipvcs.dto.RegisterRequest;
import com.snipvcs.dto.UserResponse;
import com.snipvcs.exception.AuthenticationException;
import com.snipvcs.exception.DuplicateResourceException;
import com.snipvcs.exception.ResourceNotFoundException;
import com.snipvcs.model.User;
import com.snipvcs.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user with BCrypt-hashed password.
     * Throws if email or username already exists.
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailOrUsername(request.getEmail(), request.getUsername())) {
            throw new DuplicateResourceException("A user with this email or username already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        Long userId = userRepository.insert(request.getUsername(), request.getEmail(), hashedPassword);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        return UserResponse.fromUser(user);
    }

    /**
     * Authenticate a user by email + password.
     * Returns the user profile on success.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password");
        }

        return new LoginResponse("Login successful", UserResponse.fromUser(user));
    }

    /**
     * Fetch a user by ID. Throws if not found.
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserResponse.fromUser(user);
    }
}
