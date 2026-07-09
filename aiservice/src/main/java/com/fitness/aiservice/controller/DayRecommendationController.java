package com.fitness.aiservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitness.aiservice.dto.ActivitySnapshotRequest;
import com.fitness.aiservice.model.DayRecommendation;
import com.fitness.aiservice.service.DayRecommendationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations/day")
@Slf4j
public class DayRecommendationController {
    private final DayRecommendationService dayRecommendationService;

    @GetMapping("/{date}")
    public ResponseEntity<DayRecommendation> getDayRecommendation(
            @PathVariable String date, @RequestHeader("X-User-Id") String userId) {
        return dayRecommendationService.getDayRecommendation(userId, date)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/{date}")
    public ResponseEntity<DayRecommendation> generateDayRecommendation(
            @PathVariable String date, @RequestHeader("X-User-Id") String userId,
            @RequestBody List<ActivitySnapshotRequest> activities) {
        log.info("Received request to generate day recommendation for user {} on {}", userId, date);
        return ResponseEntity.ok(
                dayRecommendationService.generateDayRecommendation(userId, date, activities));
    }
}
