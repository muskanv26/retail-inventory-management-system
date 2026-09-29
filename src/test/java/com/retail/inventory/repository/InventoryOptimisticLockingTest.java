package com.retail.inventory.repository;

import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Product;
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
public class InventoryOptimisticLockingTest {

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    private UUID savedInventoryId;

    @BeforeEach
    void setUp() {
        inventoryRepository.deleteAll();
        productRepository.deleteAll();

        Product product = Product.builder()
                .sku("OPT-LOCK-SKU")
                .name("Optimistic Lock Product")
                .category("ELECTRONICS")
                .unitPrice(new BigDecimal("99.99"))
                .active(true)
                .build();
        product = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .warehouseCode("WH-OPT-1")
                .quantityOnHand(100)
                .quantityReserved(10)
                .reorderLevel(20)
                .build();
        inventory = inventoryRepository.save(inventory);
        savedInventoryId = inventory.getId();
    }

    @Test
    @DisplayName("Should throw OptimisticLockException when concurrent update occurs on stale inventory version")
    void shouldThrowOptimisticLockExceptionOnConcurrentUpdate() {
        // 1. Obtain two separate persistence contexts (EntityManagers) representing concurrent transactions
        EntityManager em1 = entityManagerFactory.createEntityManager();
        EntityManager em2 = entityManagerFactory.createEntityManager();

        try {
            // 2. Both transactions begin and read the exact same inventory entity
            em1.getTransaction().begin();
            em2.getTransaction().begin();

            Inventory inv1 = em1.find(Inventory.class, savedInventoryId);
            Inventory inv2 = em2.find(Inventory.class, savedInventoryId);

            assertNotNull(inv1);
            assertNotNull(inv2);
            assertEquals(inv1.getVersion(), inv2.getVersion(), "Both transactions must observe the same initial version");

            Long initialVersion = inv1.getVersion();

            // 3. Transaction 1 updates quantity on hand and commits successfully
            inv1.setQuantityOnHand(150);
            em1.getTransaction().commit();

            // 4. Transaction 2 attempts to modify using its stale version and commit
            inv2.setQuantityOnHand(200);

            Exception exception = assertThrows(Exception.class, () -> {
                em2.getTransaction().commit();
            });

            // Unwrap exception hierarchy to locate OptimisticLockException
            Throwable cause = exception;
            while (cause != null && !(cause instanceof OptimisticLockException)) {
                cause = cause.getCause();
            }
            assertNotNull(cause, "Expected cause to contain OptimisticLockException but received: " + exception.getMessage());
            assertTrue(cause instanceof OptimisticLockException, "Expected OptimisticLockException cause");

            if (em2.getTransaction().isActive()) {
                em2.getTransaction().rollback();
            }

            // 5. Verify final DB state contains Transaction 1's update and that Transaction 2's stale update was rejected
            EntityManager emVerify = entityManagerFactory.createEntityManager();
            Inventory finalInventory = emVerify.find(Inventory.class, savedInventoryId);
            assertNotNull(finalInventory);
            assertEquals(150, finalInventory.getQuantityOnHand(), "Database must reflect Transaction 1's update");
            assertNotEquals(200, finalInventory.getQuantityOnHand(), "Database must not contain Transaction 2's stale update");
            assertTrue(finalInventory.getVersion() > initialVersion, "Version number must increment after update");
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
