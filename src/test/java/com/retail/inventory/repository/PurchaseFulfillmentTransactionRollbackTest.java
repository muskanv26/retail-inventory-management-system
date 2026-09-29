package com.retail.inventory.repository;

import com.retail.inventory.dto.UpdateOrderStatusRequest;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Order;
import com.retail.inventory.entity.OrderItem;
import com.retail.inventory.entity.OrderStatus;
import com.retail.inventory.entity.OrderType;
import com.retail.inventory.entity.Product;
import com.retail.inventory.entity.StockMovement;
import com.retail.inventory.entity.StockMovementType;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.service.OrderService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterEach;
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
public class PurchaseFulfillmentTransactionRollbackTest {

    @Autowired
    private OrderService orderService;

    @SpyBean
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    private UUID orderId;
    private UUID inventoryId;

    @BeforeEach
    void setUp() {
        tearDown();

        Product product = Product.builder()
                .sku("PURCHASE-SKU")
                .name("Purchase Rollback Product")
                .category("TEST")
                .unitPrice(new BigDecimal("15.00"))
                .active(true)
                .build();
        product = productRepository.save(product);

        Warehouse warehouse = Warehouse.builder()
                .code("WH-PURCHASE")
                .name("Purchase Warehouse")
                .location("Purchase Location")
                .capacity(2000)
                .active(true)
                .build();
        warehouse = warehouseRepository.save(warehouse);

        // Initial inventory state: 50 on hand, 0 reserved
        Inventory inventory = Inventory.builder()
                .product(product)
                .warehouseCode("WH-PURCHASE")
                .quantityOnHand(50)
                .quantityReserved(0)
                .reorderLevel(10)
                .build();
        inventory = inventoryRepository.save(inventory);
        inventoryId = inventory.getId();

        // Create a PURCHASE Order in PROCESSING status requesting 25 units
        Order order = Order.builder()
                .orderNumber("PO-ROLLBACK-001")
                .type(OrderType.PURCHASE)
                .status(OrderStatus.PROCESSING)
                .warehouseCode("WH-PURCHASE")
                .supplierCode("SUP-001")
                .totalAmount(new BigDecimal("375.00"))
                .build();

        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(25)
                .unitPrice(new BigDecimal("15.00"))
                .totalPrice(new BigDecimal("375.00"))
                .build();

        order.addItem(item);
        Order savedOrder = orderRepository.save(order);
        orderId = savedOrder.getId();
    }

    @AfterEach
    void tearDown() {
        stockMovementRepository.deleteAll();
        orderRepository.deleteAll();
        inventoryRepository.deleteAll();
        productRepository.deleteAll();
        warehouseRepository.deleteAll();
    }

    @Test
    @DisplayName("Should roll back order status and inventory replenishment when stock movement creation fails during PURCHASE fulfillment")
    void shouldRollbackPurchaseOrderFulfillmentWhenStockMovementFails() {
        // 1. Force StockMovementRepository to throw an exception when saving the INBOUND audit movement
        doThrow(new RuntimeException("Simulated failure saving INBOUND StockMovement record"))
                .when(stockMovementRepository).save(any(StockMovement.class));

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.COMPLETED)
                .build();

        // 2. Invoke updateOrderStatus to complete the PURCHASE order and assert that exception is thrown
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.updateOrderStatus(orderId, request);
        });

        assertEquals("Simulated failure saving INBOUND StockMovement record", exception.getMessage());

        // 3. Open a fresh persistence context to verify full transactional rollback
        EntityManager emVerify = entityManagerFactory.createEntityManager();
        try {
            // Verify Order status is still PROCESSING, not COMPLETED
            Order persistedOrder = emVerify.find(Order.class, orderId);
            assertNotNull(persistedOrder);
            assertEquals(OrderStatus.PROCESSING, persistedOrder.getStatus(), "Order status must remain PROCESSING after rollback");

            // Verify Inventory quantityOnHand is unchanged (50, did NOT become 75) and quantityReserved is unchanged (0)
            Inventory persistedInventory = emVerify.find(Inventory.class, inventoryId);
            assertNotNull(persistedInventory);
            assertEquals(50, persistedInventory.getQuantityOnHand(), "quantityOnHand must remain 50 after rollback");
            assertEquals(0, persistedInventory.getQuantityReserved(), "quantityReserved must remain 0 after rollback");

            // Verify no INBOUND StockMovement records exist for this order
            Long inboundMovementsCount = emVerify.createQuery(
                            "SELECT COUNT(m) FROM StockMovement m WHERE m.type = :type AND m.inventory.id = :invId", Long.class)
                    .setParameter("type", StockMovementType.INBOUND)
                    .setParameter("invId", inventoryId)
                    .getSingleResult();
            assertEquals(0L, inboundMovementsCount, "No INBOUND StockMovement records must exist after rollback");
        } finally {
            emVerify.close();
        }
    }
}
