package com.retail.inventory.controller;

import com.retail.inventory.dto.HealthResponse;
import com.retail.inventory.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    public ResponseEntity<HealthResponse> getHealthStatus() {
        return ResponseEntity.ok(healthService.checkHealth());
    }
}
