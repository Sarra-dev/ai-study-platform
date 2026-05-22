package com.studyai.repository;

import com.studyai.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Task> findByIdAndUserId(String id, String userId);
    List<Task> findByUserIdAndStatus(String userId, Task.Status status);
}