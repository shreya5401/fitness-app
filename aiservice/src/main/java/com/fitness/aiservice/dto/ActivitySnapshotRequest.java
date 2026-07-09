package com.fitness.aiservice.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ActivitySnapshotRequest {
    private String activityId;
    private String type;
    private String muscleGroup;
    private List<SetDto> sets;
    private Integer duration;
    private Integer caloriesBurnt;
    private LocalDateTime updatedAt;

    @Data
    public static class SetDto {
        private Integer reps;
        private Double weight;
    }
}
