package com.retail.inventory.service;

import com.retail.inventory.dto.CreateOrderItemRequest;
import com.retail.inventory.dto.CreateOrderRequest;
import com.retail.inventory.dto.OrderItemResponse;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementService stockMovementService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        String formattedOrderNumber = request.getOrderNumber().trim().toUpperCase();

        if (orderRepository.existsByOrderNumber(formattedOrderNumber)) {
            throw new ResourceAlreadyExistsException("Order with number '" + formattedOrderNumber + "' already exists");
        }

        String formattedWarehouseCode = request.getWarehouseCode().trim().toUpperCase();

        Warehouse warehouse = warehouseRepository.findByCode(formattedWarehouseCode)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with code: " + formattedWarehouseCode));

        if (!warehouse.isActive()) {
            throw new InvalidOrderException("Warehouse '" + formattedWarehouseCode + "' is inactive");
        }

        String formattedSupplierCode = request.getSupplierCode() != null && !request.getSupplierCode().isBlank()
                ? request.getSupplierCode().trim().toUpperCase() : null;

        Order order = Order.builder()
                .orderNumber(formattedOrderNumber)
                .type(request.getType())
                .status(OrderStatus.PENDING)
                .warehouseCode(formattedWarehouseCode)
                .supplierCode(formattedSupplierCode)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemReq.getProductId()));

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getUnitPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(itemTotal)
                    .build();

            order.addItem(item);
            runningTotal = runningTotal.add(itemTotal);
        }

        order.setTotalAmount(runningTotal);

        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    public List<OrderResponse> getAllOrders(OrderStatus status, OrderType type) {
        List<Order> orders;

        if (status != null && type != null) {
            orders = orderRepository.findByStatusAndType(status, type);
        } else if (status != null) {
            orders = orderRepository.findByStatus(status);
        } else if (type != null) {
            orders = orderRepository.findByType(type);
        } else {
            orders = orderRepository.findAll();
        }

        return orders.stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    public OrderResponse getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        return mapToOrderResponse(order);
    }

    public OrderResponse getOrderByNumber(String orderNumber) {
        String formattedOrderNumber = orderNumber.trim().toUpperCase();
        Order order = orderRepository.findByOrderNumber(formattedOrderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + formattedOrderNumber));
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID id, UpdateOrderStatusRequest request) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        OrderStatus currentStatus = existingOrder.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (currentStatus == OrderStatus.COMPLETED || currentStatus == OrderStatus.CANCELLED) {
            throw new InvalidOrderException("Cannot change status of an order that is already " + currentStatus);
        }

        if (currentStatus == newStatus) {
            return mapToOrderResponse(existingOrder);
        }

        Warehouse warehouse = warehouseRepository.findByCode(existingOrder.getWarehouseCode())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with code: " + existingOrder.getWarehouseCode()));

        if (!warehouse.isActive()) {
            throw new InvalidOrderException("Warehouse '" + existingOrder.getWarehouseCode() + "' is inactive");
        }

        processInventoryFulfillment(existingOrder, currentStatus, newStatus);

        existingOrder.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(existingOrder);
        return mapToOrderResponse(updatedOrder);
    }

    private void processInventoryFulfillment(Order order, OrderStatus currentStatus, OrderStatus newStatus) {
        String warehouseCode = order.getWarehouseCode();
        String refNumber = order.getOrderNumber();

        if (order.getType() == OrderType.SALES) {
            // SALES Order Transition: PENDING -> PROCESSING (Reserve stock)
            if (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.PROCESSING) {
                for (OrderItem item : order.getItems()) {
                    Inventory inventory = inventoryRepository.findByProductIdAndWarehouseCode(item.getProduct().getId(), warehouseCode)
                            .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for product SKU '" +
                                    item.getProduct().getSku() + "' at warehouse '" + warehouseCode + "'"));

                    int available = inventory.getQuantityOnHand() - inventory.getQuantityReserved();
                    if (available < item.getQuantity()) {
                        throw new InvalidOrderException("Insufficient available stock for product SKU '" + item.getProduct().getSku() +
                                "'. Available: " + available + ", Requested: " + item.getQuantity());
                    }

                    inventory.setQuantityReserved(inventory.getQuantityReserved() + item.getQuantity());
                    inventoryRepository.save(inventory);

                    stockMovementService.recordMovement(inventory, StockMovementType.RESERVATION, item.getQuantity(), refNumber,
                            "Reservation for Sales Order " + refNumber);
                }
            }
            // SALES Order Transition: PROCESSING -> COMPLETED (Fulfill stock)
            else if (currentStatus == OrderStatus.PROCESSING && newStatus == OrderStatus.COMPLETED) {
                for (OrderItem item : order.getItems()) {
                    Inventory inventory = inventoryRepository.findByProductIdAndWarehouseCode(item.getProduct().getId(), warehouseCode)
                            .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for product SKU '" +
                                    item.getProduct().getSku() + "' at warehouse '" + warehouseCode + "'"));

                    inventory.setQuantityOnHand(inventory.getQuantityOnHand() - item.getQuantity());
                    inventory.setQuantityReserved(inventory.getQuantityReserved() - item.getQuantity());
                    inventoryRepository.save(inventory);

                    stockMovementService.recordMovement(inventory, StockMovementType.OUTBOUND, item.getQuantity(), refNumber,
                            "Fulfillment for Sales Order " + refNumber);
                }
            }
            // SALES Order Transition: PENDING -> COMPLETED (Direct reservation + fulfillment)
            else if (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.COMPLETED) {
                for (OrderItem item : order.getItems()) {
                    Inventory inventory = inventoryRepository.findByProductIdAndWarehouseCode(item.getProduct().getId(), warehouseCode)
                            .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for product SKU '" +
                                    item.getProduct().getSku() + "' at warehouse '" + warehouseCode + "'"));

                    int available = inventory.getQuantityOnHand() - inventory.getQuantityReserved();
                    if (available < item.getQuantity()) {
                        throw new InvalidOrderException("Insufficient available stock for product SKU '" + item.getProduct().getSku() +
                                "'. Available: " + available + ", Requested: " + item.getQuantity());
                    }

                    inventory.setQuantityOnHand(inventory.getQuantityOnHand() - item.getQuantity());
                    inventoryRepository.save(inventory);

                    stockMovementService.recordMovement(inventory, StockMovementType.OUTBOUND, item.getQuantity(), refNumber,
                            "Direct fulfillment for Sales Order " + refNumber);
                }
            }
            // SALES Order Transition: PROCESSING -> CANCELLED (Release reserved stock)
            else if (currentStatus == OrderStatus.PROCESSING && newStatus == OrderStatus.CANCELLED) {
                for (OrderItem item : order.getItems()) {
                    Inventory inventory = inventoryRepository.findByProductIdAndWarehouseCode(item.getProduct().getId(), warehouseCode)
                            .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found for product SKU '" +
                                    item.getProduct().getSku() + "' at warehouse '" + warehouseCode + "'"));

                    inventory.setQuantityReserved(inventory.getQuantityReserved() - item.getQuantity());
                    inventoryRepository.save(inventory);

                    stockMovementService.recordMovement(inventory, StockMovementType.RESERVATION, -item.getQuantity(), refNumber,
                            "Released reservation for Cancelled Sales Order " + refNumber);
                }
            }
        } else if (order.getType() == OrderType.PURCHASE) {
            // PURCHASE Order Transition: Anything -> COMPLETED (Receive stock)
            if (newStatus == OrderStatus.COMPLETED) {
                for (OrderItem item : order.getItems()) {
                    Inventory inventory = inventoryRepository.findByProductIdAndWarehouseCode(item.getProduct().getId(), warehouseCode)
                            .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                                    .product(item.getProduct())
                                    .warehouseCode(warehouseCode)
                                    .quantityOnHand(0)
                                    .quantityReserved(0)
                                    .reorderLevel(0)
                                    .build()));

                    inventory.setQuantityOnHand(inventory.getQuantityOnHand() + item.getQuantity());
                    inventoryRepository.save(inventory);

                    stockMovementService.recordMovement(inventory, StockMovementType.INBOUND, item.getQuantity(), refNumber,
                            "Receiving stock for Purchase Order " + refNumber);
                }
            }
        }
    }

    @Transactional
    public void deleteOrder(UUID id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found with ID: " + id);
        }
        orderRepository.deleteById(id);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productSku(item.getProduct().getSku())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .type(order.getType())
                .status(order.getStatus())
                .warehouseCode(order.getWarehouseCode())
                .supplierCode(order.getSupplierCode())
                .totalAmount(order.getTotalAmount())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
