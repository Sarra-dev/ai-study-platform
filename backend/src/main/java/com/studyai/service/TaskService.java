package com.studyai.service;

import com.studyai.dto.TaskRequest;
import com.studyai.dto.TaskResponse;
import com.studyai.model.Task;
import com.studyai.model.User;
import com.studyai.repository.TaskRepository;
import com.studyai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired private TaskRepository taskRepository;
    @Autowired private UserRepository userRepository;

    public TaskResponse createTask(TaskRequest request, String email) {
        User user = getUser(email);
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Task.Status.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .subject(request.getSubject())
                .user(user)
                .build();
        return toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getAllTasks(String email) {
        User user = getUser(email);
        return taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TaskResponse updateTask(Long id, TaskRequest request, String email) {
        User user = getUser(email);
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setSubject(request.getSubject());
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateStatus(Long id, Task.Status status, String email) {
        User user = getUser(email);
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id, String email) {
        User user = getUser(email);
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
        taskRepository.delete(task);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .subject(task.getSubject())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
