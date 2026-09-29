package com.retail.inventory.service;

import com.retail.inventory.dto.CreateProductRequest;
import com.retail.inventory.dto.ProductResponse;
import com.retail.inventory.dto.UpdateProductRequest;
import com.retail.inventory.entity.Product;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private UUID productId;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        sampleProduct = Product.builder()
                .id(productId)
                .sku("PROD-001")
                .name("Test Product")
                .description("Sample description")
                .category("Electronics")
                .unitPrice(new BigDecimal("99.99"))
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createProduct_Success() {
        CreateProductRequest request = CreateProductRequest.builder()
                .sku("PROD-001")
                .name("Test Product")
                .description("Sample description")
                .category("Electronics")
                .unitPrice(new BigDecimal("99.99"))
                .active(true)
                .build();

        when(productRepository.existsBySku("PROD-001")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.createProduct(request);

        assertThat(response).isNotNull();
        assertThat(response.getSku()).isEqualTo("PROD-001");
        assertThat(response.getName()).isEqualTo("Test Product");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_DuplicateSku_ThrowsResourceAlreadyExistsException() {
        CreateProductRequest request = CreateProductRequest.builder()
                .sku("PROD-001")
                .name("Test Product")
                .category("Electronics")
                .unitPrice(new BigDecimal("99.99"))
                .build();

        when(productRepository.existsBySku("PROD-001")).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessageContaining("Product with SKU 'PROD-001' already exists");

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void getProductById_Success() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));

        ProductResponse response = productService.getProductById(productId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(productId);
        assertThat(response.getSku()).isEqualTo("PROD-001");
    }

    @Test
    void getProductById_NotFound_ThrowsResourceNotFoundException() {
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found with ID: " + nonExistentId);
    }

    @Test
    void getAllProducts_Success() {
        when(productRepository.findAll()).thenReturn(List.of(sampleProduct));

        List<ProductResponse> products = productService.getAllProducts();

        assertThat(products).hasSize(1);
        assertThat(products.get(0).getSku()).isEqualTo("PROD-001");
    }

    @Test
    void updateProduct_Success() {
        UpdateProductRequest updateRequest = UpdateProductRequest.builder()
                .sku("PROD-001-UPDATED")
                .name("Updated Product Name")
                .category("Electronics")
                .unitPrice(new BigDecimal("149.99"))
                .active(true)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.existsBySkuAndIdNot("PROD-001-UPDATED", productId)).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.updateProduct(productId, updateRequest);

        assertThat(response).isNotNull();
        verify(productRepository).save(sampleProduct);
    }

    @Test
    void deleteProduct_Success() {
        when(productRepository.existsById(productId)).thenReturn(true);

        productService.deleteProduct(productId);

        verify(productRepository).deleteById(productId);
    }

    @Test
    void deleteProduct_NotFound_ThrowsResourceNotFoundException() {
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.existsById(nonExistentId)).thenReturn(false);

        assertThatThrownBy(() -> productService.deleteProduct(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
