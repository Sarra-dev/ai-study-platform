package com.studyai.controller;

import com.studyai.dto.NoteRequest;
import com.studyai.dto.NoteResponse;
import com.studyai.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(@Valid @RequestBody NoteRequest request,
                                                    Authentication auth) {
        return ResponseEntity.ok(noteService.createNote(request, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getAllNotes(Authentication auth) {
        return ResponseEntity.ok(noteService.getAllNotes(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> getNoteById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(noteService.getNoteById(id, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(@PathVariable Long id,
                                                    @Valid @RequestBody NoteRequest request,
                                                    Authentication auth) {
        return ResponseEntity.ok(noteService.updateNote(id, request, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id, Authentication auth) {
        noteService.deleteNote(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // AI: Summarize note content
    @PostMapping("/{id}/summarize")
    public ResponseEntity<NoteResponse> summarizeNote(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(noteService.summarizeNote(id, auth.getName()));
    }
}
