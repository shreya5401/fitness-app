package com.fitness.aiservice.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "day_recommendations")
@CompoundIndex(name = "user_date_idx", def = "{'userId':1,'date':1}", unique = true)
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DayRecommendation {
    @Id
    private String id;
    private String userId;
    private String date;
    private String recommendation;
    private List<String> improvements;
    private List<String> suggestions;
    private List<String> safety;
    private List<ActivitySnapshot> activitySnapshot;
    private LocalDateTime generatedAt;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ActivitySnapshot {
        private String activityId;
        private LocalDateTime updatedAt;
    }
}
