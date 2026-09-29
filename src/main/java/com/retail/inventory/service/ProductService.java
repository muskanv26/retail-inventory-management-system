package com.retail.inventory.service;

import com.retail.inventory.dto.CreateProductRequest;
import com.retail.inventory.dto.ProductResponse;
import com.retail.inventory.dto.UpdateProductRequest;
import com.retail.inventory.entity.Product;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        String formattedSku = request.getSku().trim().toUpperCase();
        if (productRepository.existsBySku(formattedSku)) {
            throw new ResourceAlreadyExistsException("Product with SKU '" + formattedSku + "' already exists");
        }

        Product product = Product.builder()
                .sku(formattedSku)
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .category(request.getCategory().trim())
                .unitPrice(request.getUnitPrice())
                .active(request.isActive())
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToProductResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return mapToProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, UpdateProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        String formattedSku = request.getSku().trim().toUpperCase();
        if (productRepository.existsBySkuAndIdNot(formattedSku, id)) {
            throw new ResourceAlreadyExistsException("Product with SKU '" + formattedSku + "' already exists");
        }

        existingProduct.setSku(formattedSku);
        existingProduct.setName(request.getName().trim());
        existingProduct.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        existingProduct.setCategory(request.getCategory().trim());
        existingProduct.setUnitPrice(request.getUnitPrice());
        existingProduct.setActive(request.isActive());

        Product updatedProduct = productRepository.save(existingProduct);
        return mapToProductResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory())
                .unitPrice(product.getUnitPrice())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
