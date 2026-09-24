package com.aiinterview.platform.repository;

import com.aiinterview.platform.model.InterviewResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewResponseRepository extends JpaRepository<InterviewResponse, Long> {
    Optional<InterviewResponse> findByQuestionId(Long questionId);
}
