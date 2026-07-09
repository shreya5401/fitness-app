package com.fitness.aiservice.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.fitness.aiservice.model.DayRecommendation;

public interface DayRecommendationRepository extends MongoRepository<DayRecommendation, String> {
    Optional<DayRecommendation> findByUserIdAndDate(String userId, String date);
}
