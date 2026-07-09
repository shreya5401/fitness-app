package com.fitness.aiservice.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.dto.ActivitySnapshotRequest;
import com.fitness.aiservice.model.DayRecommendation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityAIService {
    private final GeminiService geminiService;

    public DayRecommendation generateDayRecommendation(String userId, String date, List<ActivitySnapshotRequest> activities){
        String prompt= createPromptForDay(date, activities);
        String aiResponse=geminiService.getAnswer(prompt);
        return buildDayRecommendation(userId, date, activities, aiResponse);
    }

    private DayRecommendation buildDayRecommendation(String userId, String date, List<ActivitySnapshotRequest> activities, String aiResponse){
        List<DayRecommendation.ActivitySnapshot> snapshot = activities.stream()
            .map(a -> DayRecommendation.ActivitySnapshot.builder()
                .activityId(a.getActivityId())
                .updatedAt(a.getUpdatedAt())
                .build())
            .collect(Collectors.toList());

        try{
            ObjectMapper mapper= new ObjectMapper();
            JsonNode rootNode= mapper.readTree(aiResponse);

            JsonNode textNode=rootNode.path("candidates")
            .get(0)
            .path("content")
            .path("parts")
            .get(0)
            .path("text");

            String jsonContent=textNode.asText()
            .replaceAll("```json\\n","")
            .replaceAll("\\n```","")
            .trim();

            JsonNode analysisJson = mapper.readTree(jsonContent);
            JsonNode analysisNode = analysisJson.path("analysis");
            StringBuilder fullAnalysis = new StringBuilder();
            addAnalysisSection(fullAnalysis, analysisNode, "overall", "Overall:");
            addAnalysisSection(fullAnalysis, analysisNode, "pace", "Pace:");
            addAnalysisSection(fullAnalysis, analysisNode, "heartRate", "Heart Rate:");
            addAnalysisSection(fullAnalysis, analysisNode, "caloriesBurnt", "Calories Burnt:");

            List<String> improvements=extractImprovements(analysisJson.path("improvements"));
            List<String> suggestions=extractSuggestions(analysisJson.path("suggestions"));
            List<String> safety=extractSafetyGuidelines(analysisJson.path("safety"));

            return DayRecommendation.builder()
                    .userId(userId)
                    .date(date)
                    .recommendation(fullAnalysis.toString().trim())
                    .improvements(improvements)
                    .suggestions(suggestions)
                    .safety(safety)
                    .activitySnapshot(snapshot)
                    .generatedAt(LocalDateTime.now())
                    .build();

        }catch (Exception e) {
            log.error("Failed to parse AI response for day recommendation: {}", e.getMessage(), e);
            return DayRecommendation.builder()
            .userId(userId)
            .date(date)
            .recommendation("Unable to generate recommendation.")
            .improvements(Collections.singletonList("No improvements available"))
            .suggestions(Collections.singletonList("No suggestions available"))
            .safety(Collections.singletonList("No safety guidelines available"))
            .activitySnapshot(snapshot)
            .generatedAt(LocalDateTime.now())
            .build();
        }
    }

    private List<String> extractSafetyGuidelines(JsonNode safetyNode) {
        List<String> safety = new ArrayList<>();

        if (safetyNode != null && safetyNode.isArray()) {
            safetyNode.forEach(item -> {
                safety.add(item.asText());
            });
        }

        return safety.isEmpty()
                ? Collections.singletonList("Follow general safety guidelines")
                : safety;
    }


    private List<String> extractSuggestions(JsonNode suggestionsNode) {
        List<String> suggestions = new ArrayList<>();

        if (suggestionsNode != null && suggestionsNode.isArray()) {
            suggestionsNode.forEach(suggestion -> {
                String workout = suggestion.path("workout").asText();
                String description = suggestion.path("description").asText();
                suggestions.add(String.format("%s: %s", workout, description));
            });
        }

        return suggestions.isEmpty()
                ? Collections.singletonList("No specific suggestions provided")
                : suggestions;
    }

    private List<String> extractImprovements(JsonNode improvementsNode) {
        List<String> improvements = new ArrayList<>();

        if (improvementsNode != null && improvementsNode.isArray()) {
            improvementsNode.forEach(improvement -> {
                String area = improvement.path("area").asText();
                String detail = improvement.path("recommendation").asText();
                improvements.add(String.format("%s: %s", area, detail));
            });
        }

        return improvements.isEmpty()
                ? Collections.singletonList("No specific improvements provided")
                : improvements;
    }

    private void addAnalysisSection(StringBuilder fullAnalysis, JsonNode analysisNode, String key, String prefix) {
        if(!analysisNode.path(key).isMissingNode()){
            fullAnalysis.append(prefix)
            .append(analysisNode.path(key).asText())
            .append("\n\n");
        }
    }

    private String formatSets(List<ActivitySnapshotRequest.SetDto> sets){
        if(sets == null || sets.isEmpty()){
            return "N/A";
        }
        return sets.stream()
            .map(set -> set.getWeight() != null
                ? String.format("%d reps @ %s", set.getReps(), set.getWeight())
                : String.format("%d reps", set.getReps()))
            .collect(Collectors.joining(", "));
    }

    private String createPromptForDay(String date, List<ActivitySnapshotRequest> activities){
        StringBuilder exercisesBlock = new StringBuilder();
        for (ActivitySnapshotRequest a : activities) {
            exercisesBlock.append(String.format(
                "- Exercise: %s | Muscle Group: %s | Duration: %s minutes | Calories Burned: %s | Sets: %s%n",
                a.getType(),
                a.getMuscleGroup(),
                a.getDuration() != null ? a.getDuration() : "N/A",
                a.getCaloriesBurnt() != null ? a.getCaloriesBurnt() : "N/A",
                formatSets(a.getSets())
            ));
        }

        return String.format(
            """
                 Analyze this full day of fitness activity (%s) and provide detailed recommendations in the
                 following format
                  {
                      "analysis" : {
                          "overall": "Overall analysis here",
                          "pace": "Pace analysis here",
                          "heartRate": "Heart rate analysis here",
                          "CaloriesBurned": "Calories Burned here"
                      },
                      "improvements": [
                          {
                              "area": "Area name",
                              "recommendation": "Detailed Recommendation"
                          }
                      ],
                      "suggestions" : [
                          {
                              "workout": "Workout name",
                              "description": "Detailed workout description"
                          }
                      ],
                      "safety": [
                          "Safety point 1",
                          "Safety point 2"
                      ]
                  }

                  Here are ALL the exercises logged for this day:
                  %s

                  Analyze the day as a whole (not each exercise individually) focusing on overall training
                  balance, muscle groups worked vs neglected, total volume and intensity, pacing across the
                  session, total calories burned, next-day recovery guidance, and safety guidelines.
                  Ensure the response follows the EXACT JSON format shown above.
            """, date, exercisesBlock.toString()
        );
    }
}
