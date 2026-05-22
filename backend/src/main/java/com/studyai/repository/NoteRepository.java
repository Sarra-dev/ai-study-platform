package com.studyai.repository;

import com.studyai.model.Note;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends MongoRepository<Note, String> {
    List<Note> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Note> findByIdAndUserId(String id, String userId);
}