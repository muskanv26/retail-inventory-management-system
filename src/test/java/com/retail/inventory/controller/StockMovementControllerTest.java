package com.retail.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.inventory.dto.StockAdjustmentRequest;
import com.retail.inventory.dto.StockMovementResponse;
import com.retail.inventory.entity.StockMovementType;
import com.retail.inventory.exception.InvalidInventoryException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.service.StockMovementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.retail.inventory.security.JwtAuthenticationFilter;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@WebMvcTest(
    value = StockMovementController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class StockMovementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StockMovementService stockMovementService;

    private UUID inventoryId;
    private UUID productId;
    private StockMovementResponse sampleResponse;

    @BeforeEach
    void setUp() {
        inventoryId = UUID.randomUUID();
        productId = UUID.randomUUID();

        sampleResponse = StockMovementResponse.builder()
                .id(UUID.randomUUID())
                .inventoryId(inventoryId)
                .productId(productId)
                .productSku("PROD-100")
                .productName("Wireless Headset")
                .warehouseCode("WH-MAIN")
                .type(StockMovementType.ADJUSTMENT)
                .quantity(15)
                .reason("Count correction")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Test
    void adjustStock_ValidRequest_ReturnsOk() throws Exception {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(15)
                .reason("Count correction")
                .build();

        when(stockMovementService.adjustStock(any(StockAdjustmentRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/stock-movements/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inventoryId").value(inventoryId.toString()))
                .andExpect(jsonPath("$.type").value("ADJUSTMENT"))
                .andExpect(jsonPath("$.quantity").value(15));
    }

    @Test
    void adjustStock_ValidationFailure_ReturnsBadRequest() throws Exception {
        StockAdjustmentRequest invalidRequest = StockAdjustmentRequest.builder()
                .productId(null)
                .warehouseCode("")
                .quantityAdjustment(null)
                .build();

        mockMvc.perform(post("/api/v1/stock-movements/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.productId").exists())
                .andExpect(jsonPath("$.validationErrors.warehouseCode").exists())
                .andExpect(jsonPath("$.validationErrors.quantityAdjustment").exists());
    }

    @Test
    void adjustStock_InvalidNegative_ReturnsBadRequest() throws Exception {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(-500)
                .build();

        when(stockMovementService.adjustStock(any(StockAdjustmentRequest.class)))
                .thenThrow(new InvalidInventoryException("Stock adjustment would result in negative quantity on hand (-400)"));

        mockMvc.perform(post("/api/v1/stock-movements/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void adjustStock_NonexistentInventory_ReturnsNotFound() throws Exception {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(10)
                .build();

        when(stockMovementService.adjustStock(any(StockAdjustmentRequest.class)))
                .thenThrow(new ResourceNotFoundException("Inventory record not found"));

        mockMvc.perform(post("/api/v1/stock-movements/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getStockMovements_ReturnsOk() throws Exception {
        when(stockMovementService.getStockMovements(null, null, null)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/stock-movements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].inventoryId").value(inventoryId.toString()))
                .andExpect(jsonPath("$[0].type").value("ADJUSTMENT"));
    }
}
