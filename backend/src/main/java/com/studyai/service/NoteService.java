package com.studyai.service;

import com.studyai.ai.ClaudeAiService;
import com.studyai.dto.NoteRequest;
import com.studyai.dto.NoteResponse;
import com.studyai.model.Note;
import com.studyai.model.User;
import com.studyai.repository.NoteRepository;
import com.studyai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    @Autowired private NoteRepository noteRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ClaudeAiService aiService;

    public NoteResponse createNote(NoteRequest request, String email) {
        User user = getUser(email);
        Note note = Note.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .subject(request.getSubject())
                .tags(request.getTags())
                .userId(user.getId())
                .build();
        return toResponse(noteRepository.save(note));
    }

    public List<NoteResponse> getAllNotes(String email) {
        User user = getUser(email);
        return noteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public NoteResponse getNoteById(String id, String email) {
        User user = getUser(email);
        Note note = noteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Note not found"));
        return toResponse(note);
    }

    public NoteResponse updateNote(String id, NoteRequest request, String email) {
        User user = getUser(email);
        Note note = noteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setSubject(request.getSubject());
        note.setTags(request.getTags());
        note.setUpdatedAt(LocalDateTime.now());
        return toResponse(noteRepository.save(note));
    }

    public void deleteNote(String id, String email) {
        User user = getUser(email);
        Note note = noteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Note not found"));
        noteRepository.delete(note);
    }

    /**
     * Summarise the note content via AI and persist the result.
     * This is the main fix: we call aiService.summarizeText(), store it on the
     * document, then save — so the summary actually reaches the database.
     */
    public NoteResponse summarizeNote(String id, String email) {
        User user = getUser(email);
        Note note = noteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Note not found"));

        String summary = aiService.summarizeText(note.getContent());
        note.setAiSummary(summary);
        note.setUpdatedAt(LocalDateTime.now());
        return toResponse(noteRepository.save(note));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private NoteResponse toResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .aiSummary(note.getAiSummary())
                .subject(note.getSubject())
                .tags(note.getTags())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}