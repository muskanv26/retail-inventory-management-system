package com.retail.inventory.service;

import com.retail.inventory.dto.CreateInventoryRequest;
import com.retail.inventory.dto.InventoryResponse;
import com.retail.inventory.dto.UpdateInventoryRequest;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Product;
import com.retail.inventory.exception.InvalidInventoryException;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public InventoryResponse createInventory(CreateInventoryRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        String formattedWarehouseCode = request.getWarehouseCode().trim().toUpperCase();

        if (inventoryRepository.existsByProductIdAndWarehouseCode(request.getProductId(), formattedWarehouseCode)) {
            throw new ResourceAlreadyExistsException(
                    "Inventory record already exists for Product ID '" + request.getProductId() +
                    "' at Warehouse '" + formattedWarehouseCode + "'"
            );
        }

        if (request.getQuantityReserved() > request.getQuantityOnHand()) {
            throw new InvalidInventoryException("Quantity reserved (" + request.getQuantityReserved() +
                    ") cannot exceed quantity on hand (" + request.getQuantityOnHand() + ")");
        }

        Inventory inventory = Inventory.builder()
                .product(product)
                .warehouseCode(formattedWarehouseCode)
                .quantityOnHand(request.getQuantityOnHand())
                .quantityReserved(request.getQuantityReserved())
                .reorderLevel(request.getReorderLevel())
                .build();

        Inventory savedInventory = inventoryRepository.save(inventory);
        return mapToInventoryResponse(savedInventory);
    }

    public List<InventoryResponse> getAllInventory(UUID productId, String warehouseCode) {
        List<Inventory> inventories;

        if (productId != null) {
            inventories = inventoryRepository.findByProductId(productId);
        } else if (warehouseCode != null && !warehouseCode.isBlank()) {
            inventories = inventoryRepository.findByWarehouseCode(warehouseCode.trim().toUpperCase());
        } else {
            inventories = inventoryRepository.findAll();
        }

        return inventories.stream()
                .map(this::mapToInventoryResponse)
                .toList();
    }

    public InventoryResponse getInventoryById(UUID id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));
        return mapToInventoryResponse(inventory);
    }

    @Transactional
    public InventoryResponse updateInventory(UUID id, UpdateInventoryRequest request) {
        Inventory existingInventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with ID: " + id));

        if (request.getQuantityReserved() > request.getQuantityOnHand()) {
            throw new InvalidInventoryException("Quantity reserved (" + request.getQuantityReserved() +
                    ") cannot exceed quantity on hand (" + request.getQuantityOnHand() + ")");
        }

        existingInventory.setQuantityOnHand(request.getQuantityOnHand());
        existingInventory.setQuantityReserved(request.getQuantityReserved());
        existingInventory.setReorderLevel(request.getReorderLevel());

        Inventory updatedInventory = inventoryRepository.save(existingInventory);
        return mapToInventoryResponse(updatedInventory);
    }

    @Transactional
    public void deleteInventory(UUID id) {
        if (!inventoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inventory not found with ID: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    private InventoryResponse mapToInventoryResponse(Inventory inventory) {
        int available = inventory.getQuantityOnHand() - inventory.getQuantityReserved();
        boolean reorderNeeded = inventory.getQuantityOnHand() <= inventory.getReorderLevel();

        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProduct().getId())
                .productSku(inventory.getProduct().getSku())
                .productName(inventory.getProduct().getName())
                .warehouseCode(inventory.getWarehouseCode())
                .quantityOnHand(inventory.getQuantityOnHand())
                .quantityReserved(inventory.getQuantityReserved())
                .quantityAvailable(available)
                .reorderLevel(inventory.getReorderLevel())
                .reorderNeeded(reorderNeeded)
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}
