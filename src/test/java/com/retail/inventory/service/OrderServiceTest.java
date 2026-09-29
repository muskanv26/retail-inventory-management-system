package com.retail.inventory.service;

import com.retail.inventory.dto.CreateOrderItemRequest;
import com.retail.inventory.dto.CreateOrderRequest;
import com.retail.inventory.dto.OrderResponse;
import com.retail.inventory.dto.UpdateOrderStatusRequest;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Order;
import com.retail.inventory.entity.OrderItem;
import com.retail.inventory.entity.OrderStatus;
import com.retail.inventory.entity.OrderType;
import com.retail.inventory.entity.Product;
import com.retail.inventory.entity.StockMovementType;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.exception.InvalidOrderException;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.repository.OrderRepository;
import com.retail.inventory.repository.ProductRepository;
import com.retail.inventory.repository.WarehouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private StockMovementService stockMovementService;

    @InjectMocks
    private OrderService orderService;

    private UUID orderId;
    private UUID productId;
    private Product sampleProduct;
    private Warehouse sampleWarehouse;
    private Inventory sampleInventory;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        productId = UUID.randomUUID();

        sampleProduct = Product.builder()
                .id(productId)
                .sku("PROD-001")
                .name("Wireless Router")
                .unitPrice(new BigDecimal("49.99"))
                .active(true)
                .build();

        sampleWarehouse = Warehouse.builder()
                .id(UUID.randomUUID())
                .code("WH-MAIN")
                .name("Main Warehouse")
                .active(true)
                .build();

        sampleInventory = Inventory.builder()
                .id(UUID.randomUUID())
                .product(sampleProduct)
                .warehouseCode("WH-MAIN")
                .quantityOnHand(100)
                .quantityReserved(0)
                .reorderLevel(10)
                .build();

        sampleOrder = Order.builder()
                .id(orderId)
                .orderNumber("ORD-2026-001")
                .type(OrderType.SALES)
                .status(OrderStatus.PENDING)
                .warehouseCode("WH-MAIN")
                .totalAmount(new BigDecimal("99.98"))
                .items(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        OrderItem item = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(sampleOrder)
                .product(sampleProduct)
                .quantity(2)
                .unitPrice(new BigDecimal("49.99"))
                .totalPrice(new BigDecimal("99.98"))
                .build();

        sampleOrder.getItems().add(item);
    }

    @Test
    void createOrder_Success() {
        CreateOrderItemRequest itemRequest = CreateOrderItemRequest.builder()
                .productId(productId)
                .quantity(2)
                .unitPrice(new BigDecimal("49.99"))
                .build();

        CreateOrderRequest request = CreateOrderRequest.builder()
                .orderNumber("ORD-2026-001")
                .type(OrderType.SALES)
                .warehouseCode("WH-MAIN")
                .items(List.of(itemRequest))
                .build();

        when(orderRepository.existsByOrderNumber("ORD-2026-001")).thenReturn(false);
        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        OrderResponse response = orderService.createOrder(request);

        assertThat(response).isNotNull();
        assertThat(response.getOrderNumber()).isEqualTo("ORD-2026-001");
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_NonexistentWarehouse_ThrowsResourceNotFoundException() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .orderNumber("ORD-2026-001")
                .type(OrderType.SALES)
                .warehouseCode("WH-NONEXISTENT")
                .items(List.of())
                .build();

        when(orderRepository.existsByOrderNumber("ORD-2026-001")).thenReturn(false);
        when(warehouseRepository.findByCode("WH-NONEXISTENT")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Warehouse not found with code: WH-NONEXISTENT");
    }

    @Test
    void createOrder_InactiveWarehouse_ThrowsInvalidOrderException() {
        sampleWarehouse.setActive(false);
        CreateOrderRequest request = CreateOrderRequest.builder()
                .orderNumber("ORD-2026-001")
                .type(OrderType.SALES)
                .warehouseCode("WH-MAIN")
                .items(List.of())
                .build();

        when(orderRepository.existsByOrderNumber("ORD-2026-001")).thenReturn(false);
        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(InvalidOrderException.class)
                .hasMessageContaining("is inactive");
    }

    @Test
    void updateOrderStatus_SalesPendingToProcessing_ReservesStock() {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.PROCESSING)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        OrderResponse response = orderService.updateOrderStatus(orderId, request);

        assertThat(response).isNotNull();
        assertThat(sampleInventory.getQuantityReserved()).isEqualTo(2);
        verify(stockMovementService).recordMovement(eq(sampleInventory), eq(StockMovementType.RESERVATION), eq(2), eq("ORD-2026-001"), any());
    }

    @Test
    void updateOrderStatus_SalesPendingToProcessing_InsufficientStock_ThrowsInvalidOrderException() {
        sampleInventory.setQuantityOnHand(1);
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.PROCESSING)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));

        assertThatThrownBy(() -> orderService.updateOrderStatus(orderId, request))
                .isInstanceOf(InvalidOrderException.class)
                .hasMessageContaining("Insufficient available stock");
    }

    @Test
    void updateOrderStatus_SalesProcessingToCompleted_FulfillsStock() {
        sampleOrder.setStatus(OrderStatus.PROCESSING);
        sampleInventory.setQuantityReserved(2);

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.COMPLETED)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.updateOrderStatus(orderId, request);

        assertThat(sampleInventory.getQuantityOnHand()).isEqualTo(98);
        assertThat(sampleInventory.getQuantityReserved()).isEqualTo(0);
        verify(stockMovementService).recordMovement(eq(sampleInventory), eq(StockMovementType.OUTBOUND), eq(2), eq("ORD-2026-001"), any());
    }

    @Test
    void updateOrderStatus_SalesProcessingToCancelled_ReleasesStock() {
        sampleOrder.setStatus(OrderStatus.PROCESSING);
        sampleInventory.setQuantityReserved(2);

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.CANCELLED)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.updateOrderStatus(orderId, request);

        assertThat(sampleInventory.getQuantityOnHand()).isEqualTo(100);
        assertThat(sampleInventory.getQuantityReserved()).isEqualTo(0);
    }

    @Test
    void updateOrderStatus_PurchaseProcessingToCompleted_ReceivesStock() {
        sampleOrder.setType(OrderType.PURCHASE);
        sampleOrder.setStatus(OrderStatus.PROCESSING);

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.COMPLETED)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));
        when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

        orderService.updateOrderStatus(orderId, request);

        assertThat(sampleInventory.getQuantityOnHand()).isEqualTo(102);
        verify(stockMovementService).recordMovement(eq(sampleInventory), eq(StockMovementType.INBOUND), eq(2), eq("ORD-2026-001"), any());
    }

    @Test
    void updateOrderStatus_AlreadyCompleted_ThrowsInvalidOrderException() {
        sampleOrder.setStatus(OrderStatus.COMPLETED);
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.CANCELLED)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

        assertThatThrownBy(() -> orderService.updateOrderStatus(orderId, request))
                .isInstanceOf(InvalidOrderException.class)
                .hasMessageContaining("Cannot change status of an order that is already COMPLETED");
    }
}
