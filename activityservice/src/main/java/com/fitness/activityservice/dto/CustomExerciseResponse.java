package com.fitness.activityservice.dto;

import java.time.LocalDateTime;

import com.fitness.activityservice.model.MuscleGroup;

import lombok.Data;

@Data
public class CustomExerciseResponse {
    private String id;
    private String userId;
    private String name;
    private MuscleGroup muscleGroup;
    private LocalDateTime createdAt;
}
