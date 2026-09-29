package com.retail.inventory.service;

import com.retail.inventory.dto.StockAdjustmentRequest;
import com.retail.inventory.dto.StockMovementResponse;
import com.retail.inventory.entity.Inventory;
import com.retail.inventory.entity.Product;
import com.retail.inventory.entity.StockMovement;
import com.retail.inventory.entity.StockMovementType;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.exception.InvalidInventoryException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.InventoryRepository;
import com.retail.inventory.repository.StockMovementRepository;
import com.retail.inventory.repository.WarehouseRepository;
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
class StockMovementServiceTest {

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @InjectMocks
    private StockMovementService stockMovementService;

    private UUID inventoryId;
    private UUID productId;
    private Product sampleProduct;
    private Warehouse sampleWarehouse;
    private Inventory sampleInventory;
    private StockMovement sampleMovement;

    @BeforeEach
    void setUp() {
        inventoryId = UUID.randomUUID();
        productId = UUID.randomUUID();

        sampleProduct = Product.builder()
                .id(productId)
                .sku("PROD-100")
                .name("Wireless Headset")
                .category("Electronics")
                .unitPrice(new BigDecimal("79.99"))
                .active(true)
                .build();

        sampleWarehouse = Warehouse.builder()
                .id(UUID.randomUUID())
                .code("WH-MAIN")
                .name("Main Logistics Center")
                .active(true)
                .build();

        sampleInventory = Inventory.builder()
                .id(inventoryId)
                .product(sampleProduct)
                .warehouseCode("WH-MAIN")
                .quantityOnHand(100)
                .quantityReserved(20)
                .reorderLevel(10)
                .build();

        sampleMovement = StockMovement.builder()
                .id(UUID.randomUUID())
                .inventory(sampleInventory)
                .type(StockMovementType.ADJUSTMENT)
                .quantity(15)
                .reason("Manual stock addition")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Test
    void recordMovement_Success() {
        when(stockMovementRepository.save(any(StockMovement.class))).thenReturn(sampleMovement);

        StockMovement result = stockMovementService.recordMovement(sampleInventory, StockMovementType.INBOUND, 50, "REF-100", "Inbound shipment");

        assertThat(result).isNotNull();
        verify(stockMovementRepository).save(any(StockMovement.class));
    }

    @Test
    void adjustStock_PositiveAdjustment_Success() {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(15)
                .reason("Count correction")
                .build();

        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));
        when(stockMovementRepository.save(any(StockMovement.class))).thenReturn(sampleMovement);

        StockMovementResponse response = stockMovementService.adjustStock(request);

        assertThat(response).isNotNull();
        assertThat(sampleInventory.getQuantityOnHand()).isEqualTo(115);
        verify(inventoryRepository).save(sampleInventory);
        verify(stockMovementRepository).save(any(StockMovement.class));
    }

    @Test
    void adjustStock_NegativeAdjustment_Success() {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(-30)
                .reason("Damaged stock removal")
                .build();

        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));
        when(stockMovementRepository.save(any(StockMovement.class))).thenReturn(sampleMovement);

        StockMovementResponse response = stockMovementService.adjustStock(request);

        assertThat(response).isNotNull();
        assertThat(sampleInventory.getQuantityOnHand()).isEqualTo(70);
        verify(inventoryRepository).save(sampleInventory);
    }

    @Test
    void adjustStock_ResultingNegativeOnHand_ThrowsInvalidInventoryException() {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(-150)
                .reason("Excess reduction")
                .build();

        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));

        assertThatThrownBy(() -> stockMovementService.adjustStock(request))
                .isInstanceOf(InvalidInventoryException.class)
                .hasMessageContaining("negative quantity on hand");

        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void adjustStock_ResultingOnHandBelowReserved_ThrowsInvalidInventoryException() {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(-85)
                .reason("Reduction below reserved")
                .build();

        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.of(sampleInventory));

        assertThatThrownBy(() -> stockMovementService.adjustStock(request))
                .isInstanceOf(InvalidInventoryException.class)
                .hasMessageContaining("dropping below reserved quantity");
    }

    @Test
    void adjustStock_NonexistentWarehouse_ThrowsResourceNotFoundException() {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-NONEXISTENT")
                .quantityAdjustment(10)
                .build();

        when(warehouseRepository.findByCode("WH-NONEXISTENT")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockMovementService.adjustStock(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Warehouse not found with code: WH-NONEXISTENT");
    }

    @Test
    void adjustStock_InactiveWarehouse_ThrowsInvalidInventoryException() {
        sampleWarehouse.setActive(false);
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(10)
                .build();

        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));

        assertThatThrownBy(() -> stockMovementService.adjustStock(request))
                .isInstanceOf(InvalidInventoryException.class)
                .hasMessageContaining("inactive warehouse");
    }

    @Test
    void adjustStock_NonexistentInventory_ThrowsResourceNotFoundException() {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(productId)
                .warehouseCode("WH-MAIN")
                .quantityAdjustment(10)
                .build();

        when(warehouseRepository.findByCode("WH-MAIN")).thenReturn(Optional.of(sampleWarehouse));
        when(inventoryRepository.findByProductIdAndWarehouseCode(productId, "WH-MAIN")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockMovementService.adjustStock(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Inventory record not found");
    }

    @Test
    void getStockMovements_Success() {
        when(stockMovementRepository.findByInventoryId(inventoryId)).thenReturn(List.of(sampleMovement));

        List<StockMovementResponse> results = stockMovementService.getStockMovements(inventoryId, null, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getInventoryId()).isEqualTo(inventoryId);
    }
}
