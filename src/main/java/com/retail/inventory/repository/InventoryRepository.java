package com.retail.inventory.repository;

import com.retail.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    boolean existsByProductIdAndWarehouseCode(UUID productId, String warehouseCode);

    boolean existsByProductIdAndWarehouseCodeAndIdNot(UUID productId, String warehouseCode, UUID id);

    Optional<Inventory> findByProductIdAndWarehouseCode(UUID productId, String warehouseCode);

    List<Inventory> findByProductId(UUID productId);

    List<Inventory> findByWarehouseCode(String warehouseCode);
}
