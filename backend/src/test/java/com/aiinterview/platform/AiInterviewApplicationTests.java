package com.aiinterview.platform;

import com.aiinterview.platform.dto.AuthDtos.*;
import com.aiinterview.platform.dto.InterviewDtos.*;
import com.aiinterview.platform.model.Difficulty;
import com.aiinterview.platform.model.InterviewCategory;
import com.aiinterview.platform.model.Role;
import com.aiinterview.platform.model.User;
import com.aiinterview.platform.service.AuthService;
import com.aiinterview.platform.service.InterviewService;
import com.aiinterview.platform.service.SpeechMetricsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
class AiInterviewApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private SpeechMetricsService speechMetricsService;

    @Test
    void testSpeechMetricsFillerAndWpm() {
        String testSpeech = "Well, um, basically I used Spring Boot and like MySQL to build the REST API. Actually, it was great.";
        int fillers = speechMetricsService.countFillerWords(testSpeech);
        assertTrue(fillers >= 3, "Should detect filler words 'um', 'basically', 'like', 'actually'");

        int wpm = speechMetricsService.calculateWpm(testSpeech, 15);
        assertTrue(wpm > 50, "WPM should be calculated correctly based on duration");

        double commScore = speechMetricsService.calculateCommunicationScore(wpm, fillers, 18);
        assertTrue(commScore >= 20.0 && commScore <= 100.0, "Communication score should be within 20-100");
    }

    @Test
    void testCompleteInterviewFlow() {
        // 1. Register Candidate
        String email = "candidate" + System.currentTimeMillis() + "@test.edu";
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail(email);
        registerReq.setPassword("Password@123");
        registerReq.setFullName("Aditya Sharma");
        registerReq.setCollege("IIT Madras");
        registerReq.setTargetRole("Software Development Engineer");
        registerReq.setRole("ROLE_STUDENT");

        AuthResponse authRes = authService.register(registerReq);
        assertNotNull(authRes.getToken(), "JWT Token must be generated");
        assertEquals(email, authRes.getEmail());

        // 2. Retrieve User Entity
        User user = authService.getUserByEmail(email);
        assertNotNull(user);

        // 3. Create Interview Session
        CreateInterviewRequest createReq = new CreateInterviewRequest();
        createReq.setTitle("SDE Placement Mock 1");
        createReq.setRoleTarget("Software Development Engineer");
        createReq.setDifficulty(Difficulty.MEDIUM);
        createReq.setCategory(InterviewCategory.MIXED);
        createReq.setQuestionCount(3);
        createReq.setResumeOverride("Proficient in Java, Spring Boot, MySQL, Data Structures, and REST APIs.");

        var interview = interviewService.createInterview(user, createReq);
        assertNotNull(interview.getId(), "Interview ID should be generated");
        assertNotNull(interview.getQuestions());
        assertEquals(3, interview.getQuestions().size(), "Should have generated 3 questions");

        // 4. Retrieve Questions
        List<QuestionDto> questions = interviewService.getInterviewQuestions(interview.getId(), user);
        assertEquals(3, questions.size());

        // 5. Submit Answers for all questions with MediaPipe telemetry
        for (QuestionDto q : questions) {
            SubmitAnswerRequest answerReq = new SubmitAnswerRequest();
            answerReq.setQuestionId(q.getId());
            answerReq.setAnswerText("In our project, we implemented Dependency Injection using Spring Boot constructor injection. This decoupled our service layer from repositories and allowed us to write thorough unit tests with mockito. We also indexed foreign keys in MySQL to reduce latency by 45%.");
            answerReq.setDurationSeconds(35);
            answerReq.setEyeContactPercentage(85.0);
            answerReq.setPostureScore(90.0);
            answerReq.setConfidenceScore(88.0);
            answerReq.setFillerCount(1);

            QuestionFeedbackDto feedback = interviewService.submitAnswer(interview.getId(), answerReq, user);
            assertNotNull(feedback);
            assertTrue(feedback.getScore() > 0, "Score should be calculated");
            assertNotNull(feedback.getCritique());
            assertNotNull(feedback.getIdealAnswer());
        }

        // 6. Complete Interview & Generate Final Report
        FullInterviewReportDto report = interviewService.completeInterview(interview.getId(), user);
        assertNotNull(report);
        assertTrue(report.getOverallScore() >= 50.0, "Overall score should be evaluated");
        assertNotNull(report.getPlacementReadiness());
        assertNotNull(report.getFeedbackSummary());
        assertNotNull(report.getStrengths());
        assertNotNull(report.getImprovements());
        assertEquals(3, report.getQuestions().size());

        // 7. Test Dashboard Stats
        DashboardStatsDto dashboard = interviewService.getDashboardStats(user);
        assertEquals(1, dashboard.getTotalInterviews());
        assertEquals(1, dashboard.getCompletedInterviews());
        assertTrue(dashboard.getAverageOverallScore() > 0);
    }
}
