package com.aiinterview.platform.dto;

import com.aiinterview.platform.model.Difficulty;
import com.aiinterview.platform.model.InterviewCategory;
import com.aiinterview.platform.model.InterviewStatus;

import java.time.LocalDateTime;
import java.util.List;

public class InterviewDtos {

    public static class CreateInterviewRequest {
        private String title;
        private String roleTarget;
        private Difficulty difficulty = Difficulty.MEDIUM;
        private InterviewCategory category = InterviewCategory.MIXED;
        private Integer questionCount = 5;
        private String resumeOverride;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getRoleTarget() { return roleTarget; }
        public void setRoleTarget(String roleTarget) { this.roleTarget = roleTarget; }
        public Difficulty getDifficulty() { return difficulty; }
        public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
        public InterviewCategory getCategory() { return category; }
        public void setCategory(InterviewCategory category) { this.category = category; }
        public Integer getQuestionCount() { return questionCount; }
        public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }
        public String getResumeOverride() { return resumeOverride; }
        public void setResumeOverride(String resumeOverride) { this.resumeOverride = resumeOverride; }
    }

    public static class QuestionDto {
        private Long id;
        private String questionText;
        private String category;
        private String difficulty;
        private Integer orderIndex;

        public QuestionDto() {}
        public QuestionDto(Long id, String questionText, String category, String difficulty, Integer orderIndex) {
            this.id = id;
            this.questionText = questionText;
            this.category = category;
            this.difficulty = difficulty;
            this.orderIndex = orderIndex;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        public Integer getOrderIndex() { return orderIndex; }
        public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    }

    public static class SubmitAnswerRequest {
        private Long questionId;
        private String answerText;
        private Integer durationSeconds;
        private Double eyeContactPercentage;
        private Double postureScore;
        private Double confidenceScore;
        private Integer fillerCount;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getAnswerText() { return answerText; }
        public void setAnswerText(String answerText) { this.answerText = answerText; }
        public Integer getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
        public Double getEyeContactPercentage() { return eyeContactPercentage; }
        public void setEyeContactPercentage(Double eyeContactPercentage) { this.eyeContactPercentage = eyeContactPercentage; }
        public Double getPostureScore() { return postureScore; }
        public void setPostureScore(Double postureScore) { this.postureScore = postureScore; }
        public Double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
        public Integer getFillerCount() { return fillerCount; }
        public void setFillerCount(Integer fillerCount) { this.fillerCount = fillerCount; }
    }

    public static class QuestionFeedbackDto {
        private Long questionId;
        private Integer orderIndex;
        private String questionText;
        private String category;
        private String studentAnswer;
        private Double score;
        private Double technicalScore;
        private Double communicationScore;
        private Double eyeContactPercentage;
        private Double postureScore;
        private Integer fillerCount;
        private Integer wordsPerMinute;
        private String critique;
        private String strengths;
        private String improvements;
        private String idealAnswer;
        private String correctnessStatus; // "CORRECT", "PARTIALLY_CORRECT", "INCORRECT"
        private String voiceTone; // "CALM_STEADY", "RUSHED_NERVOUS", "HESITANT"
        private String cameraPresence; // "OPTIMAL_EYE_CONTACT", "LOOKING_AWAY_DOWN", "RESTLESS"

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public Integer getOrderIndex() { return orderIndex; }
        public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getStudentAnswer() { return studentAnswer; }
        public void setStudentAnswer(String studentAnswer) { this.studentAnswer = studentAnswer; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Double getTechnicalScore() { return technicalScore; }
        public void setTechnicalScore(Double technicalScore) { this.technicalScore = technicalScore; }
        public Double getCommunicationScore() { return communicationScore; }
        public void setCommunicationScore(Double communicationScore) { this.communicationScore = communicationScore; }
        public Double getEyeContactPercentage() { return eyeContactPercentage; }
        public void setEyeContactPercentage(Double eyeContactPercentage) { this.eyeContactPercentage = eyeContactPercentage; }
        public Double getPostureScore() { return postureScore; }
        public void setPostureScore(Double postureScore) { this.postureScore = postureScore; }
        public Integer getFillerCount() { return fillerCount; }
        public void setFillerCount(Integer fillerCount) { this.fillerCount = fillerCount; }
        public Integer getWordsPerMinute() { return wordsPerMinute; }
        public void setWordsPerMinute(Integer wordsPerMinute) { this.wordsPerMinute = wordsPerMinute; }
        public String getCritique() { return critique; }
        public void setCritique(String critique) { this.critique = critique; }
        public String getStrengths() { return strengths; }
        public void setStrengths(String strengths) { this.strengths = strengths; }
        public String getImprovements() { return improvements; }
        public void setImprovements(String improvements) { this.improvements = improvements; }
        public String getIdealAnswer() { return idealAnswer; }
        public void setIdealAnswer(String idealAnswer) { this.idealAnswer = idealAnswer; }
        public String getCorrectnessStatus() { return correctnessStatus; }
        public void setCorrectnessStatus(String correctnessStatus) { this.correctnessStatus = correctnessStatus; }
        public String getVoiceTone() { return voiceTone; }
        public void setVoiceTone(String voiceTone) { this.voiceTone = voiceTone; }
        public String getCameraPresence() { return cameraPresence; }
        public void setCameraPresence(String cameraPresence) { this.cameraPresence = cameraPresence; }
    }

    public static class FullInterviewReportDto {
        private Long interviewId;
        private String title;
        private String roleTarget;
        private Difficulty difficulty;
        private InterviewCategory category;
        private InterviewStatus status;
        private Double overallScore;
        private Double technicalScore;
        private Double communicationScore;
        private Double confidenceScore;
        private Double avgEyeContact;
        private Double avgPostureScore;
        private Integer totalFillerWords;
        private Integer avgWpm;
        private String placementReadiness;
        private String feedbackSummary;
        private String strengths;
        private String improvements;
        private String resumeFeedback;
        private String voiceFeedback;
        private String cameraFeedback;
        private LocalDateTime completedAt;
        private List<QuestionFeedbackDto> questions;

        public Long getInterviewId() { return interviewId; }
        public void setInterviewId(Long interviewId) { this.interviewId = interviewId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getRoleTarget() { return roleTarget; }
        public void setRoleTarget(String roleTarget) { this.roleTarget = roleTarget; }
        public Difficulty getDifficulty() { return difficulty; }
        public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
        public InterviewCategory getCategory() { return category; }
        public void setCategory(InterviewCategory category) { this.category = category; }
        public InterviewStatus getStatus() { return status; }
        public void setStatus(InterviewStatus status) { this.status = status; }
        public Double getOverallScore() { return overallScore; }
        public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }
        public Double getTechnicalScore() { return technicalScore; }
        public void setTechnicalScore(Double technicalScore) { this.technicalScore = technicalScore; }
        public Double getCommunicationScore() { return communicationScore; }
        public void setCommunicationScore(Double communicationScore) { this.communicationScore = communicationScore; }
        public Double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
        public Double getAvgEyeContact() { return avgEyeContact; }
        public void setAvgEyeContact(Double avgEyeContact) { this.avgEyeContact = avgEyeContact; }
        public Double getAvgPostureScore() { return avgPostureScore; }
        public void setAvgPostureScore(Double avgPostureScore) { this.avgPostureScore = avgPostureScore; }
        public Integer getTotalFillerWords() { return totalFillerWords; }
        public void setTotalFillerWords(Integer totalFillerWords) { this.totalFillerWords = totalFillerWords; }
        public Integer getAvgWpm() { return avgWpm; }
        public void setAvgWpm(Integer avgWpm) { this.avgWpm = avgWpm; }
        public String getPlacementReadiness() { return placementReadiness; }
        public void setPlacementReadiness(String placementReadiness) { this.placementReadiness = placementReadiness; }
        public String getFeedbackSummary() { return feedbackSummary; }
        public void setFeedbackSummary(String feedbackSummary) { this.feedbackSummary = feedbackSummary; }
        public String getStrengths() { return strengths; }
        public void setStrengths(String strengths) { this.strengths = strengths; }
        public String getImprovements() { return improvements; }
        public void setImprovements(String improvements) { this.improvements = improvements; }
        public String getResumeFeedback() { return resumeFeedback; }
        public void setResumeFeedback(String resumeFeedback) { this.resumeFeedback = resumeFeedback; }
        public String getVoiceFeedback() { return voiceFeedback; }
        public void setVoiceFeedback(String voiceFeedback) { this.voiceFeedback = voiceFeedback; }
        public String getCameraFeedback() { return cameraFeedback; }
        public void setCameraFeedback(String cameraFeedback) { this.cameraFeedback = cameraFeedback; }
        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
        public List<QuestionFeedbackDto> getQuestions() { return questions; }
        public void setQuestions(List<QuestionFeedbackDto> questions) { this.questions = questions; }
    }

    public static class InterviewSummaryItemDto {
        private Long id;
        private String title;
        private String roleTarget;
        private Difficulty difficulty;
        private InterviewStatus status;
        private Double overallScore;
        private String placementReadiness;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getRoleTarget() { return roleTarget; }
        public void setRoleTarget(String roleTarget) { this.roleTarget = roleTarget; }
        public Difficulty getDifficulty() { return difficulty; }
        public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
        public InterviewStatus getStatus() { return status; }
        public void setStatus(InterviewStatus status) { this.status = status; }
        public Double getOverallScore() { return overallScore; }
        public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }
        public String getPlacementReadiness() { return placementReadiness; }
        public void setPlacementReadiness(String placementReadiness) { this.placementReadiness = placementReadiness; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    }

    public static class DashboardStatsDto {
        private long totalInterviews;
        private long completedInterviews;
        private double averageOverallScore;
        private double averageTechnicalScore;
        private double averageCommunicationScore;
        private double averageConfidenceScore;
        private String placementReadinessStatus;
        private List<InterviewSummaryItemDto> recentInterviews;

        public long getTotalInterviews() { return totalInterviews; }
        public void setTotalInterviews(long totalInterviews) { this.totalInterviews = totalInterviews; }
        public long getCompletedInterviews() { return completedInterviews; }
        public void setCompletedInterviews(long completedInterviews) { this.completedInterviews = completedInterviews; }
        public double getAverageOverallScore() { return averageOverallScore; }
        public void setAverageOverallScore(double averageOverallScore) { this.averageOverallScore = averageOverallScore; }
        public double getAverageTechnicalScore() { return averageTechnicalScore; }
        public void setAverageTechnicalScore(double averageTechnicalScore) { this.averageTechnicalScore = averageTechnicalScore; }
        public double getAverageCommunicationScore() { return averageCommunicationScore; }
        public void setAverageCommunicationScore(double averageCommunicationScore) { this.averageCommunicationScore = averageCommunicationScore; }
        public double getAverageConfidenceScore() { return averageConfidenceScore; }
        public void setAverageConfidenceScore(double averageConfidenceScore) { this.averageConfidenceScore = averageConfidenceScore; }
        public String getPlacementReadinessStatus() { return placementReadinessStatus; }
        public void setPlacementReadinessStatus(String placementReadinessStatus) { this.placementReadinessStatus = placementReadinessStatus; }
        public List<InterviewSummaryItemDto> getRecentInterviews() { return recentInterviews; }
        public void setRecentInterviews(List<InterviewSummaryItemDto> recentInterviews) { this.recentInterviews = recentInterviews; }
    }
}
