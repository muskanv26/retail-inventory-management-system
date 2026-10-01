package com.retail.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.inventory.dto.CreateWarehouseRequest;
import com.retail.inventory.dto.UpdateWarehouseRequest;
import com.retail.inventory.dto.WarehouseResponse;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.service.WarehouseService;
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

import com.retail.inventory.security.JwtAuthenticationFilter;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@WebMvcTest(
    value = WarehouseController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
class WarehouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WarehouseService warehouseService;

    private UUID warehouseId;
    private WarehouseResponse sampleResponse;

    @BeforeEach
    void setUp() {
        warehouseId = UUID.randomUUID();
        sampleResponse = WarehouseResponse.builder()
                .id(warehouseId)
                .code("WH-NORTH-1")
                .name("North Distribution Center")
                .location("Seattle, WA")
                .capacity(50000)
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createWarehouse_ValidRequest_ReturnsCreated() throws Exception {
        CreateWarehouseRequest request = CreateWarehouseRequest.builder()
                .code("WH-NORTH-1")
                .name("North Distribution Center")
                .location("Seattle, WA")
                .capacity(50000)
                .active(true)
                .build();

        when(warehouseService.createWarehouse(any(CreateWarehouseRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(warehouseId.toString()))
                .andExpect(jsonPath("$.code").value("WH-NORTH-1"))
                .andExpect(jsonPath("$.name").value("North Distribution Center"));
    }

    @Test
    void createWarehouse_InvalidValidation_ReturnsBadRequest() throws Exception {
        CreateWarehouseRequest invalidRequest = CreateWarehouseRequest.builder()
                .code("") // blank
                .name("") // blank
                .capacity(-100) // negative
                .build();

        mockMvc.perform(post("/api/v1/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.code").exists())
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.capacity").exists());
    }

    @Test
    void createWarehouse_DuplicateCode_ReturnsConflict() throws Exception {
        CreateWarehouseRequest request = CreateWarehouseRequest.builder()
                .code("WH-DUPLICATE")
                .name("North Distribution Center")
                .capacity(50000)
                .build();

        when(warehouseService.createWarehouse(any(CreateWarehouseRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("Warehouse with code 'WH-DUPLICATE' already exists"));

        mockMvc.perform(post("/api/v1/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void getAllWarehouses_ReturnsOk() throws Exception {
        when(warehouseService.getAllWarehouses()).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/warehouses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(warehouseId.toString()))
                .andExpect(jsonPath("$[0].code").value("WH-NORTH-1"));
    }

    @Test
    void getWarehouseById_ExistingId_ReturnsOk() throws Exception {
        when(warehouseService.getWarehouseById(warehouseId)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/warehouses/{id}", warehouseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(warehouseId.toString()))
                .andExpect(jsonPath("$.code").value("WH-NORTH-1"));
    }

    @Test
    void getWarehouseByCode_ExistingCode_ReturnsOk() throws Exception {
        when(warehouseService.getWarehouseByCode("WH-NORTH-1")).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/warehouses/code/{code}", "WH-NORTH-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("WH-NORTH-1"));
    }

    @Test
    void updateWarehouse_ValidRequest_ReturnsOk() throws Exception {
        UpdateWarehouseRequest request = UpdateWarehouseRequest.builder()
                .code("WH-NORTH-1")
                .name("Updated Distribution Center")
                .location("Seattle, WA")
                .capacity(60000)
                .active(true)
                .build();

        when(warehouseService.updateWarehouse(eq(warehouseId), any(UpdateWarehouseRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/v1/warehouses/{id}", warehouseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(warehouseId.toString()));
    }

    @Test
    void deleteWarehouse_ExistingId_ReturnsNoContent() throws Exception {
        doNothing().when(warehouseService).deleteWarehouse(warehouseId);

        mockMvc.perform(delete("/api/v1/warehouses/{id}", warehouseId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteWarehouse_NonExistingId_ReturnsNotFound() throws Exception {
        UUID nonExistingId = UUID.randomUUID();
        doThrow(new ResourceNotFoundException("Warehouse not found with ID: " + nonExistingId))
                .when(warehouseService).deleteWarehouse(nonExistingId);

        mockMvc.perform(delete("/api/v1/warehouses/{id}", nonExistingId))
                .andExpect(status().isNotFound());
    }
}
