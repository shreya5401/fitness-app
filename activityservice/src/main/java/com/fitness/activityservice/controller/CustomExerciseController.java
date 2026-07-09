package com.fitness.activityservice.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitness.activityservice.dto.CustomExerciseRequest;
import com.fitness.activityservice.dto.CustomExerciseResponse;
import com.fitness.activityservice.service.CustomExerciseService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/custom-exercises")
@AllArgsConstructor
@Slf4j
public class CustomExerciseController {

    private CustomExerciseService customExerciseService;

    @PostMapping
    public ResponseEntity<CustomExerciseResponse> createCustomExercise(@Valid @RequestBody CustomExerciseRequest request, @RequestHeader("X-User-ID") String userId){
        log.info("Received request to create custom exercise for user {}", userId);
        if(userId!=null){
            request.setUserId(userId);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(customExerciseService.createCustomExercise(request));
    }

    @GetMapping
    public ResponseEntity<List<CustomExerciseResponse>> getUserCustomExercises(@RequestHeader("X-User-ID") String userId){
        return ResponseEntity.ok(customExerciseService.getUserCustomExercises(userId));
    }

}
