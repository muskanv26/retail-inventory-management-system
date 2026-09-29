package com.retail.inventory.repository;

import com.retail.inventory.dto.StockAdjustmentRequest;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Product;
import com.retail.inventory.entity.StockMovement;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.service.StockMovementService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

@SpringBootTest
@ActiveProfiles("test")
public class StockMovementTransactionRollbackTest {

    @Autowired
    private StockMovementService stockMovementService;

    @SpyBean
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    private UUID productId;
    private String warehouseCode;
    private UUID inventoryId;

    @BeforeEach
    void setUp() {
        stockMovementRepository.deleteAll();
        inventoryRepository.deleteAll();
        productRepository.deleteAll();
        warehouseRepository.deleteAll();

        Product product = Product.builder()
                .sku("ROLLBACK-SKU")
                .name("Rollback Test Product")
                .category("TEST")
                .unitPrice(new BigDecimal("29.99"))
                .active(true)
                .build();
        product = productRepository.save(product);
        productId = product.getId();

        Warehouse warehouse = Warehouse.builder()
                .code("WH-ROLLBACK")
                .name("Rollback Test Warehouse")
                .location("Test Location")
                .capacity(1000)
                .active(true)
                .build();
        warehouse = warehouseRepository.save(warehouse);
        warehouseCode = warehouse.getCode();

        Inventory inventory = Inventory.builder()
                .product(product)
                .warehouseCode(warehouseCode)
                .quantityOnHand(100)
                .quantityReserved(20)
                .reorderLevel(10)
                .build();
        inventory = inventoryRepository.save(inventory);
        inventoryId = inventory.getId();
    }

    @Test
    @DisplayName("Should roll back inventory quantity update when stock movement persistence fails")
    void shouldRollbackInventoryUpdateWhenStockMovementFails() {
        // 1. Configure the StockMovementRepository spy to throw an exception when saving a StockMovement
        doThrow(new RuntimeException("Simulated database failure during stock movement save"))
                .when(stockMovementRepository).save(any(StockMovement.class));

        // 2. Prepare stock adjustment request (+50 on hand)
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode(warehouseCode)
                .quantityAdjustment(50)
                .reason("Test adjustment failure")
                .build();

        // 3. Execute adjustStock and verify that RuntimeException is thrown out of the @Transactional boundary
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            stockMovementService.adjustStock(request);
        });

        assertEquals("Simulated database failure during stock movement save", exception.getMessage());

        // 4. Verify using a fresh persistence context that the transaction rolled back completely
        EntityManager emVerify = entityManagerFactory.createEntityManager();
        try {
            Inventory persistedInventory = emVerify.find(Inventory.class, inventoryId);
            assertNotNull(persistedInventory, "Inventory record should still exist");
            assertEquals(100, persistedInventory.getQuantityOnHand(), "quantityOnHand must remain 100 after rollback");
            assertEquals(20, persistedInventory.getQuantityReserved(), "quantityReserved must remain 20 after rollback");

            Long countMovements = emVerify.createQuery("SELECT COUNT(m) FROM StockMovement m WHERE m.inventory.id = :invId", Long.class)
                    .setParameter("invId", inventoryId)
                    .getSingleResult();
            assertEquals(0L, countMovements, "No StockMovement records should exist for the failed operation");
        } finally {
            emVerify.close();
        }
    }
}
