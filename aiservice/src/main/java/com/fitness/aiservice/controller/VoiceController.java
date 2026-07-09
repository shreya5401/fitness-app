package com.fitness.aiservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitness.aiservice.dto.VoiceParseRequest;
import com.fitness.aiservice.dto.VoiceParseResponse;
import com.fitness.aiservice.service.VoiceParsingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/voice")
@Slf4j
public class VoiceController {
    private final VoiceParsingService voiceParsingService;

    @PostMapping("/parse")
    public ResponseEntity<VoiceParseResponse> parse(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody VoiceParseRequest request) {
        log.info("Received voice parse request for user {}", userId);
        return ResponseEntity.ok(voiceParsingService.parseVoiceWorkout(request));
    }
}
