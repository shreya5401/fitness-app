package com.fitness.aiservice.messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import com.fitness.aiservice.service.ActivityAIService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityMessageListener {
    private final ActivityAIService aiService;
    private final RecommendationRepository recommendationRepository;

    @RabbitListener(queues = "${rabbitmq.queue.name}")
    public void processActivity(Activity activity) {
        log.info("Received activity for processing: {}", activity.getId());

        try {
            //log.info("Generated Recommendation: {}", aiService.generateRecommendation(activity));
            Recommendation recommendation = aiService.generateRecommendation(activity);

            recommendationRepository.save(recommendation);
        } catch (Exception e) {
            log.error("Failed to process activity {}: {}", activity.getId(), e.getMessage(), e);
        }
    }
}
