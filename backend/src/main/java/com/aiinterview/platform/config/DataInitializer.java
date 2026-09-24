package com.aiinterview.platform.config;

import com.aiinterview.platform.model.*;
import com.aiinterview.platform.repository.InterviewQuestionRepository;
import com.aiinterview.platform.repository.InterviewRepository;
import com.aiinterview.platform.repository.InterviewResponseRepository;
import com.aiinterview.platform.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewResponseRepository responseRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           InterviewRepository interviewRepository,
                           InterviewQuestionRepository questionRepository,
                           InterviewResponseRepository responseRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.responseRepository = responseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("student@example.com").isEmpty()) {
            // 1. Seed Demo Student
            User student = new User();
            student.setEmail("student@example.com");
            student.setPassword(passwordEncoder.encode("password123"));
            student.setFullName("Karthik Raman");
            student.setCollege("College of Engineering, Guindy");
            student.setTargetRole("Software Development Engineer (SDE)");
            student.setRole(Role.ROLE_STUDENT);
            student.setResumeText("Skills: Java, Spring Boot, React, MySQL, Data Structures, Algorithms, REST APIs, Git, Microservices.\nProjects: Full-stack E-Commerce portal, Real-time chat application with WebSockets.");
            student.setCreatedAt(LocalDateTime.now().minusDays(5));
            User savedStudent = userRepository.save(student);

            // 2. Seed a Sample Completed Interview for Rich Dashboard Experience
            Interview interview = new Interview();
            interview.setUser(savedStudent);
            interview.setTitle("Amazon SDE-1 Placement Mock");
            interview.setRoleTarget("Software Development Engineer (SDE)");
            interview.setDifficulty(Difficulty.MEDIUM);
            interview.setCategory(InterviewCategory.MIXED);
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setQuestionCount(3);
            interview.setOverallScore(84.0);
            interview.setTechnicalScore(86.0);
            interview.setCommunicationScore(82.0);
            interview.setConfidenceScore(85.0);
            interview.setPlacementReadiness("READY_FOR_PLACEMENTS");
            interview.setFeedbackSummary("Demonstrated strong grasp of OOP and Spring Boot architecture. Eye contact was consistent at 88% with clear verbal articulation.");
            interview.setStrengths("• Crisp explanation of dependency injection and database indexing\n• Maintained steady eye contact with the camera\n• Structured problem-solving mindset");
            interview.setImprovements("• Reduce filler words ('um', 'like') by pausing before complex answers\n• Explicitly state time and space complexity upfront");
            interview.setResumeFeedback("### 🎯 Resume Optimization & ATS Review for Software Development Engineer (SDE)\n\n#### 🟢 What to Add (High Impact for Placements)\n• **Quantifiable Metrics**: Add metrics showing the business or performance impact of your work (e.g., 'Reduced response latency by 35% through Redis caching' or 'Handled 5,000+ daily requests').\n• **Testing & CI/CD**: Explicitly list automated testing frameworks (JUnit 5, Mockito, Jest) and deployment pipelines (Docker, GitHub Actions).\n• **Live Demo / GitHub Links**: Add clickable links to live deployed applications and clean Git repositories.\n\n#### 🔴 What to Remove\n• **High School Details**: Remove 10th/12th grade school details; focus 100% on undergraduate projects and internships.\n• **Generic Objective Statements**: Replace outdated objectives with a concise 2-line Technical Summary.\n\n#### 🔵 What to Rephrase (Strong Action Verbs)\n• **Before**: 'Worked on frontend authentication and user forms using React.'\n  ↳ **After**: 'Engineered secure JWT-based authentication flows and reusable form components in React 19, improving user onboarding speed by 25%.'\n• **Before**: 'Helped maintain MySQL database and wrote queries.'\n  ↳ **After**: 'Designed relational schemas and optimized MySQL indexing, cutting query execution time from 180ms to 45ms across high-volume endpoints.'");
            interview.setVoiceFeedback("Voice delivery averaged 130 WPM with 3 total filler words across 2 responses. Pace and verbal clarity were calm, authoritative, and steady.");
            interview.setCameraFeedback("Camera eye contact averaged 88.0% with consistent upper-body posture. Excellent engagement directly into the webcam lens, projecting confidence and executive presence.");
            interview.setCreatedAt(LocalDateTime.now().minusDays(2));
            interview.setCompletedAt(LocalDateTime.now().minusDays(2).plusMinutes(15));
            Interview savedInterview = interviewRepository.save(interview);

            // Question 1
            InterviewQuestion q1 = new InterviewQuestion();
            q1.setInterview(savedInterview);
            q1.setQuestionText("Explain the difference between HashMap and ConcurrentHashMap in Java, and how thread-safety is achieved.");
            q1.setCategory("Technical");
            q1.setDifficulty("MEDIUM");
            q1.setOrderIndex(1);
            q1.setIdealAnswer("HashMap is non-synchronized and not thread-safe. ConcurrentHashMap achieves thread-safety without locking the entire map using synchronized blocks on bucket nodes and CAS (Compare-And-Swap) operations.");
            InterviewQuestion savedQ1 = questionRepository.save(q1);

            InterviewResponse r1 = new InterviewResponse();
            r1.setQuestion(savedQ1);
            r1.setStudentAnswerText("HashMap is not thread-safe while ConcurrentHashMap is designed for multi-threaded environments. In Java 8, ConcurrentHashMap uses CAS and synchronized node locks per bucket instead of segment locking.");
            r1.setAudioDurationSec(45);
            r1.setWordsPerMinute(132);
            r1.setFillerCount(1);
            r1.setEyeContactPercentage(90.0);
            r1.setPostureScore(88.0);
            r1.setConfidenceScore(89.0);
            r1.setScore(88.0);
            r1.setTechnicalScore(90.0);
            r1.setCommunicationScore(86.0);
            r1.setAiCritique("Excellent explanation of Java 8 CAS and bucket-level synchronization.");
            r1.setKeyStrengths("Mentioned Java 8 memory model improvements and CAS operations.");
            r1.setAreasToImprove("Could briefly mention read operations don't require locking.");
            r1.setIdealModelAnswer(savedQ1.getIdealAnswer());
            r1.setCorrectnessStatus("CORRECT");
            r1.setVoiceTone("CALM_STEADY");
            r1.setCameraPresence("OPTIMAL_EYE_CONTACT");
            responseRepository.save(r1);

            // Question 2
            InterviewQuestion q2 = new InterviewQuestion();
            q2.setInterview(savedInterview);
            q2.setQuestionText("Tell me about a challenging bug you diagnosed and how you resolved it.");
            q2.setCategory("Behavioral");
            q2.setDifficulty("MEDIUM");
            q2.setOrderIndex(2);
            q2.setIdealAnswer("Uses the STAR method to describe context, diagnosis with logs/metrics, root cause fix, and prevention.");
            InterviewQuestion savedQ2 = questionRepository.save(q2);

            InterviewResponse r2 = new InterviewResponse();
            r2.setQuestion(savedQ2);
            r2.setStudentAnswerText("In our e-commerce project, we experienced database deadlocks during flash sales. I analyzed slow query logs, identified missing indexes on the orders table, and added optimistic locking with version columns.");
            r2.setAudioDurationSec(50);
            r2.setWordsPerMinute(128);
            r2.setFillerCount(2);
            r2.setEyeContactPercentage(86.0);
            r2.setPostureScore(84.0);
            r2.setConfidenceScore(85.0);
            r2.setScore(82.0);
            r2.setTechnicalScore(84.0);
            r2.setCommunicationScore(80.0);
            r2.setAiCritique("Clear STAR response with concrete technical resolution (optimistic locking).");
            r2.setKeyStrengths("Grounded in real production-like problem solving.");
            r2.setAreasToImprove("Elaborate on the business impact of the fix.");
            r2.setIdealModelAnswer(savedQ2.getIdealAnswer());
            r2.setCorrectnessStatus("CORRECT");
            r2.setVoiceTone("CALM_STEADY");
            r2.setCameraPresence("OPTIMAL_EYE_CONTACT");
            responseRepository.save(r2);
        }

        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Placement Officer");
            admin.setCollege("Campus Placement Cell");
            admin.setTargetRole("Administrator");
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
        }
    }
}
