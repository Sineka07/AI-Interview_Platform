package com.aiinterview.platform.repository;

import com.aiinterview.platform.model.Interview;
import com.aiinterview.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserOrderByCreatedAtDesc(User user);
    List<Interview> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUser(User user);
}
