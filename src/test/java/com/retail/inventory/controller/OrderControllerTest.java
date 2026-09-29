package com.retail.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.inventory.dto.CreateOrderItemRequest;
import com.retail.inventory.dto.CreateOrderRequest;
import com.retail.inventory.dto.OrderItemResponse;
import com.retail.inventory.dto.OrderResponse;
import com.retail.inventory.dto.UpdateOrderStatusRequest;
import com.retail.inventory.entity.OrderStatus;
import com.retail.inventory.entity.OrderType;
import com.retail.inventory.exception.InvalidOrderException;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    private UUID orderId;
    private UUID productId;
    private OrderResponse sampleResponse;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        productId = UUID.randomUUID();

        OrderItemResponse itemResponse = OrderItemResponse.builder()
                .id(UUID.randomUUID())
                .productId(productId)
                .productSku("PROD-001")
                .productName("Wireless Router")
                .quantity(2)
                .unitPrice(new BigDecimal("49.99"))
                .totalPrice(new BigDecimal("99.98"))
                .build();

        sampleResponse = OrderResponse.builder()
                .id(orderId)
                .orderNumber("ORD-2026-001")
                .type(OrderType.SALES)
                .status(OrderStatus.PENDING)
                .warehouseCode("WH-MAIN")
                .totalAmount(new BigDecimal("99.98"))
                .items(List.of(itemResponse))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createOrder_ValidRequest_ReturnsCreated() throws Exception {
        CreateOrderItemRequest itemReq = CreateOrderItemRequest.builder()
                .productId(productId)
                .quantity(2)
                .unitPrice(new BigDecimal("49.99"))
                .build();

        CreateOrderRequest request = CreateOrderRequest.builder()
                .orderNumber("ORD-2026-001")
                .type(OrderType.SALES)
                .warehouseCode("WH-MAIN")
                .items(List.of(itemReq))
                .build();

        when(orderService.createOrder(any(CreateOrderRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(orderId.toString()))
                .andExpect(jsonPath("$.orderNumber").value("ORD-2026-001"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createOrder_InvalidValidation_ReturnsBadRequest() throws Exception {
        CreateOrderRequest invalidRequest = CreateOrderRequest.builder()
                .orderNumber("") // blank
                .type(null) // null
                .warehouseCode("")
                .items(List.of()) // empty list
                .build();

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.orderNumber").exists())
                .andExpect(jsonPath("$.validationErrors.type").exists())
                .andExpect(jsonPath("$.validationErrors.items").exists());
    }

    @Test
    void createOrder_DuplicateOrderNumber_ReturnsConflict() throws Exception {
        CreateOrderItemRequest itemReq = CreateOrderItemRequest.builder()
                .productId(productId)
                .quantity(1)
                .build();

        CreateOrderRequest request = CreateOrderRequest.builder()
                .orderNumber("ORD-DUPLICATE")
                .type(OrderType.SALES)
                .warehouseCode("WH-MAIN")
                .items(List.of(itemReq))
                .build();

        when(orderService.createOrder(any(CreateOrderRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("Order with number 'ORD-DUPLICATE' already exists"));

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void getAllOrders_ReturnsOk() throws Exception {
        when(orderService.getAllOrders(null, null)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orderId.toString()))
                .andExpect(jsonPath("$[0].orderNumber").value("ORD-2026-001"));
    }

    @Test
    void getOrderById_ExistingId_ReturnsOk() throws Exception {
        when(orderService.getOrderById(orderId)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId.toString()))
                .andExpect(jsonPath("$.orderNumber").value("ORD-2026-001"));
    }

    @Test
    void getOrderByNumber_ExistingNumber_ReturnsOk() throws Exception {
        when(orderService.getOrderByNumber("ORD-2026-001")).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/orders/number/{orderNumber}", "ORD-2026-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-2026-001"));
    }

    @Test
    void updateOrderStatus_ValidStatusChange_ReturnsOk() throws Exception {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.COMPLETED)
                .build();

        when(orderService.updateOrderStatus(eq(orderId), any(UpdateOrderStatusRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(patch("/api/v1/orders/{id}/status", orderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId.toString()));
    }

    @Test
    void updateOrderStatus_InvalidStatusTransition_ReturnsBadRequest() throws Exception {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.CANCELLED)
                .build();

        when(orderService.updateOrderStatus(eq(orderId), any(UpdateOrderStatusRequest.class)))
                .thenThrow(new InvalidOrderException("Cannot change status of an order that is already COMPLETED"));

        mockMvc.perform(patch("/api/v1/orders/{id}/status", orderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void deleteOrder_ExistingId_ReturnsNoContent() throws Exception {
        doNothing().when(orderService).deleteOrder(orderId);

        mockMvc.perform(delete("/api/v1/orders/{id}", orderId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteOrder_NonExistingId_ReturnsNotFound() throws Exception {
        UUID nonExistingId = UUID.randomUUID();
        doThrow(new ResourceNotFoundException("Order not found with ID: " + nonExistingId))
                .when(orderService).deleteOrder(nonExistingId);

        mockMvc.perform(delete("/api/v1/orders/{id}", nonExistingId))
                .andExpect(status().isNotFound());
    }
}
