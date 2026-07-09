package com.fitness.activityservice.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import com.fitness.activityservice.model.ExerciseSet;
import com.fitness.activityservice.model.MuscleGroup;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActivityRequest {
    private String userId;

    @NotBlank(message = "Activity type is required")
    private String type;

    @NotNull(message = "Muscle group is required")
    private MuscleGroup muscleGroup;

    private List<ExerciseSet> sets;
    private Integer duration;
    private Integer caloriesBurnt;
    private LocalDateTime startTime;
    private Map<String, Object> additionalMetrics;
}
