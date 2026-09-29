package com.retail.inventory.repository;

import com.retail.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    List<StockMovement> findByInventoryId(UUID inventoryId);

    List<StockMovement> findByInventoryProductId(UUID productId);

    List<StockMovement> findByInventoryWarehouseCode(String warehouseCode);

    List<StockMovement> findByInventoryProductIdAndInventoryWarehouseCode(UUID productId, String warehouseCode);
}
