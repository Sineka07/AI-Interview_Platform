package com.aiinterview.platform.service;

import com.aiinterview.platform.model.Difficulty;
import com.aiinterview.platform.model.InterviewCategory;
import com.aiinterview.platform.model.Interview;
import com.aiinterview.platform.model.InterviewResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${ai.provider:mock}")
    private String aiProvider;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    public record GeneratedQuestion(String questionText, String category, String idealAnswer) {}

    public record EvaluationResult(
            double score,
            double technicalScore,
            double communicationScore,
            String critique,
            String strengths,
            String improvements,
            String idealAnswer,
            String correctnessStatus,
            String voiceTone,
            String cameraPresence
    ) {}

    public record FinalReportResult(
            double overallScore,
            double technicalScore,
            double communicationScore,
            double confidenceScore,
            String placementReadiness,
            String feedbackSummary,
            String strengths,
            String improvements
    ) {}

    public List<GeneratedQuestion> generateQuestions(
            String roleTarget,
            Difficulty difficulty,
            InterviewCategory category,
            List<String> skills,
            int count) {
        return generateQuestions(roleTarget, difficulty, category, skills, Collections.emptyList(), count);
    }

    /**
     * Generate dynamic interview questions based on candidate resume skills, resume projects, target role, and difficulty
     */
    public List<GeneratedQuestion> generateQuestions(
            String roleTarget,
            Difficulty difficulty,
            InterviewCategory category,
            List<String> skills,
            List<String> projects,
            int count) {

        if ("gemini".equalsIgnoreCase(aiProvider) && geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                return generateQuestionsViaGemini(roleTarget, difficulty, category, skills, count);
            } catch (Exception e) {
                logger.warn("Gemini API call failed, falling back to intelligent rule engine: {}", e.getMessage());
            }
        } else if ("openai".equalsIgnoreCase(aiProvider) && openaiApiKey != null && !openaiApiKey.isBlank()) {
            try {
                return generateQuestionsViaOpenAi(roleTarget, difficulty, category, skills, count);
            } catch (Exception e) {
                logger.warn("OpenAI API call failed, falling back to intelligent rule engine: {}", e.getMessage());
            }
        }

        return generateQuestionsIntelligently(roleTarget, difficulty, category, skills, projects, count);
    }

    /**
     * Evaluate student answer considering technical content, communication, and body language
     */
    public EvaluationResult evaluateAnswer(
            String questionText,
            String category,
            String studentAnswer,
            int durationSeconds,
            double eyeContact,
            double posture,
            int fillerCount,
            int wpm) {
        return evaluateAnswer(questionText, category, null, studentAnswer, durationSeconds, eyeContact, posture, fillerCount, wpm);
    }

    public EvaluationResult evaluateAnswer(
            String questionText,
            String category,
            String idealAnswer,
            String studentAnswer,
            int durationSeconds,
            double eyeContact,
            double posture,
            int fillerCount,
            int wpm) {

        if (studentAnswer == null || studentAnswer.trim().length() < 10) {
            return new EvaluationResult(
                    22.0, 18.0, 28.0,
                    "The answer was either too brief or empty. In placement interviews, try to structure answers using the STAR method (Situation, Task, Action, Result) even if unsure.",
                    "Attempted response.",
                    "❌ Major Deficiency: Answer lacked substance. Provide concrete engineering definitions, internal mechanisms, and speak for at least 30-60 seconds.",
                    idealAnswer != null ? idealAnswer : "A complete answer defines the concept clearly, gives an industry use case, and highlights trade-offs.",
                    "INCORRECT",
                    "HESITANT",
                    "LOOKING_AWAY_DOWN"
            );
        }

        if ("gemini".equalsIgnoreCase(aiProvider) && geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                return evaluateAnswerViaGemini(questionText, category, studentAnswer, eyeContact, posture, fillerCount, wpm);
            } catch (Exception e) {
                logger.warn("Gemini evaluation failed, using intelligent evaluation engine: {}", e.getMessage());
            }
        } else if ("openai".equalsIgnoreCase(aiProvider) && openaiApiKey != null && !openaiApiKey.isBlank()) {
            try {
                return evaluateAnswerViaOpenAi(questionText, category, studentAnswer, eyeContact, posture, fillerCount, wpm);
            } catch (Exception e) {
                logger.warn("OpenAI evaluation failed, using intelligent evaluation engine: {}", e.getMessage());
            }
        }

        return evaluateAnswerIntelligently(questionText, category, idealAnswer, studentAnswer, durationSeconds, eyeContact, posture, fillerCount, wpm);
    }

    /**
     * Synthesize full interview final report
     */
    public FinalReportResult generateFinalReport(Interview interview, List<InterviewResponse> responses) {
        if (responses == null || responses.isEmpty()) {
            return new FinalReportResult(
                    0.0, 0.0, 0.0, 0.0,
                    "INCOMPLETE",
                    "The interview session was not completed.",
                    "None recorded",
                    "Complete all questions in the mock interview to receive a full evaluation."
            );
        }

        double totalScore = 0;
        double totalTech = 0;
        double totalComm = 0;
        double totalConf = 0;
        double totalEyeContact = 0;
        int totalFillers = 0;

        for (InterviewResponse r : responses) {
            totalScore += (r.getScore() != null ? r.getScore() : 50.0);
            totalTech += (r.getTechnicalScore() != null ? r.getTechnicalScore() : 50.0);
            totalComm += (r.getCommunicationScore() != null ? r.getCommunicationScore() : 50.0);
            totalConf += (r.getConfidenceScore() != null ? r.getConfidenceScore() : 50.0);
            totalEyeContact += (r.getEyeContactPercentage() != null ? r.getEyeContactPercentage() : 70.0);
            totalFillers += (r.getFillerCount() != null ? r.getFillerCount() : 0);
        }

        int n = responses.size();
        double avgScore = Math.round((totalScore / n) * 10.0) / 10.0;
        double avgTech = Math.round((totalTech / n) * 10.0) / 10.0;
        double avgComm = Math.round((totalComm / n) * 10.0) / 10.0;
        double avgConf = Math.round((totalConf / n) * 10.0) / 10.0;
        double avgEye = Math.round((totalEyeContact / n) * 10.0) / 10.0;

        String readiness;
        if (avgScore >= 80) {
            readiness = "READY_FOR_PLACEMENTS";
        } else if (avgScore >= 60) {
            readiness = "NEEDS_MINOR_POLISH";
        } else {
            readiness = "NEEDS_IMPROVEMENT";
        }

        String summary = String.format(
                "Candidate practiced for %s role at %s difficulty. Achieved an overall score of %.1f/100 with %.1f%% average eye contact and %d total filler words across %d questions. %s",
                interview.getRoleTarget() != null ? interview.getRoleTarget() : "Software Engineer",
                interview.getDifficulty().name(),
                avgScore, avgEye, totalFillers, n,
                avgScore >= 80 ? "Demonstrated high competence and readiness for campus placements." :
                        avgScore >= 60 ? "Solid foundational knowledge; minor polish required on depth and non-verbal confidence." :
                                "Needs focused revision on core engineering concepts and mock speaking practice."
        );

        String strengths = (avgTech >= 75 ? "• Strong grasp of technical fundamentals\n" : "") +
                (avgEye >= 70 ? "• Maintained consistent eye contact with the camera\n" : "") +
                (totalFillers <= 5 ? "• Crisp verbal articulation with minimal hesitation\n" : "• Structured problem-solving mindset\n");

        String improvements = (avgTech < 75 ? "• Deepen understanding of core architectural trade-offs and edge cases\n" : "") +
                (avgEye < 70 ? "• Practice looking directly at the webcam lens rather than down or at screen corners\n" : "") +
                (totalFillers > 5 ? "• Reduce filler words (e.g., 'like', 'um') by pausing silently before speaking\n" : "") +
                "• Use the STAR framework (Situation, Task, Action, Result) for behavioral and scenario-based questions";

        return new FinalReportResult(avgScore, avgTech, avgComm, avgConf, readiness, summary, strengths, improvements);
    }

    // ==========================================
    // Intelligent Fallback & Built-in AI Engine
    // ==========================================

    private List<GeneratedQuestion> generateQuestionsIntelligently(
            String roleTarget,
            Difficulty difficulty,
            InterviewCategory category,
            List<String> skills,
            List<String> projects,
            int count) {

        List<GeneratedQuestion> pool = new ArrayList<>();
        String primarySkill = (skills != null && !skills.isEmpty()) ? skills.get(0) : "Java";

        // Inject Candidate's Actual Resume Projects into questions
        if (projects != null && !projects.isEmpty()) {
            for (String proj : projects) {
                if (proj == null || proj.isBlank()) continue;
                pool.add(new GeneratedQuestion(
                        String.format("I noticed on your resume that you built '%s'. Can you walk me through the high-level architecture and the technical trade-offs you made when choosing your database and tech stack?", proj),
                        "Technical",
                        String.format("Candidate should clearly describe the frontend, backend, and data storage layers of '%s'. They should explain why specific frameworks were chosen, how data flows through the system, and what scalability trade-offs were considered.", proj)
                ));
                pool.add(new GeneratedQuestion(
                        String.format("In your project '%s', what was the most difficult bug, performance bottleneck, or edge-case you encountered, and what diagnostic steps did you take to fix it?", proj),
                        "Technical",
                        String.format("Strong answers explain root cause analysis using logs, profiling tools, or debugging frameworks for '%s', detail the exact code fix, and explain preventative automated testing introduced.", proj)
                ));
            }
        }

        if (category == InterviewCategory.TECHNICAL || category == InterviewCategory.MIXED) {
            if (difficulty == Difficulty.EASY) {
                pool.add(new GeneratedQuestion(
                        "Can you explain the core principles of Object-Oriented Programming (OOP) and how you have applied them in a recent project?",
                        "Technical",
                        "Candidate should clearly explain Encapsulation, Abstraction, Inheritance, and Polymorphism with a real-world code example from their project."
                ));
                pool.add(new GeneratedQuestion(
                        "What is the difference between an Array and a LinkedList, and what are their respective time complexities for access and insertion?",
                        "Technical",
                        "Arrays provide O(1) random access but O(n) worst-case insertion. LinkedLists have O(n) access but O(1) insertion if node pointer is known."
                ));
                pool.add(new GeneratedQuestion(
                        "How does indexing work in MySQL databases, and why does it speed up search queries?",
                        "Technical",
                        "B-Tree / B+Tree indexes reduce lookup time from O(n) full-table scan to O(log n) tree traversals. Candidate should mention primary and secondary indexes."
                ));
            } else if (difficulty == Difficulty.MEDIUM) {
                pool.add(new GeneratedQuestion(
                        "How does Dependency Injection work in Spring Boot, and what are the key differences between Constructor Injection and Field Injection?",
                        "Technical",
                        "Constructor injection is favored because it enables immutability, facilitates unit testing without Spring context, and prevents circular dependencies."
                ));
                pool.add(new GeneratedQuestion(
                        "Explain how JWT (JSON Web Token) authentication works end-to-end, and how you secure sensitive REST APIs.",
                        "Technical",
                        "Candidate should cover the three parts of JWT (Header, Payload, Signature), stateless session verification, Authorization header Bearer token, and expiry rotation."
                ));
                pool.add(new GeneratedQuestion(
                        "How do you design a database schema for an e-commerce platform handling concurrent orders to prevent race conditions and overselling?",
                        "Technical",
                        "Should mention database transactions (ACID), isolation levels, pessimistic vs optimistic locking, or Redis distributed locks."
                ));
            } else { // HARD
                pool.add(new GeneratedQuestion(
                        "How would you architect a distributed rate limiter that can handle 100,000 requests per second across multiple data centers?",
                        "Technical",
                        "Candidate should discuss Token Bucket or Leaky Bucket algorithms, Redis sliding window counters, Lua scripts for atomicity, and eventual consistency."
                ));
                pool.add(new GeneratedQuestion(
                        "In modern web applications, how do you diagnose and resolve memory leaks and performance bottlenecks in both frontend and backend?",
                        "Technical",
                        "Mentions profiling tools (Chrome DevTools Heap Snapshot, VisualVM/JProfiler), garbage collection tuning, detached DOM nodes, unclosed streams/connections."
                ));
            }
        }

        if (category == InterviewCategory.HR || category == InterviewCategory.BEHAVIORAL || category == InterviewCategory.MIXED) {
            pool.add(new GeneratedQuestion(
                    "Tell me about a challenging technical bug or disagreement you faced in a team project, and how you resolved it.",
                    "Behavioral",
                    "STAR approach: Explains the exact situation, objective technical evaluation, empathy, active listening, and the positive project outcome."
            ));
            pool.add(new GeneratedQuestion(
                    "Where do you see yourself professionally in the next 3 to 5 years, and how does this role align with your aspirations?",
                    "HR",
                    "Shows genuine passion for engineering excellence, technical growth, mentorship, and willingness to contribute significantly to company goals."
            ));
            pool.add(new GeneratedQuestion(
                    "Describe a situation where you had to learn a completely new framework or technology under a strict deadline.",
                    "Behavioral",
                    "Highlights resourcefulness, reading documentation, building proof-of-concepts, asking targeted questions, and delivering high quality on time."
            ));
        }

        Collections.shuffle(pool);
        if (pool.size() <= count) {
            return pool;
        }
        return pool.subList(0, count);
    }

    private EvaluationResult evaluateAnswerIntelligently(
            String questionText,
            String category,
            String idealAnswer,
            String studentAnswer,
            int durationSeconds,
            double eyeContact,
            double posture,
            int fillerCount,
            int wpm) {

        String trimmed = (studentAnswer != null) ? studentAnswer.trim() : "";
        String[] words = trimmed.isEmpty() ? new String[0] : trimmed.split("\\s+");
        int wordCount = words.length;
        String lowerAns = trimmed.toLowerCase();

        // 1. Check for evasive or too brief answers
        boolean isEvasive = lowerAns.contains("don't know") || lowerAns.contains("dont know") ||
                lowerAns.contains("no idea") || lowerAns.contains("not sure") ||
                lowerAns.contains("skip") || lowerAns.contains("pass");

        if (wordCount < 12 || isEvasive) {
            return new EvaluationResult(
                    22.0, 18.0, 28.0,
                    "The answer was too brief or evasive to assess technical proficiency. In placement interviews, candidates are expected to structure technical answers with definitions, mechanics, and trade-offs.",
                    "Attempted response.",
                    "❌ Major Deficiency: Answer lacked substance. Define the core architectural concept, walk through the execution steps, and provide a tangible project implementation.",
                    idealAnswer != null ? idealAnswer : "A complete answer defines the pattern, explains the internal mechanism, and addresses time/space complexity or system trade-offs.",
                    "INCORRECT",
                    "HESITANT",
                    "LOOKING_AWAY_DOWN"
            );
        }

        // 2. Extract technical concept keywords from question and ideal answer
        Set<String> targetKeywords = new HashSet<>();
        Set<String> stopWords = Set.of(
                "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "by", "from",
                "of", "is", "are", "was", "were", "be", "been", "that", "this", "these", "those",
                "what", "how", "why", "can", "you", "your", "explain", "describe", "candidate",
                "should", "would", "could", "about", "project", "using", "when", "where", "which"
        );

        String contextText = ((questionText != null ? questionText : "") + " " + (idealAnswer != null ? idealAnswer : "")).toLowerCase();
        for (String token : contextText.replaceAll("[^a-zA-Z0-9#+]", " ").split("\\s+")) {
            token = token.trim();
            if (token.length() > 3 && !stopWords.contains(token)) {
                targetKeywords.add(token);
            }
        }

        // 3. Count concept matches in student's answer
        int matches = 0;
        List<String> matchedTokens = new ArrayList<>();
        List<String> missedTokens = new ArrayList<>();

        for (String kw : targetKeywords) {
            if (lowerAns.contains(kw)) {
                matches++;
                if (matchedTokens.size() < 4) matchedTokens.add(kw);
            } else {
                if (missedTokens.size() < 4) missedTokens.add(kw);
            }
        }

        double keywordRatio = targetKeywords.isEmpty() ? 0.5 : ((double) matches / targetKeywords.size());

        // 4. Calculate realistic technical score based on conceptual depth and accuracy
        double techScore;
        String correctnessStatus;
        String critique;
        String improvements;
        String strengths;

        if (keywordRatio < 0.12 && wordCount < 30) {
            // Off-topic or very poor relevance
            techScore = Math.max(18.0, 20.0 + (wordCount * 0.3));
            correctnessStatus = "INCORRECT";
            critique = "The response diverged significantly from the question prompt. It did not cover the expected technical concepts, system architecture, or operational trade-offs.";
            improvements = "❌ Critical Flaw: Off-topic or superficial answer. You missed key technical concepts: " +
                    (missedTokens.isEmpty() ? "core architectural fundamentals." : String.join(", ", missedTokens) + ". Ensure you address the prompt directly.");
            strengths = "Audible delivery.";
        } else if (keywordRatio < 0.28) {
            // Partial answer with major gaps
            techScore = Math.min(52.0, Math.max(35.0, 35.0 + (keywordRatio * 50.0)));
            correctnessStatus = "PARTIALLY_CORRECT";
            critique = String.format("Surface-level explanation (%d words). You touched upon basic terminology, but omitted crucial architectural mechanics and execution details.", wordCount);
            improvements = "❌ Conceptual Gaps: Failed to explain how the system functions internally. Missing key topics: " +
                    (missedTokens.isEmpty() ? "complexity analysis and trade-offs." : String.join(", ", missedTokens) + ".");
            strengths = matchedTokens.isEmpty() ? "Communicated at a conversational pace." : "Correctly mentioned: " + String.join(", ", matchedTokens) + ".";
        } else if (keywordRatio < 0.55) {
            // Acceptable foundational answer
            techScore = Math.min(76.0, Math.max(58.0, 50.0 + (keywordRatio * 45.0) + (wordCount > 40 ? 8.0 : 0.0)));
            correctnessStatus = techScore >= 70.0 ? "CORRECT" : "PARTIALLY_CORRECT";
            critique = String.format("Competent explanation (%d words). You demonstrated understanding of the primary concept, though further technical depth on edge cases would elevate the response.", wordCount);
            improvements = "⚠️ Minor Deficiencies: Deepen explanation of failure modes, scaling bottlenecks, or alternative design trade-offs (" +
                    (missedTokens.isEmpty() ? "edge cases" : String.join(", ", missedTokens)) + ").";
            strengths = "Solid foundational clarity; accurately discussed " + (matchedTokens.isEmpty() ? "the core topic." : String.join(", ", matchedTokens) + ".");
        } else {
            // Strong comprehensive answer
            techScore = Math.min(96.0, Math.max(78.0, 72.0 + (keywordRatio * 30.0) + (wordCount > 50 ? 8.0 : 0.0)));
            correctnessStatus = "CORRECT";
            critique = String.format("Strong, comprehensive response (%d words). You provided thorough technical coverage, clearly articulated mechanisms, and demonstrated placement-level domain competence.", wordCount);
            improvements = "Keep refining structured STAR delivery for multi-round placement interviews.";
            strengths = "Exceptional depth, thorough trade-off analysis, and precise engineering terminology (" + String.join(", ", matchedTokens) + ").";
        }

        // 5. Communication Score
        double commScore = 75.0;
        if (wpm >= 110 && wpm <= 165) commScore += 12.0;
        else if (wpm < 80 || wpm > 185) commScore -= 12.0;
        if (fillerCount > 3) commScore -= Math.min(18.0, fillerCount * 3.0);
        commScore = Math.max(25.0, Math.min(95.0, commScore));

        // 6. Confidence & Body Language Score
        double confScore = (eyeContact * 0.6) + (posture * 0.4);
        if (confScore <= 0) confScore = 75.0;

        // 7. Overall Weighted Score
        double overall = (techScore * 0.55) + (commScore * 0.25) + (confScore * 0.20);
        overall = Math.max(15.0, Math.min(98.0, Math.round(overall * 10.0) / 10.0));
        techScore = Math.max(15.0, Math.min(98.0, Math.round(techScore * 10.0) / 10.0));
        commScore = Math.max(15.0, Math.min(98.0, Math.round(commScore * 10.0) / 10.0));

        String voiceTone = (wpm > 165 || fillerCount >= 5) ? "RUSHED_NERVOUS" : (wpm < 85) ? "HESITANT" : "CALM_STEADY";
        String cameraPresence = (eyeContact >= 70.0 && posture >= 70.0) ? "OPTIMAL_EYE_CONTACT" : (eyeContact < 55.0) ? "LOOKING_AWAY_DOWN" : "RESTLESS";

        String modelAnswer = idealAnswer != null ? idealAnswer : "A standout response defines the architectural pattern, walks through a tangible project implementation using the STAR structure, and explicitly addresses edge cases and system trade-offs.";

        return new EvaluationResult(overall, techScore, commScore, critique, strengths, improvements, modelAnswer, correctnessStatus, voiceTone, cameraPresence);
    }

    /**
     * Generate structured feedback on candidate's resume (Add, Remove, Rephrase)
     */
    public String generateResumeFeedback(String resumeText, String targetRole) {
        StringBuilder sb = new StringBuilder();
        sb.append("### 🎯 Resume Optimization & ATS Review for ").append(targetRole).append("\n\n");

        sb.append("#### 🟢 What to Add (High Impact for Placements)\n");
        sb.append("• **Quantifiable Metrics**: Add metrics showing the business or performance impact of your work (e.g., 'Reduced response latency by 35% through Redis caching' or 'Handled 5,000+ daily requests').\n");
        sb.append("• **Testing & CI/CD**: Explicitly list automated testing frameworks (JUnit 5, Mockito, Jest, Cypress) and deployment pipelines (Docker, GitHub Actions).\n");
        sb.append("• **Live Demo / GitHub Links**: Add clickable links to live deployed applications and clean Git repositories with comprehensive READMEs.\n\n");

        sb.append("#### 🔴 What to Remove\n");
        sb.append("• **High School Details**: Remove 10th/12th grade school details if you have completed or are in college; focus 100% on undergraduate achievements.\n");
        sb.append("• **Generic Objective Statements**: Replace outdated objectives like 'Seeking an entry-level position where I can utilize my skills' with a concise 2-line Technical Summary.\n");
        sb.append("• **Non-Technical Hobbies**: Omit general hobbies unless they directly demonstrate leadership, hackathons, or open-source community contributions.\n\n");

        sb.append("#### 🔵 What to Rephrase (Strong Action Verbs)\n");
        sb.append("• **Before**: 'Worked on frontend authentication and user forms using React.'\n");
        sb.append("  ↳ **After**: 'Engineered secure JWT-based authentication flows and reusable form components in React 19, improving user onboarding speed by 25%.'\n");
        sb.append("• **Before**: 'Helped maintain MySQL database and wrote queries.'\n");
        sb.append("  ↳ **After**: 'Designed relational schemas and optimized MySQL indexing, cutting query execution time from 180ms to 45ms across high-volume endpoints.'\n");

        return sb.toString();
    }

    // ==========================================
    // Gemini API Provider Implementation
    // ==========================================

    private List<GeneratedQuestion> generateQuestionsViaGemini(
            String roleTarget, Difficulty difficulty, InterviewCategory category, List<String> skills, int count) throws Exception {

        String prompt = String.format(
                "You are an expert technical interviewer for college campus placements. Generate %d interview questions for a candidate applying for '%s' role with skills: %s. Difficulty: %s, Category: %s. " +
                "Return strictly valid JSON array with objects containing 'questionText', 'category', and 'idealAnswer'. No markdown tags.",
                count, roleTarget, String.join(", ", skills), difficulty.name(), category.name()
        );

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        String requestBody = objectMapper.writeValueAsString(Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            text = sanitizeJson(text);
            JsonNode array = objectMapper.readTree(text);
            List<GeneratedQuestion> list = new ArrayList<>();
            for (JsonNode item : array) {
                list.add(new GeneratedQuestion(
                        item.path("questionText").asText(),
                        item.path("category").asText("Technical"),
                        item.path("idealAnswer").asText("A comprehensive answer covering fundamentals and practical examples.")
                ));
            }
            if (!list.isEmpty()) return list;
        }
        throw new RuntimeException("Failed to parse Gemini response: " + response.body());
    }

    private EvaluationResult evaluateAnswerViaGemini(
            String questionText, String category, String studentAnswer,
            double eyeContact, double posture, int fillerCount, int wpm) throws Exception {

        String prompt = String.format(
                "You are an AI placement interviewer. Evaluate this candidate response:\n" +
                "Question: %s\nCategory: %s\nAnswer: %s\nEye Contact: %.1f%%\nFiller words: %d\nWPM: %d\n\n" +
                "Provide strictly valid JSON with keys: 'score' (number 0-100), 'technicalScore' (number 0-100), 'communicationScore' (number 0-100), 'critique' (string), 'strengths' (string), 'improvements' (string), 'idealAnswer' (string). No markdown tags.",
                questionText, category, studentAnswer, eyeContact, fillerCount, wpm
        );

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        String requestBody = objectMapper.writeValueAsString(Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            text = sanitizeJson(text);
            JsonNode node = objectMapper.readTree(text);
            double score = node.path("score").asDouble(75.0);
            double tech = node.path("technicalScore").asDouble(75.0);
            double comm = node.path("communicationScore").asDouble(75.0);
            String correctness = score >= 75.0 ? "CORRECT" : score >= 50.0 ? "PARTIALLY_CORRECT" : "INCORRECT";
            String voiceTone = (wpm > 165 || fillerCount >= 5) ? "RUSHED_NERVOUS" : (wpm < 85) ? "HESITANT" : "CALM_STEADY";
            String cam = (eyeContact >= 70.0 && posture >= 70.0) ? "OPTIMAL_EYE_CONTACT" : (eyeContact < 55.0) ? "LOOKING_AWAY_DOWN" : "RESTLESS";

            return new EvaluationResult(
                    score,
                    tech,
                    comm,
                    node.path("critique").asText("Good attempt with clear communication."),
                    node.path("strengths").asText("Direct and relevant points."),
                    node.path("improvements").asText("Add more technical examples."),
                    node.path("idealAnswer").asText("A comprehensive answer covering fundamentals and practical examples."),
                    correctness,
                    voiceTone,
                    cam
            );
        }
        throw new RuntimeException("Gemini evaluation error: " + response.body());
    }

    // ==========================================
    // OpenAI API Provider Implementation
    // ==========================================

    private List<GeneratedQuestion> generateQuestionsViaOpenAi(
            String roleTarget, Difficulty difficulty, InterviewCategory category, List<String> skills, int count) throws Exception {

        String prompt = String.format(
                "Generate %d placement interview questions for '%s' with skills: %s. Difficulty: %s. Category: %s. " +
                "Return JSON array of objects with keys 'questionText', 'category', 'idealAnswer'.",
                count, roleTarget, String.join(", ", skills), difficulty.name(), category.name()
        );

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", "You are an expert technical interviewer. Output strictly JSON."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Authorization", "Bearer " + openaiApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("choices").get(0).path("message").path("content").asText();
            text = sanitizeJson(text);
            JsonNode array = objectMapper.readTree(text);
            List<GeneratedQuestion> list = new ArrayList<>();
            for (JsonNode item : array) {
                list.add(new GeneratedQuestion(
                        item.path("questionText").asText(),
                        item.path("category").asText("Technical"),
                        item.path("idealAnswer").asText()
                ));
            }
            return list;
        }
        throw new RuntimeException("OpenAI call failed: " + response.body());
    }

    private EvaluationResult evaluateAnswerViaOpenAi(
            String questionText, String category, String studentAnswer,
            double eyeContact, double posture, int fillerCount, int wpm) throws Exception {

        String prompt = String.format(
                "Evaluate answer:\nQuestion: %s\nCategory: %s\nAnswer: %s\nEye Contact: %.1f%%\nFillers: %d\nWPM: %d\n" +
                "Return JSON with 'score', 'technicalScore', 'communicationScore', 'critique', 'strengths', 'improvements', 'idealAnswer'.",
                questionText, category, studentAnswer, eyeContact, fillerCount, wpm
        );

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", "You are an AI placement interviewer. Return strictly valid JSON."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Authorization", "Bearer " + openaiApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("choices").get(0).path("message").path("content").asText();
            text = sanitizeJson(text);
            JsonNode node = objectMapper.readTree(text);
            double score = node.path("score").asDouble(75.0);
            double tech = node.path("technicalScore").asDouble(75.0);
            double comm = node.path("communicationScore").asDouble(75.0);
            String correctness = score >= 75.0 ? "CORRECT" : score >= 50.0 ? "PARTIALLY_CORRECT" : "INCORRECT";
            String voiceTone = (wpm > 165 || fillerCount >= 5) ? "RUSHED_NERVOUS" : (wpm < 85) ? "HESITANT" : "CALM_STEADY";
            String cam = (eyeContact >= 70.0 && posture >= 70.0) ? "OPTIMAL_EYE_CONTACT" : (eyeContact < 55.0) ? "LOOKING_AWAY_DOWN" : "RESTLESS";

            return new EvaluationResult(
                    score,
                    tech,
                    comm,
                    node.path("critique").asText(),
                    node.path("strengths").asText(),
                    node.path("improvements").asText(),
                    node.path("idealAnswer").asText(),
                    correctness,
                    voiceTone,
                    cam
            );
        }
        throw new RuntimeException("OpenAI evaluation failed: " + response.body());
    }

    private String sanitizeJson(String raw) {
        if (raw == null) return "[]";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
