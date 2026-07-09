package com.fitness.aiservice.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.dto.VoiceParseRequest;
import com.fitness.aiservice.dto.VoiceParseResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class VoiceParsingService {
    private final GeminiService geminiService;

    public VoiceParseResponse parseVoiceWorkout(VoiceParseRequest request) {
        String prompt = buildPrompt(request);
        String aiResponse = geminiService.getAnswer(prompt);
        return parseResponse(aiResponse);
    }

    private VoiceParseResponse parseResponse(String aiResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(aiResponse);
            JsonNode textNode = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text");

            String jsonContent = textNode.asText()
                    .replaceAll("```json\\n", "")
                    .replaceAll("```\\n?", "")
                    .trim();

            JsonNode result = mapper.readTree(jsonContent);

            return VoiceParseResponse.builder()
                    .exercise(result.path("exercise").asText(null))
                    .sets(result.path("sets").isNull() || result.path("sets").isMissingNode() ? null : result.path("sets").asInt())
                    .reps(result.path("reps").isNull() || result.path("reps").isMissingNode() ? null : result.path("reps").asInt())
                    .weight(result.path("weight").isNull() || result.path("weight").isMissingNode() ? null : result.path("weight").asDouble())
                    .unit(result.path("unit").asText("kg"))
                    .notes(result.path("notes").asText(""))
                    .confidence(result.path("confidence").asDouble(0.0))
                    .parseFailed(false)
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse Gemini voice response: {}", e.getMessage(), e);
            return VoiceParseResponse.builder()
                    .exercise(null)
                    .sets(null)
                    .reps(null)
                    .weight(null)
                    .unit("kg")
                    .notes("")
                    .confidence(0.0)
                    .parseFailed(true)
                    .build();
        }
    }

    private String buildPrompt(VoiceParseRequest request) {
        String contextBlock = "None (this is the first voice entry in this session).";
        if (request.getPreviousContext() != null && request.getPreviousContext().getExercise() != null) {
            VoiceParseRequest.PreviousContext ctx = request.getPreviousContext();
            contextBlock = String.format(
                "Exercise: %s | Sets: %s | Reps: %s | Weight: %s %s",
                ctx.getExercise(),
                ctx.getSets() != null ? ctx.getSets() : "N/A",
                ctx.getReps() != null ? ctx.getReps() : "N/A",
                ctx.getWeight() != null ? ctx.getWeight() : "N/A",
                ctx.getUnit() != null ? ctx.getUnit() : "kg"
            );
        }

        return String.format(
            """
                 You are a strict JSON extraction engine for a fitness tracking app. Parse the user's
                 spoken workout transcript into a SINGLE JSON object and return ONLY that JSON object -
                 no markdown code fences, no explanation, no extra text before or after it.

                 Required JSON shape (fields must always be present, use null for anything you cannot
                 determine):
                  {
                      "exercise": "",
                      "sets": null,
                      "reps": null,
                      "weight": null,
                      "unit": "kg",
                      "notes": "",
                      "confidence": 0.0
                  }

                 Field rules:
                 - "exercise": normalize to EXACTLY one of the canonical exercise names listed below
                   (character-for-character match, including any parenthetical suffix shown). If the
                   transcript doesn't clearly match any canonical exercise, put your best free-text guess
                   here and lower the confidence score accordingly.
                 - "sets": integer number of sets, or null if not mentioned/resolvable.
                 - "reps": integer reps per set (if reps vary per set, use the most commonly stated number),
                   or null if not mentioned/resolvable.
                 - "weight": numeric weight value only (no units in this field), or null if bodyweight/not
                   mentioned.
                 - "unit": "kg" or "lb". Default to "kg" if the user doesn't specify and no previous
                   context specifies otherwise.
                 - "notes": short free-text for anything relevant that doesn't fit other fields (e.g. "per
                   arm", "dropset", "to failure"). Empty string if nothing extra.
                 - "confidence": a number from 0.0 to 1.0 reflecting how confident you are that exercise,
                   sets, reps, and weight were all correctly and unambiguously resolved. Use 0.9-1.0 for
                   clear unambiguous statements, 0.5-0.75 for partial/ambiguous statements, below 0.5 for
                   largely guessed or incomplete input.

                 Number word conversion: convert spoken number words to integers/decimals, e.g. "twenty"
                 -> 20, "twelve" -> 12, "three sets of ten" -> sets=3, reps=10, "twenty five" -> 25,
                 "a hundred and forty" -> 140. Ignore filler words and false starts (e.g. "um", "like",
                 "I did", "let's see", "add", "log").

                 Synonym normalization - map these (and similar) spoken phrases to the exact canonical
                 name shown:
                 - "RDL", "R D L" -> "Romanian Deadlift"
                 - "DB Press", "dumbbell bench" (in shoulder context) -> "Dumbbell Shoulder Press"
                 - "Lat Pull Down", "lat pulldowns" -> "Lat Pulldown"
                 - "Shoulder Press" (no dumbbell/machine specified) -> "Dumbbell Shoulder Press"
                 - "Leg Day squat", "back squat", "squats" -> "Barbell Squat"
                 - "Bulgarian squat", "split squats" -> "Bulgarian Split Squat"
                 - "Leg press machine" -> "Leg Press"
                 - "Calf raises" (standing implied) -> "Standing Calf Raise"
                 - "Hammer curls" -> "Hammer Curl"
                 - "EZ bar curl", "EZ curl", "dumbbell curl" -> "EZ-Bar Curl (or Dumbbell Curl)"
                 - "Pec deck", "pec fly", "chest fly machine" -> "Pec Deck Fly (Optional)"
                 - "Rows", "seated row" -> "Seated Cable Row"
                 - "Tricep pushdowns", "cable pushdown" -> "Tricep Pushdown"
                 - "Russian twists" -> "Weighted Russian Twist"
                 - "Hip thrusts" -> "Hip Thrust"
                 - "Leg curls" -> "Seated/Lying Leg Curl"

                 Canonical exercise list, grouped by muscle group (use these EXACT strings for "exercise"):
                 CHEST: Incline Dumbbell Press, Machine Chest Press, Pec Deck Fly (Optional)
                 BACK: Lat Pulldown, Single-Arm Lat Pulldown, Seated Cable Row, Chest-Supported Row
                 SHOULDERS: Dumbbell Shoulder Press, Dumbbell or Machine Shoulder Press, Dumbbell Lateral Raise, Rear Delt Fly
                 TRICEPS: Tricep Pushdown, Cable Tricep Extension
                 BICEPS: Hammer Curl, EZ-Bar Curl (or Dumbbell Curl)
                 QUADS: Barbell Squat, Bulgarian Split Squat, Leg Press, Leg Extension, Walking Lunges
                 GLUTES_HAMSTRINGS: Romanian Deadlift, Hip Thrust, Seated/Lying Leg Curl, Hip Abduction Machine
                 CALVES: Standing Calf Raise, Seated Calf Raise
                 ABS_CORE: Kneeling Cable Crunch, Reverse Crunch, Cable Wood Chop, Weighted Russian Twist, Side Plank
                 CARDIO: Zone 2 Cardio, Incline Walk, StairMaster, Cycling, Elliptical, Swimming
                 RECOVERY: Rest, Light Walking (optional), Full-body Stretching, Hydration, Protein Intake, Quality Sleep

                 Session context - the exercise most recently logged in this voice session (use this ONLY
                 to resolve relative/follow-up phrases like "same reps", "increase to twenty five",
                 "one more set", "add another set", "same weight but do 8 reps" - fill in any field the
                 current transcript doesn't explicitly restate from this context; if the current transcript
                 is a complete standalone statement, ignore this context):
                 %s

                 User's spoken transcript to parse:
                 "%s"

                 Return ONLY the JSON object described above. No markdown formatting, no code fences, no
                 commentary.
            """, contextBlock, request.getTranscript()
        );
    }
}
