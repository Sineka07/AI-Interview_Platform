package com.aiinterview.platform.controller;

import com.aiinterview.platform.dto.AuthDtos.*;
import com.aiinterview.platform.model.User;
import com.aiinterview.platform.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        User user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole(),
                "college", user.getCollege() != null ? user.getCollege() : "",
                "targetRole", user.getTargetRole() != null ? user.getTargetRole() : "Software Engineer",
                "hasResume", (user.getResumeText() != null && !user.getResumeText().isBlank()),
                "resumeText", user.getResumeText() != null ? user.getResumeText() : ""
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody UpdateProfileRequest request) {
        User updated = authService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "fullName", updated.getFullName(),
                "college", updated.getCollege() != null ? updated.getCollege() : "",
                "targetRole", updated.getTargetRole() != null ? updated.getTargetRole() : ""
        ));
    }
}
