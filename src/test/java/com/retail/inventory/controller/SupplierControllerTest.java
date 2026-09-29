package com.retail.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.inventory.dto.CreateSupplierRequest;
import com.retail.inventory.dto.SupplierResponse;
import com.retail.inventory.dto.UpdateSupplierRequest;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.service.SupplierService;
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

@WebMvcTest(SupplierController.class)
class SupplierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SupplierService supplierService;

    private UUID supplierId;
    private SupplierResponse sampleResponse;

    @BeforeEach
    void setUp() {
        supplierId = UUID.randomUUID();
        sampleResponse = SupplierResponse.builder()
                .id(supplierId)
                .code("SUP-GLOBAL-1")
                .name("Global Tech Supplies")
                .contactName("John Doe")
                .email("contact@globaltech.com")
                .phone("+1-555-0199")
                .address("100 Tech Way, San Jose, CA")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createSupplier_ValidRequest_ReturnsCreated() throws Exception {
        CreateSupplierRequest request = CreateSupplierRequest.builder()
                .code("SUP-GLOBAL-1")
                .name("Global Tech Supplies")
                .contactName("John Doe")
                .email("contact@globaltech.com")
                .phone("+1-555-0199")
                .address("100 Tech Way, San Jose, CA")
                .active(true)
                .build();

        when(supplierService.createSupplier(any(CreateSupplierRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(supplierId.toString()))
                .andExpect(jsonPath("$.code").value("SUP-GLOBAL-1"))
                .andExpect(jsonPath("$.name").value("Global Tech Supplies"));
    }

    @Test
    void createSupplier_InvalidValidation_ReturnsBadRequest() throws Exception {
        CreateSupplierRequest invalidRequest = CreateSupplierRequest.builder()
                .code("") // blank
                .name("") // blank
                .email("invalid-email-format") // invalid email
                .build();

        mockMvc.perform(post("/api/v1/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.code").exists())
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.email").exists());
    }

    @Test
    void createSupplier_DuplicateCode_ReturnsConflict() throws Exception {
        CreateSupplierRequest request = CreateSupplierRequest.builder()
                .code("SUP-DUPLICATE")
                .name("Global Tech Supplies")
                .build();

        when(supplierService.createSupplier(any(CreateSupplierRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("Supplier with code 'SUP-DUPLICATE' already exists"));

        mockMvc.perform(post("/api/v1/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    void getAllSuppliers_ReturnsOk() throws Exception {
        when(supplierService.getAllSuppliers()).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(supplierId.toString()))
                .andExpect(jsonPath("$[0].code").value("SUP-GLOBAL-1"));
    }

    @Test
    void getSupplierById_ExistingId_ReturnsOk() throws Exception {
        when(supplierService.getSupplierById(supplierId)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/suppliers/{id}", supplierId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(supplierId.toString()))
                .andExpect(jsonPath("$.code").value("SUP-GLOBAL-1"));
    }

    @Test
    void getSupplierByCode_ExistingCode_ReturnsOk() throws Exception {
        when(supplierService.getSupplierByCode("SUP-GLOBAL-1")).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/suppliers/code/{code}", "SUP-GLOBAL-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUP-GLOBAL-1"));
    }

    @Test
    void updateSupplier_ValidRequest_ReturnsOk() throws Exception {
        UpdateSupplierRequest request = UpdateSupplierRequest.builder()
                .code("SUP-GLOBAL-1")
                .name("Updated Global Tech Supplies")
                .contactName("Jane Doe")
                .email("jane@globaltech.com")
                .phone("+1-555-0200")
                .address("200 New Tech Way, San Jose, CA")
                .active(true)
                .build();

        when(supplierService.updateSupplier(eq(supplierId), any(UpdateSupplierRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/v1/suppliers/{id}", supplierId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(supplierId.toString()));
    }

    @Test
    void deleteSupplier_ExistingId_ReturnsNoContent() throws Exception {
        doNothing().when(supplierService).deleteSupplier(supplierId);

        mockMvc.perform(delete("/api/v1/suppliers/{id}", supplierId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteSupplier_NonExistingId_ReturnsNotFound() throws Exception {
        UUID nonExistingId = UUID.randomUUID();
        doThrow(new ResourceNotFoundException("Supplier not found with ID: " + nonExistingId))
                .when(supplierService).deleteSupplier(nonExistingId);

        mockMvc.perform(delete("/api/v1/suppliers/{id}", nonExistingId))
                .andExpect(status().isNotFound());
    }
}
