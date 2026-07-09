package com.fitness.activityservice.service;

import org.springframework.stereotype.Service;

import com.fitness.activityservice.dto.ActivityRequest;
import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.exception.ResourceNotFoundException;
import com.fitness.activityservice.exception.UnauthorizedActionException;
import com.fitness.activityservice.model.Activity;
import com.fitness.activityservice.repository.ActivityRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserValidationService userValidationService;

    public ActivityResponse trackActivity(ActivityRequest request) {
        boolean isValidUser= userValidationService.validateUser(request.getUserId());

        if(!isValidUser){
            log.warn("Rejected activity creation for invalid user: {}", request.getUserId());
            throw new RuntimeException("Invalid User: "+request.getUserId());
        }

        Activity activity = Activity.builder()
        .userId(request.getUserId())
        .type(request.getType())
        .muscleGroup(request.getMuscleGroup())
        .sets(request.getSets())
        .duration(request.getDuration())
        .caloriesBurnt(request.getCaloriesBurnt())
        .startTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now())
        .additionalMetrics(request.getAdditionalMetrics())
        .build();

        Activity savedActivity = activityRepository.save(activity);
        log.info("Tracked activity {} for user {}", savedActivity.getId(), savedActivity.getUserId());

        return mapToResponse(savedActivity);

    }


    private ActivityResponse mapToResponse(Activity activity){
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setUserId(activity.getUserId());
        response.setType(activity.getType());
        response.setMuscleGroup(activity.getMuscleGroup());
        response.setSets(activity.getSets());
        response.setDuration(activity.getDuration());
        response.setCaloriesBurnt(activity.getCaloriesBurnt());
        response.setStartTime(activity.getStartTime());
        response.setAdditionalMetrics(activity.getAdditionalMetrics());
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());


        return response;
    }


    public List<ActivityResponse> getUserActivities(String userId) {
        List<Activity> activities= activityRepository.findByUserId(userId);

        return activities.stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
    }


    public ActivityResponse getActivityById(String activityId) {
        return activityRepository.findById(activityId)
        .map(this::mapToResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: "+activityId));
    }

    public ActivityResponse updateActivity(String activityId, ActivityRequest request) {
        Activity activity = activityRepository.findById(activityId)
        .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: "+activityId));

        if(!activity.getUserId().equals(request.getUserId())){
            log.warn("User {} attempted to update activity {} owned by {}", request.getUserId(), activityId, activity.getUserId());
            throw new UnauthorizedActionException("Not authorized to update this activity");
        }

        activity.setType(request.getType());
        activity.setMuscleGroup(request.getMuscleGroup());
        activity.setSets(request.getSets());
        activity.setDuration(request.getDuration());
        activity.setCaloriesBurnt(request.getCaloriesBurnt());
        if(request.getStartTime() != null){
            activity.setStartTime(request.getStartTime());
        }
        activity.setAdditionalMetrics(request.getAdditionalMetrics());

        Activity saved = activityRepository.save(activity);
        log.info("Updated activity {}", saved.getId());
        return mapToResponse(saved);
    }

    public void deleteActivity(String activityId, String userId) {
        Activity activity = activityRepository.findById(activityId)
        .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: "+activityId));

        if(!activity.getUserId().equals(userId)){
            log.warn("User {} attempted to delete activity {} owned by {}", userId, activityId, activity.getUserId());
            throw new UnauthorizedActionException("Not authorized to delete this activity");
        }

        activityRepository.deleteById(activityId);
        log.info("Deleted activity {}", activityId);
    }

}
