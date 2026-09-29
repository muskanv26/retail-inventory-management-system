package com.retail.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWarehouseRequest {

    @NotBlank(message = "Warehouse code is required")
    @Size(min = 2, max = 50, message = "Warehouse code must be between 2 and 50 characters")
    private String code;

    @NotBlank(message = "Warehouse name is required")
    @Size(max = 100, message = "Warehouse name must not exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @Min(value = 0, message = "Capacity cannot be negative")
    private Integer capacity;

    private boolean active;
}
