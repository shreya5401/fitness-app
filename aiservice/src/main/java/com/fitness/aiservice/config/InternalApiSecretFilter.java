package com.fitness.aiservice.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rejects any request that didn't come through the API gateway.
 * The gateway attaches X-Internal-Secret to every request it forwards;
 * this service must never trust a caller that skips that step.
 */
@Component
@Slf4j
public class InternalApiSecretFilter extends OncePerRequestFilter {

    @Value("${internal.api.secret}")
    private String internalApiSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String providedSecret = request.getHeader("X-Internal-Secret");
        if (providedSecret == null || !providedSecret.equals(internalApiSecret)) {
            log.warn("Rejected request to {} with missing or invalid internal secret", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
