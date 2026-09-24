package com.aiinterview.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_responses")
public class InterviewResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;

    @Lob
    private String studentAnswerText;

    private Integer audioDurationSec;
    private Integer wordsPerMinute;
    private Integer fillerCount;

    // MediaPipe & Computer Vision metrics
    private Double eyeContactPercentage;
    private Double postureScore;
    private Double confidenceScore;

    // AI Evaluation breakdown
    private Double score; // 0 to 100
    private Double technicalScore;
    private Double communicationScore;

    @Lob
    private String aiCritique;

    @Lob
    private String keyStrengths;

    @Lob
    private String areasToImprove;

    @Lob
    private String idealModelAnswer;

    private String correctnessStatus; // "CORRECT", "PARTIALLY_CORRECT", "INCORRECT"
    private String voiceTone; // "CALM_STEADY", "RUSHED_NERVOUS", "HESITANT"
    private String cameraPresence; // "OPTIMAL_EYE_CONTACT", "LOOKING_AWAY_DOWN", "RESTLESS"

    private LocalDateTime answeredAt = LocalDateTime.now();

    public InterviewResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public InterviewQuestion getQuestion() { return question; }
    public void setQuestion(InterviewQuestion question) { this.question = question; }

    public String getStudentAnswerText() { return studentAnswerText; }
    public void setStudentAnswerText(String studentAnswerText) { this.studentAnswerText = studentAnswerText; }

    public Integer getAudioDurationSec() { return audioDurationSec; }
    public void setAudioDurationSec(Integer audioDurationSec) { this.audioDurationSec = audioDurationSec; }

    public Integer getWordsPerMinute() { return wordsPerMinute; }
    public void setWordsPerMinute(Integer wordsPerMinute) { this.wordsPerMinute = wordsPerMinute; }

    public Integer getFillerCount() { return fillerCount; }
    public void setFillerCount(Integer fillerCount) { this.fillerCount = fillerCount; }

    public Double getEyeContactPercentage() { return eyeContactPercentage; }
    public void setEyeContactPercentage(Double eyeContactPercentage) { this.eyeContactPercentage = eyeContactPercentage; }

    public Double getPostureScore() { return postureScore; }
    public void setPostureScore(Double postureScore) { this.postureScore = postureScore; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Double getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Double technicalScore) { this.technicalScore = technicalScore; }

    public Double getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Double communicationScore) { this.communicationScore = communicationScore; }

    public String getAiCritique() { return aiCritique; }
    public void setAiCritique(String aiCritique) { this.aiCritique = aiCritique; }

    public String getKeyStrengths() { return keyStrengths; }
    public void setKeyStrengths(String keyStrengths) { this.keyStrengths = keyStrengths; }

    public String getAreasToImprove() { return areasToImprove; }
    public void setAreasToImprove(String areasToImprove) { this.areasToImprove = areasToImprove; }

    public String getIdealModelAnswer() { return idealModelAnswer; }
    public void setIdealModelAnswer(String idealModelAnswer) { this.idealModelAnswer = idealModelAnswer; }

    public String getCorrectnessStatus() { return correctnessStatus; }
    public void setCorrectnessStatus(String correctnessStatus) { this.correctnessStatus = correctnessStatus; }

    public String getVoiceTone() { return voiceTone; }
    public void setVoiceTone(String voiceTone) { this.voiceTone = voiceTone; }

    public String getCameraPresence() { return cameraPresence; }
    public void setCameraPresence(String cameraPresence) { this.cameraPresence = cameraPresence; }

    public LocalDateTime getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(LocalDateTime answeredAt) { this.answeredAt = answeredAt; }
}
