package com.retail.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.inventory.dto.CreateInventoryRequest;
import com.retail.inventory.dto.InventoryResponse;
import com.retail.inventory.dto.UpdateInventoryRequest;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.exception.InvalidInventoryException;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.service.InventoryService;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InventoryService inventoryService;

    private UUID productId;
    private UUID inventoryId;
    private InventoryResponse sampleResponse;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        inventoryId = UUID.randomUUID();

        sampleResponse = InventoryResponse.builder()
                .id(inventoryId)
                .productId(productId)
                .productSku("PROD-100")
                .productName("Mechanical Keyboard")
                .warehouseCode("WH-MAIN")
                .quantityOnHand(100)
                .quantityReserved(20)
                .quantityAvailable(80)
                .reorderLevel(15)
                .reorderNeeded(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createInventory_ValidRequest_ReturnsCreated() throws Exception {
        CreateInventoryRequest request = CreateInventoryRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityOnHand(100)
                .quantityReserved(20)
                .reorderLevel(15)
                .build();

        when(inventoryService.createInventory(any(CreateInventoryRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(inventoryId.toString()))
                .andExpect(jsonPath("$.warehouseCode").value("WH-MAIN"))
                .andExpect(jsonPath("$.quantityAvailable").value(80));
    }

    @Test
    void createInventory_ValidationFailure_ReturnsBadRequest() throws Exception {
        CreateInventoryRequest invalidRequest = CreateInventoryRequest.builder()
                .productId(null)
                .warehouseCode("")
                .quantityOnHand(-5)
                .quantityReserved(-2)
                .reorderLevel(-1)
                .build();

        mockMvc.perform(post("/api/v1/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.productId").exists())
                .andExpect(jsonPath("$.validationErrors.warehouseCode").exists())
                .andExpect(jsonPath("$.validationErrors.quantityOnHand").exists());
    }

    @Test
    void createInventory_ReservedExceedsOnHand_ReturnsBadRequest() throws Exception {
        CreateInventoryRequest request = CreateInventoryRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityOnHand(10)
                .quantityReserved(50)
                .reorderLevel(5)
                .build();

        when(inventoryService.createInventory(any(CreateInventoryRequest.class)))
                .thenThrow(new InvalidInventoryException("Quantity reserved (50) cannot exceed quantity on hand (10)"));

        mockMvc.perform(post("/api/v1/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Quantity reserved (50) cannot exceed quantity on hand (10)"));
    }

    @Test
    void createInventory_DuplicateRecord_ReturnsConflict() throws Exception {
        CreateInventoryRequest request = CreateInventoryRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityOnHand(100)
                .quantityReserved(10)
                .reorderLevel(5)
                .build();

        when(inventoryService.createInventory(any(CreateInventoryRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("Inventory record already exists for Product ID"));

        mockMvc.perform(post("/api/v1/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void getAllInventory_ReturnsOk() throws Exception {
        when(inventoryService.getAllInventory(null, null)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(inventoryId.toString()))
                .andExpect(jsonPath("$[0].warehouseCode").value("WH-MAIN"));
    }

    @Test
    void getInventoryById_ExistingId_ReturnsOk() throws Exception {
        when(inventoryService.getInventoryById(inventoryId)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/inventory/{id}", inventoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(inventoryId.toString()))
                .andExpect(jsonPath("$.quantityOnHand").value(100));
    }

    @Test
    void getInventoryById_NonExistingId_ReturnsNotFound() throws Exception {
        UUID nonExistingId = UUID.randomUUID();
        when(inventoryService.getInventoryById(nonExistingId))
                .thenThrow(new ResourceNotFoundException("Inventory not found with ID: " + nonExistingId));

        mockMvc.perform(get("/api/v1/inventory/{id}", nonExistingId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void updateInventory_ValidRequest_ReturnsOk() throws Exception {
        UpdateInventoryRequest request = UpdateInventoryRequest.builder()
                .quantityOnHand(120)
                .quantityReserved(30)
                .reorderLevel(15)
                .build();

        when(inventoryService.updateInventory(eq(inventoryId), any(UpdateInventoryRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/v1/inventory/{id}", inventoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(inventoryId.toString()));
    }

    @Test
    void deleteInventory_ExistingId_ReturnsNoContent() throws Exception {
        doNothing().when(inventoryService).deleteInventory(inventoryId);

        mockMvc.perform(delete("/api/v1/inventory/{id}", inventoryId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteInventory_NonExistingId_ReturnsNotFound() throws Exception {
        UUID nonExistingId = UUID.randomUUID();
        doThrow(new ResourceNotFoundException("Inventory not found with ID: " + nonExistingId))
                .when(inventoryService).deleteInventory(nonExistingId);

        mockMvc.perform(delete("/api/v1/inventory/{id}", nonExistingId))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateInventory_OptimisticLockingConflict_ReturnsConflict() throws Exception {
        UpdateInventoryRequest request = UpdateInventoryRequest.builder()
                .quantityOnHand(120)
                .quantityReserved(30)
                .reorderLevel(15)
                .build();

        when(inventoryService.updateInventory(eq(inventoryId), any(UpdateInventoryRequest.class)))
                .thenThrow(new ObjectOptimisticLockingFailureException(Inventory.class, inventoryId));

        mockMvc.perform(put("/api/v1/inventory/{id}", inventoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("The inventory resource was modified by another transaction. Please retry."));
    }
}
