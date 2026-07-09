package com.fitness.activityservice.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.fitness.activityservice.model.CustomExercise;

@Repository
public interface CustomExerciseRepository extends MongoRepository<CustomExercise, String>{

    List<CustomExercise> findByUserId(String userId);

}
