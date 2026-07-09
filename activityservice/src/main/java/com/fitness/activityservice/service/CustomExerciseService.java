package com.fitness.activityservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fitness.activityservice.dto.CustomExerciseRequest;
import com.fitness.activityservice.dto.CustomExerciseResponse;
import com.fitness.activityservice.model.CustomExercise;
import com.fitness.activityservice.repository.CustomExerciseRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomExerciseService {

    private final CustomExerciseRepository customExerciseRepository;

    public CustomExerciseResponse createCustomExercise(CustomExerciseRequest request) {
        CustomExercise customExercise = CustomExercise.builder()
        .userId(request.getUserId())
        .name(request.getName())
        .muscleGroup(request.getMuscleGroup())
        .build();

        CustomExercise saved = customExerciseRepository.save(customExercise);
        log.info("Created custom exercise {} for user {}", saved.getId(), saved.getUserId());
        return mapToResponse(saved);
    }

    public List<CustomExerciseResponse> getUserCustomExercises(String userId) {
        return customExerciseRepository.findByUserId(userId)
        .stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
    }

    private CustomExerciseResponse mapToResponse(CustomExercise customExercise) {
        CustomExerciseResponse response = new CustomExerciseResponse();
        response.setId(customExercise.getId());
        response.setUserId(customExercise.getUserId());
        response.setName(customExercise.getName());
        response.setMuscleGroup(customExercise.getMuscleGroup());
        response.setCreatedAt(customExercise.getCreatedAt());
        return response;
    }

}
