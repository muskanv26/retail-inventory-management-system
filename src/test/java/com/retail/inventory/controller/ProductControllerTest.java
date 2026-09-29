package com.retail.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.inventory.dto.CreateProductRequest;
import com.retail.inventory.dto.ProductResponse;
import com.retail.inventory.dto.UpdateProductRequest;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.service.ProductService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    private UUID productId;
    private ProductResponse sampleResponse;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        sampleResponse = ProductResponse.builder()
                .id(productId)
                .sku("PROD-001")
                .name("Wireless Mouse")
                .description("Ergonomic optical mouse")
                .category("Electronics")
                .unitPrice(new BigDecimal("29.99"))
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createProduct_ValidRequest_ReturnsCreated() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .sku("PROD-001")
                .name("Wireless Mouse")
                .description("Ergonomic optical mouse")
                .category("Electronics")
                .unitPrice(new BigDecimal("29.99"))
                .active(true)
                .build();

        when(productService.createProduct(any(CreateProductRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.sku").value("PROD-001"))
                .andExpect(jsonPath("$.name").value("Wireless Mouse"));
    }

    @Test
    void createProduct_InvalidValidation_ReturnsBadRequest() throws Exception {
        CreateProductRequest invalidRequest = CreateProductRequest.builder()
                .sku("") // invalid: blank
                .name("") // invalid: blank
                .category("Electronics")
                .unitPrice(new BigDecimal("-10.00")) // invalid: negative
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.sku").exists())
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.unitPrice").exists());
    }

    @Test
    void createProduct_DuplicateSku_ReturnsConflict() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .sku("DUPLICATE-SKU")
                .name("Wireless Mouse")
                .category("Electronics")
                .unitPrice(new BigDecimal("29.99"))
                .build();

        when(productService.createProduct(any(CreateProductRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("Product with SKU 'DUPLICATE-SKU' already exists"));

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Product with SKU 'DUPLICATE-SKU' already exists"));
    }

    @Test
    void getAllProducts_ReturnsOk() throws Exception {
        when(productService.getAllProducts()).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(productId.toString()))
                .andExpect(jsonPath("$[0].sku").value("PROD-001"));
    }

    @Test
    void getProductById_ExistingId_ReturnsOk() throws Exception {
        when(productService.getProductById(productId)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId.toString()))
                .andExpect(jsonPath("$.sku").value("PROD-001"));
    }

    @Test
    void getProductById_NonExistingId_ReturnsNotFound() throws Exception {
        UUID nonExistingId = UUID.randomUUID();
        when(productService.getProductById(nonExistingId))
                .thenThrow(new ResourceNotFoundException("Product not found with ID: " + nonExistingId));

        mockMvc.perform(get("/api/v1/products/{id}", nonExistingId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void updateProduct_ValidRequest_ReturnsOk() throws Exception {
        UpdateProductRequest request = UpdateProductRequest.builder()
                .sku("PROD-001")
                .name("Wireless Mouse v2")
                .category("Electronics")
                .unitPrice(new BigDecimal("34.99"))
                .active(true)
                .build();

        when(productService.updateProduct(eq(productId), any(UpdateProductRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/v1/products/{id}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId.toString()));
    }

    @Test
    void deleteProduct_ExistingId_ReturnsNoContent() throws Exception {
        doNothing().when(productService).deleteProduct(productId);

        mockMvc.perform(delete("/api/v1/products/{id}", productId))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteProduct_NonExistingId_ReturnsNotFound() throws Exception {
        UUID nonExistingId = UUID.randomUUID();
        doThrow(new ResourceNotFoundException("Product not found with ID: " + nonExistingId))
                .when(productService).deleteProduct(nonExistingId);

        mockMvc.perform(delete("/api/v1/products/{id}", nonExistingId))
                .andExpect(status().isNotFound());
    }
}
