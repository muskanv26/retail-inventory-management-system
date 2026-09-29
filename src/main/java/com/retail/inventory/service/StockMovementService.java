package com.retail.inventory.service;

import com.retail.inventory.dto.StockAdjustmentRequest;
import com.retail.inventory.dto.StockMovementResponse;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.StockMovement;
import com.retail.inventory.entity.StockMovementType;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.exception.InvalidInventoryException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.repository.StockMovementRepository;
import com.retail.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;

    @Transactional
    public StockMovement recordMovement(Inventory inventory, StockMovementType type, Integer quantity, String referenceNumber, String reason) {
        StockMovement movement = StockMovement.builder()
                .inventory(inventory)
                .type(type)
                .quantity(quantity)
                .referenceNumber(referenceNumber)
                .reason(reason)
                .build();

        return stockMovementRepository.save(movement);
    }

    @Transactional
    public StockMovementResponse adjustStock(StockAdjustmentRequest request) {
        String formattedWarehouseCode = request.getWarehouseCode().trim().toUpperCase();

        Warehouse warehouse = warehouseRepository.findByCode(formattedWarehouseCode)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with code: " + formattedWarehouseCode));

        if (!warehouse.isActive()) {
            throw new InvalidInventoryException("Cannot adjust stock at inactive warehouse: " + formattedWarehouseCode);
        }

        Inventory inventory = inventoryRepository.findByProductIdAndWarehouseCode(request.getProductId(), formattedWarehouseCode)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for Product ID '" +
                        request.getProductId() + "' at Warehouse '" + formattedWarehouseCode + "'"));

        int newOnHand = inventory.getQuantityOnHand() + request.getQuantityAdjustment();

        if (newOnHand < 0) {
            throw new InvalidInventoryException("Stock adjustment would result in negative quantity on hand (" + newOnHand + ")");
        }

        if (newOnHand < inventory.getQuantityReserved()) {
            throw new InvalidInventoryException("Stock adjustment would result in quantity on hand (" + newOnHand +
                    ") dropping below reserved quantity (" + inventory.getQuantityReserved() + ")");
        }

        inventory.setQuantityOnHand(newOnHand);
        inventoryRepository.save(inventory);

        String reasonNote = request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim() : "Manual stock adjustment";

        StockMovement movement = recordMovement(inventory, StockMovementType.ADJUSTMENT, request.getQuantityAdjustment(), null, reasonNote);

        return mapToResponse(movement);
    }

    public List<StockMovementResponse> getStockMovements(UUID inventoryId, UUID productId, String warehouseCode) {
        List<StockMovement> movements;

        if (inventoryId != null) {
            movements = stockMovementRepository.findByInventoryId(inventoryId);
        } else if (productId != null && warehouseCode != null && !warehouseCode.isBlank()) {
            movements = stockMovementRepository.findByInventoryProductIdAndInventoryWarehouseCode(productId, warehouseCode.trim().toUpperCase());
        } else if (productId != null) {
            movements = stockMovementRepository.findByInventoryProductId(productId);
        } else if (warehouseCode != null && !warehouseCode.isBlank()) {
            movements = stockMovementRepository.findByInventoryWarehouseCode(warehouseCode.trim().toUpperCase());
        } else {
            movements = stockMovementRepository.findAll();
        }

        return movements.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public StockMovementResponse mapToResponse(StockMovement movement) {
        Inventory inv = movement.getInventory();
        return StockMovementResponse.builder()
                .id(movement.getId())
                .inventoryId(inv.getId())
                .productId(inv.getProduct().getId())
                .productSku(inv.getProduct().getSku())
                .productName(inv.getProduct().getName())
                .warehouseCode(inv.getWarehouseCode())
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .referenceNumber(movement.getReferenceNumber())
                .reason(movement.getReason())
                .timestamp(movement.getTimestamp())
                .build();
    }
}
