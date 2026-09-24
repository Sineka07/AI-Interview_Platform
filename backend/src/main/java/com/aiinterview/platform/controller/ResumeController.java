package com.aiinterview.platform.controller;

import com.aiinterview.platform.model.User;
import com.aiinterview.platform.repository.UserRepository;
import com.aiinterview.platform.service.AiService;
import com.aiinterview.platform.service.AuthService;
import com.aiinterview.platform.service.ResumeParsingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    private final ResumeParsingService resumeParsingService;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final AiService aiService;

    public ResumeController(ResumeParsingService resumeParsingService,
                            UserRepository userRepository,
                            AuthService authService,
                            AiService aiService) {
        this.resumeParsingService = resumeParsingService;
        this.userRepository = userRepository;
        this.authService = authService;
        this.aiService = aiService;
    }

    /**
     * Upload resume file (.pdf, .txt) and extract skills, projects, and summary
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty or missing"));
            }

            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume";
            byte[] fileBytes = file.getBytes();
            String extractedText;

            if (originalFilename.toLowerCase().endsWith(".pdf")) {
                extractedText = resumeParsingService.extractTextFromPdf(fileBytes);
            } else {
                extractedText = new String(fileBytes, StandardCharsets.UTF_8);
            }

            ResumeParsingService.ParsedResume parsed = resumeParsingService.parseResume(extractedText);

            // Persist resume text to authenticated user
            User user = authService.getUserByEmail(authentication.getName());
            user.setResumeText(parsed.rawText());
            userRepository.save(user);

            logger.info("Successfully parsed resume for user {}: {} skills, {} projects",
                    user.getEmail(), parsed.skills().size(), parsed.projects().size());

            return ResponseEntity.ok(Map.of(
                    "filename", originalFilename,
                    "rawText", parsed.rawText(),
                    "skills", parsed.skills(),
                    "projects", parsed.projects(),
                    "experience", parsed.experience(),
                    "suggestedSummary", parsed.suggestedSummary()
            ));
        } catch (Exception e) {
            logger.error("Error processing resume upload", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to process resume: " + e.getMessage()));
        }
    }

    /**
     * Get currently stored resume for user
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentResume(Authentication authentication) {
        User user = authService.getUserByEmail(authentication.getName());
        String resumeText = user.getResumeText();
        if (resumeText == null || resumeText.isBlank()) {
            return ResponseEntity.ok(Map.of("hasResume", false));
        }

        ResumeParsingService.ParsedResume parsed = resumeParsingService.parseResume(resumeText);
        return ResponseEntity.ok(Map.of(
                "hasResume", true,
                "rawText", parsed.rawText(),
                "skills", parsed.skills(),
                "projects", parsed.projects(),
                "experience", parsed.experience(),
                "suggestedSummary", parsed.suggestedSummary()
        ));
    }

    /**
     * Generate concrete resume improvement suggestions
     */
    @PostMapping("/feedback")
    public ResponseEntity<?> getResumeFeedback(
            Authentication authentication,
            @RequestBody(required = false) Map<String, String> body) {
        User user = authService.getUserByEmail(authentication.getName());
        String resumeText = (body != null && body.containsKey("resumeText") && !body.get("resumeText").isBlank()) ?
                body.get("resumeText") : user.getResumeText();

        String targetRole = (body != null && body.containsKey("targetRole")) ?
                body.get("targetRole") : user.getTargetRole();

        String feedback = aiService.generateResumeFeedback(resumeText, targetRole != null ? targetRole : "Software Engineer");
        return ResponseEntity.ok(Map.of("resumeFeedback", feedback));
    }
}
