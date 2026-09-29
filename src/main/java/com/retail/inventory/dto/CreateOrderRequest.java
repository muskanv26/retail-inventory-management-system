package com.retail.inventory.dto;

import com.retail.inventory.entity.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotBlank(message = "Order number is required")
    @Size(min = 3, max = 50, message = "Order number must be between 3 and 50 characters")
    private String orderNumber;

    @NotNull(message = "Order type is required (PURCHASE or SALES)")
    private OrderType type;

    @NotBlank(message = "Warehouse code is required")
    @Size(max = 50, message = "Warehouse code must not exceed 50 characters")
    private String warehouseCode;

    @Size(max = 50, message = "Supplier code must not exceed 50 characters")
    private String supplierCode;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<CreateOrderItemRequest> items;
}
