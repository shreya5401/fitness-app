package com.fitness.activityservice.dto;

import com.fitness.activityservice.model.MuscleGroup;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CustomExerciseRequest {
    private String userId;

    @NotBlank(message = "Exercise name is required")
    private String name;

    @NotNull(message = "Muscle group is required")
    private MuscleGroup muscleGroup;
}
