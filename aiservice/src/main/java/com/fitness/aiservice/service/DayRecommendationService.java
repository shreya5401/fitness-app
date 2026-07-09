package com.fitness.aiservice.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fitness.aiservice.dto.ActivitySnapshotRequest;
import com.fitness.aiservice.model.DayRecommendation;
import com.fitness.aiservice.repository.DayRecommendationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DayRecommendationService {
    private final DayRecommendationRepository repository;
    private final ActivityAIService activityAIService;

    public Optional<DayRecommendation> getDayRecommendation(String userId, String date) {
        return repository.findByUserIdAndDate(userId, date);
    }

    public DayRecommendation generateDayRecommendation(String userId, String date, List<ActivitySnapshotRequest> activities) {
        DayRecommendation generated = activityAIService.generateDayRecommendation(userId, date, activities);

        repository.findByUserIdAndDate(userId, date)
                .ifPresent(existing -> generated.setId(existing.getId()));

        DayRecommendation saved = repository.save(generated);
        log.info("Saved day recommendation {} for user {} on {}", saved.getId(), userId, date);
        return saved;
    }
}
