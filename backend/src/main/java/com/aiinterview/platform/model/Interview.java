package com.aiinterview.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String roleTarget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty = Difficulty.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewCategory category = InterviewCategory.MIXED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewStatus status = InterviewStatus.PENDING;

    private Integer questionCount = 5;

    private Double overallScore;
    private Double technicalScore;
    private Double communicationScore;
    private Double confidenceScore;

    @Lob
    private String feedbackSummary;

    @Lob
    private String strengths;

    @Lob
    private String improvements;

    @Lob
    private String resumeFeedback;

    @Lob
    private String voiceFeedback;

    @Lob
    private String cameraFeedback;

    private String placementReadiness; // e.g. "HIGH", "MODERATE", "NEEDS_PREPARATION"

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<InterviewQuestion> questions = new ArrayList<>();

    public Interview() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }

    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

    public Double getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Double technicalScore) { this.technicalScore = technicalScore; }

    public Double getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Double communicationScore) { this.communicationScore = communicationScore; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

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

    public String getPlacementReadiness() { return placementReadiness; }
    public void setPlacementReadiness(String placementReadiness) { this.placementReadiness = placementReadiness; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public List<InterviewQuestion> getQuestions() { return questions; }
    public void setQuestions(List<InterviewQuestion> questions) { this.questions = questions; }
}
