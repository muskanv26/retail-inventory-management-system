package com.retail.inventory.dto;

import com.retail.inventory.entity.StockMovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    private UUID id;
    private UUID inventoryId;
    private UUID productId;
    private String productSku;
    private String productName;
    private String warehouseCode;
    private StockMovementType type;
    private Integer quantity;
    private String referenceNumber;
    private String reason;
    private LocalDateTime timestamp;
}
