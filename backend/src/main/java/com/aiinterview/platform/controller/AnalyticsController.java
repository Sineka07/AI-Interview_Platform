package com.aiinterview.platform.controller;

import com.aiinterview.platform.dto.InterviewDtos.DashboardStatsDto;
import com.aiinterview.platform.model.User;
import com.aiinterview.platform.service.AuthService;
import com.aiinterview.platform.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    private final InterviewService interviewService;
    private final AuthService authService;

    public AnalyticsController(InterviewService interviewService, AuthService authService) {
        this.interviewService = interviewService;
        this.authService = authService;
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AI Interview Preparation Platform",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboard(Authentication authentication) {
        User user = authService.getUserByEmail(authentication.getName());
        DashboardStatsDto stats = interviewService.getDashboardStats(user);
        return ResponseEntity.ok(stats);
    }
}
