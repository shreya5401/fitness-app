package com.fitness.activityservice.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "custom_exercises")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomExercise {
    @Id
    private String id;
    private String userId;
    private String name;
    private MuscleGroup muscleGroup;

    @CreatedDate
    private LocalDateTime createdAt;
}
