package com.fitness.aiservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VoiceParseResponse {
    private String exercise;
    private Integer sets;
    private Integer reps;
    private Double weight;
    private String unit;
    private String notes;
    private double confidence;
    private boolean parseFailed;
}
