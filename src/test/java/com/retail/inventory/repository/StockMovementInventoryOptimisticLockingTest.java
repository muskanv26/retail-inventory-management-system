package com.retail.inventory.repository;

import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Product;
import com.retail.inventory.entity.StockMovement;
import com.retail.inventory.entity.StockMovementType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.OptimisticLockException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
public class StockMovementInventoryOptimisticLockingTest {

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    private UUID savedInventoryId;

    @BeforeEach
    void setUp() {
        stockMovementRepository.deleteAll();
        inventoryRepository.deleteAll();
        productRepository.deleteAll();

        Product product = Product.builder()
                .sku("SM-OPT-SKU")
                .name("Stock Movement Optimistic Product")
                .category("WAREHOUSE")
                .unitPrice(new BigDecimal("49.99"))
                .active(true)
                .build();
        product = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .warehouseCode("WH-SM-1")
                .quantityOnHand(100)
                .quantityReserved(10)
                .reorderLevel(20)
                .build();
        inventory = inventoryRepository.save(inventory);
        savedInventoryId = inventory.getId();
    }

    @Test
    @DisplayName("Should throw OptimisticLockException when concurrent StockMovement updates collide on stale Inventory version")
    void shouldThrowOptimisticLockExceptionOnConcurrentStockMovementInventoryUpdate() {
        // 1. Obtain two independent EntityManagers (concurrent transactions)
        EntityManager em1 = entityManagerFactory.createEntityManager();
        EntityManager em2 = entityManagerFactory.createEntityManager();

        try {
            // 2. Load the same Inventory entity into both persistence contexts before either commits
            em1.getTransaction().begin();
            em2.getTransaction().begin();

            Inventory inv1 = em1.find(Inventory.class, savedInventoryId);
            Inventory inv2 = em2.find(Inventory.class, savedInventoryId);

            assertNotNull(inv1);
            assertNotNull(inv2);
            assertEquals(inv1.getVersion(), inv2.getVersion(), "Both transactions must observe the same initial version");

            Long initialVersion = inv1.getVersion();

            // 3. Transaction 1 applies stock adjustment (+50 on hand) and saves a StockMovement record
            inv1.setQuantityOnHand(inv1.getQuantityOnHand() + 50);
            StockMovement movement1 = StockMovement.builder()
                    .inventory(inv1)
                    .type(StockMovementType.INBOUND)
                    .quantity(50)
                    .reason("Stock arrival 1")
                    .build();
            em1.persist(movement1);
            em1.getTransaction().commit();

            // 4. Transaction 2 attempts stock adjustment (+30 on hand) using its stale Inventory version
            inv2.setQuantityOnHand(inv2.getQuantityOnHand() + 30);
            StockMovement movement2 = StockMovement.builder()
                    .inventory(inv2)
                    .type(StockMovementType.INBOUND)
                    .quantity(30)
                    .reason("Stock arrival 2")
                    .build();
            em2.persist(movement2);

            // Attempt commit in Transaction 2
            Exception exception = assertThrows(Exception.class, () -> {
                em2.getTransaction().commit();
            });

            // Verify that cause is OptimisticLockException
            Throwable cause = exception;
            while (cause != null && !(cause instanceof OptimisticLockException)) {
                cause = cause.getCause();
            }
            assertNotNull(cause, "Expected cause to contain OptimisticLockException but received: " + exception.getMessage());
            assertTrue(cause instanceof OptimisticLockException, "Expected OptimisticLockException cause");

            if (em2.getTransaction().isActive()) {
                em2.getTransaction().rollback();
            }

            // 5. Use a fresh persistence context to verify that Transaction 1's committed quantity (150) remains in DB
            EntityManager emVerify = entityManagerFactory.createEntityManager();
            Inventory finalInventory = emVerify.find(Inventory.class, savedInventoryId);
            assertNotNull(finalInventory);
            assertEquals(150, finalInventory.getQuantityOnHand(), "Database must reflect Transaction 1's stock update");
            assertNotEquals(130, finalInventory.getQuantityOnHand(), "Database must not contain Transaction 2's stale stock update");
            assertNotEquals(180, finalInventory.getQuantityOnHand(), "Database must not silently accumulate stale updates");
            assertTrue(finalInventory.getVersion() > initialVersion, "Inventory version must increment after successful update");
            emVerify.close();

        } finally {
            if (em1.isOpen()) {
                em1.close();
            }
            if (em2.isOpen()) {
                em2.close();
            }
        }
    }
}
