package com.studyai.controller;

import com.studyai.dto.TaskRequest;
import com.studyai.dto.TaskResponse;
import com.studyai.model.Task;
import com.studyai.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(taskService.createTask(request, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(Authentication auth) {
        return ResponseEntity.ok(taskService.getAllTasks(auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable String id,
                                                   @Valid @RequestBody TaskRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(taskService.updateTask(id, request, auth.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(@PathVariable String id,
                                                     @RequestParam Task.Status status,
                                                     Authentication auth) {
        return ResponseEntity.ok(taskService.updateStatus(id, status, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id, Authentication auth) {
        taskService.deleteTask(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}