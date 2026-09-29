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
public class OrderFulfillmentTransactionRollbackTest {

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
                .sku("FULFILL-SKU")
                .name("Fulfillment Rollback Product")
                .category("TEST")
                .unitPrice(new BigDecimal("19.99"))
                .active(true)
                .build();
        product = productRepository.save(product);

        Warehouse warehouse = Warehouse.builder()
                .code("WH-FULFILL")
                .name("Fulfillment Warehouse")
                .location("Fulfillment Location")
                .capacity(1000)
                .active(true)
                .build();
        warehouse = warehouseRepository.save(warehouse);

        // Pre-fulfillment state: 100 on hand, 10 reserved for this order
        Inventory inventory = Inventory.builder()
                .product(product)
                .warehouseCode("WH-FULFILL")
                .quantityOnHand(100)
                .quantityReserved(10)
                .reorderLevel(5)
                .build();
        inventory = inventoryRepository.save(inventory);
        inventoryId = inventory.getId();

        // Create a SALES Order in PROCESSING status with 10 units requested
        Order order = Order.builder()
                .orderNumber("ORD-FULFILL-001")
                .type(OrderType.SALES)
                .status(OrderStatus.PROCESSING)
                .warehouseCode("WH-FULFILL")
                .totalAmount(new BigDecimal("199.90"))
                .build();

        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(10)
                .unitPrice(new BigDecimal("19.99"))
                .totalPrice(new BigDecimal("199.90"))
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
    @DisplayName("Should roll back order status and inventory changes when stock movement creation fails during SALES fulfillment")
    void shouldRollbackSalesOrderFulfillmentWhenStockMovementFails() {
        // 1. Force StockMovementRepository to throw an exception when saving the OUTBOUND audit movement
        doThrow(new RuntimeException("Simulated failure saving StockMovement audit record"))
                .when(stockMovementRepository).save(any(StockMovement.class));

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.COMPLETED)
                .build();

        // 2. Invoke updateOrderStatus to fulfill the SALES order and assert that exception is thrown
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.updateOrderStatus(orderId, request);
        });

        assertEquals("Simulated failure saving StockMovement audit record", exception.getMessage());

        // 3. Open a fresh persistence context to verify full transactional rollback
        EntityManager emVerify = entityManagerFactory.createEntityManager();
        try {
            // Verify Order status is still PROCESSING, not COMPLETED
            Order persistedOrder = emVerify.find(Order.class, orderId);
            assertNotNull(persistedOrder);
            assertEquals(OrderStatus.PROCESSING, persistedOrder.getStatus(), "Order status must remain PROCESSING after rollback");

            // Verify Inventory quantityOnHand and quantityReserved are unchanged from pre-fulfillment state
            Inventory persistedInventory = emVerify.find(Inventory.class, inventoryId);
            assertNotNull(persistedInventory);
            assertEquals(100, persistedInventory.getQuantityOnHand(), "quantityOnHand must remain 100 after rollback");
            assertEquals(10, persistedInventory.getQuantityReserved(), "quantityReserved must remain 10 after rollback");

            // Verify no OUTBOUND StockMovement records exist for this order
            Long outboundMovementsCount = emVerify.createQuery(
                            "SELECT COUNT(m) FROM StockMovement m WHERE m.type = :type AND m.inventory.id = :invId", Long.class)
                    .setParameter("type", StockMovementType.OUTBOUND)
                    .setParameter("invId", inventoryId)
                    .getSingleResult();
            assertEquals(0L, outboundMovementsCount, "No OUTBOUND StockMovement records must exist after rollback");
        } finally {
            emVerify.close();
        }
    }
}
