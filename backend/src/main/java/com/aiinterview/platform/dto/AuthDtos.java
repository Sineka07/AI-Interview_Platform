package com.aiinterview.platform.dto;

import com.aiinterview.platform.model.Role;

public class AuthDtos {

    public static class RegisterRequest {
        private String email;
        private String password;
        private String fullName;
        private String college;
        private String targetRole;
        private String role; // "ROLE_STUDENT" or "ROLE_ADMIN"

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String fullName;
        private Role role;
        private String targetRole;

        public AuthResponse(String token, Long userId, String email, String fullName, Role role, String targetRole) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.targetRole = targetRole;
        }

        public String getToken() { return token; }
        public Long getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public Role getRole() { return role; }
        public String getTargetRole() { return targetRole; }
    }

    public static class UpdateProfileRequest {
        private String fullName;
        private String college;
        private String targetRole;
        private String resumeText;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getCollege() { return college; }
        public void setCollege(String college) { this.college = college; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public String getResumeText() { return resumeText; }
        public void setResumeText(String resumeText) { this.resumeText = resumeText; }
    }
}
