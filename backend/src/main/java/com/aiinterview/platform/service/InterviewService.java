package com.aiinterview.platform.service;

import com.aiinterview.platform.dto.InterviewDtos.*;
import com.aiinterview.platform.model.*;
import com.aiinterview.platform.repository.InterviewQuestionRepository;
import com.aiinterview.platform.repository.InterviewRepository;
import com.aiinterview.platform.repository.InterviewResponseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewResponseRepository responseRepository;
    private final AiService aiService;
    private final SpeechMetricsService speechMetricsService;
    private final ResumeParsingService resumeParsingService;

    public InterviewService(InterviewRepository interviewRepository,
                            InterviewQuestionRepository questionRepository,
                            InterviewResponseRepository responseRepository,
                            AiService aiService,
                            SpeechMetricsService speechMetricsService,
                            ResumeParsingService resumeParsingService) {
        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.responseRepository = responseRepository;
        this.aiService = aiService;
        this.speechMetricsService = speechMetricsService;
        this.resumeParsingService = resumeParsingService;
    }

    @Transactional
    public Interview createInterview(User user, CreateInterviewRequest req) {
        Interview interview = new Interview();
        interview.setUser(user);
        interview.setTitle(req.getTitle() != null && !req.getTitle().isBlank() ? req.getTitle() : "Placement Mock Interview");
        interview.setRoleTarget(req.getRoleTarget() != null && !req.getRoleTarget().isBlank() ? req.getRoleTarget() : user.getTargetRole());
        interview.setDifficulty(req.getDifficulty() != null ? req.getDifficulty() : Difficulty.MEDIUM);
        interview.setCategory(req.getCategory() != null ? req.getCategory() : InterviewCategory.MIXED);
        interview.setQuestionCount(req.getQuestionCount() != null ? req.getQuestionCount() : 5);
        interview.setStatus(InterviewStatus.IN_PROGRESS);
        interview.setCreatedAt(LocalDateTime.now());

        String resumeText = req.getResumeOverride() != null && !req.getResumeOverride().isBlank() ?
                req.getResumeOverride() : user.getResumeText();

        ResumeParsingService.ParsedResume parsedResume = resumeParsingService.parseResume(resumeText);
        List<String> extractedSkills = parsedResume.skills();
        List<String> extractedProjects = parsedResume.projects();

        List<AiService.GeneratedQuestion> generated = aiService.generateQuestions(
                interview.getRoleTarget(),
                interview.getDifficulty(),
                interview.getCategory(),
                extractedSkills,
                extractedProjects,
                interview.getQuestionCount()
        );

        Interview savedInterview = interviewRepository.save(interview);

        int order = 1;
        List<InterviewQuestion> questionEntities = new ArrayList<>();
        for (AiService.GeneratedQuestion gq : generated) {
            InterviewQuestion q = new InterviewQuestion();
            q.setInterview(savedInterview);
            q.setQuestionText(gq.questionText());
            q.setCategory(gq.category());
            q.setDifficulty(savedInterview.getDifficulty().name());
            q.setOrderIndex(order++);
            q.setIdealAnswer(gq.idealAnswer());
            questionEntities.add(questionRepository.save(q));
        }

        savedInterview.setQuestions(questionEntities);
        return savedInterview;
    }

    public List<QuestionDto> getInterviewQuestions(Long interviewId, User user) {
        Interview interview = getInterviewEntity(interviewId, user);
        List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderByOrderIndexAsc(interview.getId());
        return questions.stream().map(q -> new QuestionDto(
                q.getId(),
                q.getQuestionText(),
                q.getCategory(),
                q.getDifficulty(),
                q.getOrderIndex()
        )).toList();
    }

    @Transactional
    public QuestionFeedbackDto submitAnswer(Long interviewId, SubmitAnswerRequest req, User user) {
        Interview interview = getInterviewEntity(interviewId, user);

        InterviewQuestion question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found with ID: " + req.getQuestionId()));

        if (!question.getInterview().getId().equals(interview.getId())) {
            throw new IllegalArgumentException("Question does not belong to this interview session");
        }

        int fillerCount = req.getFillerCount() != null ? req.getFillerCount() :
                speechMetricsService.countFillerWords(req.getAnswerText());

        int duration = req.getDurationSeconds() != null ? req.getDurationSeconds() : 30;
        int wpm = speechMetricsService.calculateWpm(req.getAnswerText(), duration);

        double eyeContact = req.getEyeContactPercentage() != null ? req.getEyeContactPercentage() : 75.0;
        double posture = req.getPostureScore() != null ? req.getPostureScore() : 80.0;
        double confidence = req.getConfidenceScore() != null ? req.getConfidenceScore() : (eyeContact * 0.6 + posture * 0.4);

        AiService.EvaluationResult eval = aiService.evaluateAnswer(
                question.getQuestionText(),
                question.getCategory(),
                question.getIdealAnswer(),
                req.getAnswerText(),
                duration,
                eyeContact,
                posture,
                fillerCount,
                wpm
        );

        Optional<InterviewResponse> existingResp = responseRepository.findByQuestionId(question.getId());
        InterviewResponse response = existingResp.orElse(new InterviewResponse());
        response.setQuestion(question);
        response.setStudentAnswerText(req.getAnswerText());
        response.setAudioDurationSec(duration);
        response.setWordsPerMinute(wpm);
        response.setFillerCount(fillerCount);
        response.setEyeContactPercentage(eyeContact);
        response.setPostureScore(posture);
        response.setConfidenceScore(confidence);
        response.setScore(eval.score());
        response.setTechnicalScore(eval.technicalScore());
        response.setCommunicationScore(eval.communicationScore());
        response.setAiCritique(eval.critique());
        response.setKeyStrengths(eval.strengths());
        response.setAreasToImprove(eval.improvements());
        response.setIdealModelAnswer(eval.idealAnswer());
        response.setCorrectnessStatus(eval.correctnessStatus());
        response.setVoiceTone(eval.voiceTone());
        response.setCameraPresence(eval.cameraPresence());
        response.setAnsweredAt(LocalDateTime.now());

        responseRepository.save(response);

        QuestionFeedbackDto dto = new QuestionFeedbackDto();
        dto.setQuestionId(question.getId());
        dto.setOrderIndex(question.getOrderIndex());
        dto.setQuestionText(question.getQuestionText());
        dto.setCategory(question.getCategory());
        dto.setStudentAnswer(response.getStudentAnswerText());
        dto.setScore(response.getScore());
        dto.setTechnicalScore(response.getTechnicalScore());
        dto.setCommunicationScore(response.getCommunicationScore());
        dto.setEyeContactPercentage(response.getEyeContactPercentage());
        dto.setPostureScore(response.getPostureScore());
        dto.setFillerCount(response.getFillerCount());
        dto.setWordsPerMinute(response.getWordsPerMinute());
        dto.setCritique(response.getAiCritique());
        dto.setStrengths(response.getKeyStrengths());
        dto.setImprovements(response.getAreasToImprove());
        dto.setIdealAnswer(response.getIdealModelAnswer());
        dto.setCorrectnessStatus(response.getCorrectnessStatus());
        dto.setVoiceTone(response.getVoiceTone());
        dto.setCameraPresence(response.getCameraPresence());
        return dto;
    }

    @Transactional
    public FullInterviewReportDto completeInterview(Long interviewId, User user) {
        Interview interview = getInterviewEntity(interviewId, user);
        List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderByOrderIndexAsc(interview.getId());

        List<InterviewResponse> responses = new ArrayList<>();
        for (InterviewQuestion q : questions) {
            responseRepository.findByQuestionId(q.getId()).ifPresent(responses::add);
        }

        AiService.FinalReportResult report = aiService.generateFinalReport(interview, responses);

        interview.setOverallScore(report.overallScore());
        interview.setTechnicalScore(report.technicalScore());
        interview.setCommunicationScore(report.communicationScore());
        interview.setConfidenceScore(report.confidenceScore());
        interview.setPlacementReadiness(report.placementReadiness());
        interview.setFeedbackSummary(report.feedbackSummary());
        interview.setStrengths(report.strengths());
        interview.setImprovements(report.improvements());

        // Generate Resume Feedback
        String resumeText = interview.getUser().getResumeText();
        String resumeFeedback = aiService.generateResumeFeedback(resumeText, interview.getRoleTarget());
        interview.setResumeFeedback(resumeFeedback);

        // Aggregate voice and camera summaries
        double totalEye = 0;
        int totalWpm = 0;
        int totalFillers = 0;
        for (InterviewResponse r : responses) {
            if (r.getEyeContactPercentage() != null) totalEye += r.getEyeContactPercentage();
            if (r.getWordsPerMinute() != null) totalWpm += r.getWordsPerMinute();
            if (r.getFillerCount() != null) totalFillers += r.getFillerCount();
        }
        int respCount = responses.isEmpty() ? 1 : responses.size();
        double avgEye = totalEye / respCount;
        int avgWpm = totalWpm / respCount;

        String voiceFeedback = String.format(
                "Voice delivery averaged %d WPM with %d total filler words across %d responses. %s",
                avgWpm, totalFillers, responses.size(),
                (avgWpm >= 115 && avgWpm <= 160 && totalFillers <= 4) ? "Pace and verbal clarity were calm, authoritative, and steady." :
                        totalFillers > 5 ? "Filler word frequency was elevated; practice silent pausing to collect thoughts before responding." :
                                avgWpm > 165 ? "Speech pace was rushed; slowing down slightly will improve comprehension." :
                                        "Voice delivery was slightly hesitant; aim for greater fluency by practicing STAR structured answers."
        );
        interview.setVoiceFeedback(voiceFeedback);

        String cameraFeedback = String.format(
                "Camera eye contact averaged %.1f%% with consistent upper-body posture. %s",
                avgEye,
                avgEye >= 75 ? "Excellent engagement directly into the webcam lens, projecting confidence and executive presence." :
                        avgEye >= 60 ? "Moderate eye contact; minimize glancing down at notes or off-screen during complex problem explanations." :
                                "Frequent off-camera gaze detected. Maintain direct focus towards the camera to simulate real interviewer eye contact."
        );
        interview.setCameraFeedback(cameraFeedback);

        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setCompletedAt(LocalDateTime.now());

        interviewRepository.save(interview);

        return buildFullReportDto(interview, questions, responses);
    }

    public FullInterviewReportDto getInterviewReport(Long interviewId, User user) {
        Interview interview = getInterviewEntity(interviewId, user);
        List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderByOrderIndexAsc(interview.getId());
        List<InterviewResponse> responses = new ArrayList<>();
        for (InterviewQuestion q : questions) {
            responseRepository.findByQuestionId(q.getId()).ifPresent(responses::add);
        }
        return buildFullReportDto(interview, questions, responses);
    }

    public List<InterviewSummaryItemDto> getUserInterviews(User user) {
        List<Interview> list = interviewRepository.findByUserOrderByCreatedAtDesc(user);
        return list.stream().map(this::toSummaryDto).toList();
    }

    public DashboardStatsDto getDashboardStats(User user) {
        List<Interview> all = interviewRepository.findByUserOrderByCreatedAtDesc(user);
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalInterviews(all.size());

        List<Interview> completed = all.stream()
                .filter(i -> i.getStatus() == InterviewStatus.COMPLETED && i.getOverallScore() != null)
                .toList();

        stats.setCompletedInterviews(completed.size());

        if (!completed.isEmpty()) {
            double avgOverall = completed.stream().mapToDouble(Interview::getOverallScore).average().orElse(0.0);
            double avgTech = completed.stream().mapToDouble(i -> i.getTechnicalScore() != null ? i.getTechnicalScore() : 0.0).average().orElse(0.0);
            double avgComm = completed.stream().mapToDouble(i -> i.getCommunicationScore() != null ? i.getCommunicationScore() : 0.0).average().orElse(0.0);
            double avgConf = completed.stream().mapToDouble(i -> i.getConfidenceScore() != null ? i.getConfidenceScore() : 0.0).average().orElse(0.0);

            stats.setAverageOverallScore(Math.round(avgOverall * 10.0) / 10.0);
            stats.setAverageTechnicalScore(Math.round(avgTech * 10.0) / 10.0);
            stats.setAverageCommunicationScore(Math.round(avgComm * 10.0) / 10.0);
            stats.setAverageConfidenceScore(Math.round(avgConf * 10.0) / 10.0);

            if (avgOverall >= 80) stats.setPlacementReadinessStatus("Ready for Placements");
            else if (avgOverall >= 60) stats.setPlacementReadinessStatus("Needs Minor Polish");
            else stats.setPlacementReadinessStatus("Needs Preparation");
        } else {
            stats.setPlacementReadinessStatus("No Interviews Yet");
        }

        stats.setRecentInterviews(all.stream().limit(5).map(this::toSummaryDto).toList());
        return stats;
    }

    private Interview getInterviewEntity(Long interviewId, User user) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found with ID: " + interviewId));

        if (!interview.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new SecurityException("Unauthorized access to this interview session");
        }
        return interview;
    }

    private InterviewSummaryItemDto toSummaryDto(Interview i) {
        InterviewSummaryItemDto dto = new InterviewSummaryItemDto();
        dto.setId(i.getId());
        dto.setTitle(i.getTitle());
        dto.setRoleTarget(i.getRoleTarget());
        dto.setDifficulty(i.getDifficulty());
        dto.setStatus(i.getStatus());
        dto.setOverallScore(i.getOverallScore());
        dto.setPlacementReadiness(i.getPlacementReadiness());
        dto.setCreatedAt(i.getCreatedAt());
        dto.setCompletedAt(i.getCompletedAt());
        return dto;
    }

    private FullInterviewReportDto buildFullReportDto(Interview interview, List<InterviewQuestion> questions, List<InterviewResponse> responses) {
        FullInterviewReportDto dto = new FullInterviewReportDto();
        dto.setInterviewId(interview.getId());
        dto.setTitle(interview.getTitle());
        dto.setRoleTarget(interview.getRoleTarget());
        dto.setDifficulty(interview.getDifficulty());
        dto.setCategory(interview.getCategory());
        dto.setStatus(interview.getStatus());
        dto.setOverallScore(interview.getOverallScore());
        dto.setTechnicalScore(interview.getTechnicalScore());
        dto.setCommunicationScore(interview.getCommunicationScore());
        dto.setConfidenceScore(interview.getConfidenceScore());
        dto.setPlacementReadiness(interview.getPlacementReadiness());
        dto.setFeedbackSummary(interview.getFeedbackSummary());
        dto.setStrengths(interview.getStrengths());
        dto.setImprovements(interview.getImprovements());
        dto.setResumeFeedback(interview.getResumeFeedback());
        dto.setVoiceFeedback(interview.getVoiceFeedback());
        dto.setCameraFeedback(interview.getCameraFeedback());
        dto.setCompletedAt(interview.getCompletedAt());

        double totalEye = 0;
        double totalPosture = 0;
        int totalFillers = 0;
        int totalWpm = 0;
        int count = responses.size();

        List<QuestionFeedbackDto> qDtos = new ArrayList<>();
        for (InterviewQuestion q : questions) {
            Optional<InterviewResponse> respOpt = responses.stream()
                    .filter(r -> r.getQuestion().getId().equals(q.getId()))
                    .findFirst();

            QuestionFeedbackDto qDto = new QuestionFeedbackDto();
            qDto.setQuestionId(q.getId());
            qDto.setOrderIndex(q.getOrderIndex());
            qDto.setQuestionText(q.getQuestionText());
            qDto.setCategory(q.getCategory());

            if (respOpt.isPresent()) {
                InterviewResponse r = respOpt.get();
                qDto.setStudentAnswer(r.getStudentAnswerText());
                qDto.setScore(r.getScore());
                qDto.setTechnicalScore(r.getTechnicalScore());
                qDto.setCommunicationScore(r.getCommunicationScore());
                qDto.setEyeContactPercentage(r.getEyeContactPercentage());
                qDto.setPostureScore(r.getPostureScore());
                qDto.setFillerCount(r.getFillerCount());
                qDto.setWordsPerMinute(r.getWordsPerMinute());
                qDto.setCritique(r.getAiCritique());
                qDto.setStrengths(r.getKeyStrengths());
                qDto.setImprovements(r.getAreasToImprove());
                qDto.setIdealAnswer(r.getIdealModelAnswer() != null ? r.getIdealModelAnswer() : q.getIdealAnswer());
                qDto.setCorrectnessStatus(r.getCorrectnessStatus());
                qDto.setVoiceTone(r.getVoiceTone());
                qDto.setCameraPresence(r.getCameraPresence());

                if (r.getEyeContactPercentage() != null) totalEye += r.getEyeContactPercentage();
                if (r.getPostureScore() != null) totalPosture += r.getPostureScore();
                if (r.getFillerCount() != null) totalFillers += r.getFillerCount();
                if (r.getWordsPerMinute() != null) totalWpm += r.getWordsPerMinute();
            } else {
                qDto.setIdealAnswer(q.getIdealAnswer());
            }
            qDtos.add(qDto);
        }

        if (count > 0) {
            dto.setAvgEyeContact(Math.round((totalEye / count) * 10.0) / 10.0);
            dto.setAvgPostureScore(Math.round((totalPosture / count) * 10.0) / 10.0);
            dto.setTotalFillerWords(totalFillers);
            dto.setAvgWpm(totalWpm / count);
        }

        dto.setQuestions(qDtos);
        return dto;
    }
}
