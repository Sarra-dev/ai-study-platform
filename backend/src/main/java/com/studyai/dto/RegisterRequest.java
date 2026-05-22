package com.studyai.dto;

import com.studyai.model.Task;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Auth
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50) public String username;
    @NotBlank @Email public String email;
    @NotBlank @Size(min = 6) public String password;
}
