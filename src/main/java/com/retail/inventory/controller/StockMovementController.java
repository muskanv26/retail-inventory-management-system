package com.retail.inventory.controller;

import com.retail.inventory.dto.StockAdjustmentRequest;
import com.retail.inventory.dto.StockMovementResponse;
import com.retail.inventory.service.StockMovementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stock-movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @PostMapping("/adjust")
    public ResponseEntity<StockMovementResponse> adjustStock(@Valid @RequestBody StockAdjustmentRequest request) {
        StockMovementResponse response = stockMovementService.adjustStock(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<StockMovementResponse>> getStockMovements(
            @RequestParam(required = false) UUID inventoryId,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) String warehouseCode) {
        return ResponseEntity.ok(stockMovementService.getStockMovements(inventoryId, productId, warehouseCode));
    }
}
