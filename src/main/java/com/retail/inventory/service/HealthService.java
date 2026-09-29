package com.retail.inventory.service;

import com.retail.inventory.dto.HealthResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class HealthService {

    public HealthResponse checkHealth() {
        return HealthResponse.builder()
                .status("UP")
                .message("Retail Inventory Management System is running smoothly")
                .service("retail-inventory-management-system")
                .timestamp(LocalDateTime.now())
                .build();
    }
}
