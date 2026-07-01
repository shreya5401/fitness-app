package com.fitness.activityservice.dto;

import java.time.LocalDateTime;

import java.util.Map;

import lombok.Data;

import com.fitness.activityservice.model.ActivityType;

@Data
public class ActivityResponse {
    private String id;
    private String userId;
    private ActivityType type;
    private Integer duration;
    private Integer caloriesBurnt;
    private LocalDateTime startTime;
    private Map<String, Object> additionalMetrics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
