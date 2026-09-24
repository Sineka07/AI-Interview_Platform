package com.aiinterview.platform.controller;

import com.aiinterview.platform.dto.InterviewDtos.*;
import com.aiinterview.platform.model.Interview;
import com.aiinterview.platform.model.User;
import com.aiinterview.platform.service.AuthService;
import com.aiinterview.platform.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;
    private final AuthService authService;

    public InterviewController(InterviewService interviewService, AuthService authService) {
        this.interviewService = interviewService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> createInterview(Authentication authentication, @RequestBody CreateInterviewRequest request) {
        User user = authService.getUserByEmail(authentication.getName());
        Interview interview = interviewService.createInterview(user, request);
        return ResponseEntity.ok(Map.of(
                "interviewId", interview.getId(),
                "title", interview.getTitle(),
                "roleTarget", interview.getRoleTarget(),
                "difficulty", interview.getDifficulty(),
                "category", interview.getCategory(),
                "questionCount", interview.getQuestionCount()
        ));
    }

    @GetMapping
    public ResponseEntity<List<InterviewSummaryItemDto>> getUserInterviews(Authentication authentication) {
        User user = authService.getUserByEmail(authentication.getName());
        List<InterviewSummaryItemDto> list = interviewService.getUserInterviews(user);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionDto>> getInterviewQuestions(Authentication authentication, @PathVariable Long id) {
        User user = authService.getUserByEmail(authentication.getName());
        List<QuestionDto> questions = interviewService.getInterviewQuestions(id, user);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/{id}/answer")
    public ResponseEntity<?> submitAnswer(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody SubmitAnswerRequest request) {
        User user = authService.getUserByEmail(authentication.getName());
        QuestionFeedbackDto feedback = interviewService.submitAnswer(id, request, user);
        return ResponseEntity.ok(feedback);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeInterview(Authentication authentication, @PathVariable Long id) {
        User user = authService.getUserByEmail(authentication.getName());
        FullInterviewReportDto report = interviewService.completeInterview(id, user);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<?> getInterviewReport(Authentication authentication, @PathVariable Long id) {
        User user = authService.getUserByEmail(authentication.getName());
        FullInterviewReportDto report = interviewService.getInterviewReport(id, user);
        return ResponseEntity.ok(report);
    }
}
