package com.retail.inventory.service;

import com.retail.inventory.dto.CreateInventoryRequest;
import com.retail.inventory.dto.InventoryResponse;
import com.retail.inventory.dto.UpdateInventoryRequest;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Product;
import com.retail.inventory.exception.InvalidInventoryException;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

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
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private UUID productId;
    private UUID inventoryId;
    private Product sampleProduct;
    private Inventory sampleInventory;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        inventoryId = UUID.randomUUID();

        sampleProduct = Product.builder()
                .id(productId)
                .sku("PROD-100")
                .name("Mechanical Keyboard")
                .category("Electronics")
                .unitPrice(new BigDecimal("89.99"))
                .active(true)
                .build();

        sampleInventory = Inventory.builder()
                .id(inventoryId)
                .product(sampleProduct)
                .warehouseCode("WH-EAST-1")
                .quantityOnHand(100)
                .quantityReserved(20)
                .reorderLevel(15)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createInventory_Success() {
        CreateInventoryRequest request = CreateInventoryRequest.builder()
                .productId(productId)
                .warehouseCode("WH-EAST-1")
                .quantityOnHand(100)
                .quantityReserved(20)
                .reorderLevel(15)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
        when(inventoryRepository.existsByProductIdAndWarehouseCode(productId, "WH-EAST-1")).thenReturn(false);
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(sampleInventory);

        InventoryResponse response = inventoryService.createInventory(request);

        assertThat(response).isNotNull();
        assertThat(response.getProductId()).isEqualTo(productId);
        assertThat(response.getWarehouseCode()).isEqualTo("WH-EAST-1");
        assertThat(response.getQuantityAvailable()).isEqualTo(80); // 100 - 20
        assertThat(response.isReorderNeeded()).isFalse();

        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void createInventory_ProductNotFound_ThrowsResourceNotFoundException() {
        CreateInventoryRequest request = CreateInventoryRequest.builder()
                .productId(productId)
                .warehouseCode("WH-EAST-1")
                .quantityOnHand(50)
                .quantityReserved(5)
                .reorderLevel(10)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.createInventory(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found with ID: " + productId);

        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void createInventory_DuplicateProductAndWarehouse_ThrowsResourceAlreadyExistsException() {
        CreateInventoryRequest request = CreateInventoryRequest.builder()
                .productId(productId)
                .warehouseCode("WH-EAST-1")
                .quantityOnHand(50)
                .quantityReserved(5)
                .reorderLevel(10)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
        when(inventoryRepository.existsByProductIdAndWarehouseCode(productId, "WH-EAST-1")).thenReturn(true);

        assertThatThrownBy(() -> inventoryService.createInventory(request))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessageContaining("Inventory record already exists for Product ID");

        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void createInventory_ReservedExceedsOnHand_ThrowsInvalidInventoryException() {
        CreateInventoryRequest request = CreateInventoryRequest.builder()
                .productId(productId)
                .warehouseCode("WH-EAST-1")
                .quantityOnHand(10)
                .quantityReserved(25) // invalid: reserved > onHand
                .reorderLevel(5)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
        when(inventoryRepository.existsByProductIdAndWarehouseCode(productId, "WH-EAST-1")).thenReturn(false);

        assertThatThrownBy(() -> inventoryService.createInventory(request))
                .isInstanceOf(InvalidInventoryException.class)
                .hasMessageContaining("cannot exceed quantity on hand");

        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void getInventoryById_Success() {
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(sampleInventory));

        InventoryResponse response = inventoryService.getInventoryById(inventoryId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(inventoryId);
        assertThat(response.getQuantityAvailable()).isEqualTo(80);
    }

    @Test
    void getAllInventory_FilterByProductId_Success() {
        when(inventoryRepository.findByProductId(productId)).thenReturn(List.of(sampleInventory));

        List<InventoryResponse> results = inventoryService.getAllInventory(productId, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getProductId()).isEqualTo(productId);
    }

    @Test
    void updateInventory_Success() {
        UpdateInventoryRequest request = UpdateInventoryRequest.builder()
                .quantityOnHand(150)
                .quantityReserved(30)
                .reorderLevel(20)
                .build();

        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(sampleInventory);

        InventoryResponse response = inventoryService.updateInventory(inventoryId, request);

        assertThat(response).isNotNull();
        verify(inventoryRepository).save(sampleInventory);
    }

    @Test
    void updateInventory_ReservedExceedsOnHand_ThrowsInvalidInventoryException() {
        UpdateInventoryRequest request = UpdateInventoryRequest.builder()
                .quantityOnHand(50)
                .quantityReserved(100) // invalid
                .reorderLevel(10)
                .build();

        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(sampleInventory));

        assertThatThrownBy(() -> inventoryService.updateInventory(inventoryId, request))
                .isInstanceOf(InvalidInventoryException.class);

        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void deleteInventory_Success() {
        when(inventoryRepository.existsById(inventoryId)).thenReturn(true);

        inventoryService.deleteInventory(inventoryId);

        verify(inventoryRepository).deleteById(inventoryId);
    }

    @Test
    void inventory_VersionFieldMapping_Success() {
        sampleInventory.setVersion(1L);
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(sampleInventory));

        InventoryResponse response = inventoryService.getInventoryById(inventoryId);

        assertThat(response).isNotNull();
        assertThat(response.getVersion()).isEqualTo(1L);
    }

    @Test
    void updateInventory_OptimisticLockingFailure_ThrowsOptimisticLockingFailureException() {
        UpdateInventoryRequest request = UpdateInventoryRequest.builder()
                .quantityOnHand(120)
                .quantityReserved(30)
                .reorderLevel(15)
                .build();

        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(sampleInventory));
        when(inventoryRepository.save(any(Inventory.class)))
                .thenThrow(new ObjectOptimisticLockingFailureException(Inventory.class, inventoryId));

        assertThatThrownBy(() -> inventoryService.updateInventory(inventoryId, request))
                .isInstanceOf(ObjectOptimisticLockingFailureException.class);
    }
}
