package com.retail.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String sku;
    private String name;
    private String description;
    private String category;
    private BigDecimal unitPrice;
    private String brand;
    private String gender;
    private String imageUrl;
    private String secondaryImageUrl;
    private BigDecimal originalPrice;
    private Double rating;
    private Integer reviewCount;
    private String sizes;
    private String colors;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
