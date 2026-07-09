package com.fitness.activityservice.dto;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Map;

import lombok.Data;

import com.fitness.activityservice.model.ExerciseSet;
import com.fitness.activityservice.model.MuscleGroup;

@Data
public class ActivityResponse {
    private String id;
    private String userId;
    private String type;
    private MuscleGroup muscleGroup;
    private List<ExerciseSet> sets;
    private Integer duration;
    private Integer caloriesBurnt;
    private LocalDateTime startTime;
    private Map<String, Object> additionalMetrics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
