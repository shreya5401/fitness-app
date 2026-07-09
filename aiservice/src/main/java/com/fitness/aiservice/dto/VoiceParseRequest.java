package com.fitness.aiservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VoiceParseRequest {
    @NotBlank(message = "Transcript is required")
    private String transcript;
    private PreviousContext previousContext;

    @Data
    public static class PreviousContext {
        private String exercise;
        private Integer sets;
        private Integer reps;
        private Double weight;
        private String unit;
    }
}
