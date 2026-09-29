package com.retail.inventory.service;

import com.retail.inventory.dto.CreateWarehouseRequest;
import com.retail.inventory.dto.UpdateWarehouseRequest;
import com.retail.inventory.dto.WarehouseResponse;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.WarehouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class WarehouseServiceTest {

    @Mock
    private WarehouseRepository warehouseRepository;

    @InjectMocks
    private WarehouseService warehouseService;

    private UUID warehouseId;
    private Warehouse sampleWarehouse;

    @BeforeEach
    void setUp() {
        warehouseId = UUID.randomUUID();
        sampleWarehouse = Warehouse.builder()
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
    void createWarehouse_Success() {
        CreateWarehouseRequest request = CreateWarehouseRequest.builder()
                .code("WH-NORTH-1")
                .name("North Distribution Center")
                .location("Seattle, WA")
                .capacity(50000)
                .active(true)
                .build();

        when(warehouseRepository.existsByCode("WH-NORTH-1")).thenReturn(false);
        when(warehouseRepository.save(any(Warehouse.class))).thenReturn(sampleWarehouse);

        WarehouseResponse response = warehouseService.createWarehouse(request);

        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("WH-NORTH-1");
        assertThat(response.getName()).isEqualTo("North Distribution Center");
        verify(warehouseRepository).save(any(Warehouse.class));
    }

    @Test
    void createWarehouse_DuplicateCode_ThrowsResourceAlreadyExistsException() {
        CreateWarehouseRequest request = CreateWarehouseRequest.builder()
                .code("WH-NORTH-1")
                .name("North Distribution Center")
                .capacity(50000)
                .build();

        when(warehouseRepository.existsByCode("WH-NORTH-1")).thenReturn(true);

        assertThatThrownBy(() -> warehouseService.createWarehouse(request))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessageContaining("Warehouse with code 'WH-NORTH-1' already exists");

        verify(warehouseRepository, never()).save(any(Warehouse.class));
    }

    @Test
    void getWarehouseById_Success() {
        when(warehouseRepository.findById(warehouseId)).thenReturn(Optional.of(sampleWarehouse));

        WarehouseResponse response = warehouseService.getWarehouseById(warehouseId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(warehouseId);
        assertThat(response.getCode()).isEqualTo("WH-NORTH-1");
    }

    @Test
    void getWarehouseById_NotFound_ThrowsResourceNotFoundException() {
        UUID nonExistentId = UUID.randomUUID();
        when(warehouseRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> warehouseService.getWarehouseById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Warehouse not found with ID: " + nonExistentId);
    }

    @Test
    void getWarehouseByCode_Success() {
        when(warehouseRepository.findByCode("WH-NORTH-1")).thenReturn(Optional.of(sampleWarehouse));

        WarehouseResponse response = warehouseService.getWarehouseByCode("WH-NORTH-1");

        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("WH-NORTH-1");
    }

    @Test
    void getAllWarehouses_Success() {
        when(warehouseRepository.findAll()).thenReturn(List.of(sampleWarehouse));

        List<WarehouseResponse> warehouses = warehouseService.getAllWarehouses();

        assertThat(warehouses).hasSize(1);
        assertThat(warehouses.get(0).getCode()).isEqualTo("WH-NORTH-1");
    }

    @Test
    void updateWarehouse_Success() {
        UpdateWarehouseRequest updateRequest = UpdateWarehouseRequest.builder()
                .code("WH-NORTH-1-UPDATED")
                .name("Updated North DC")
                .location("Tacoma, WA")
                .capacity(60000)
                .active(true)
                .build();

        when(warehouseRepository.findById(warehouseId)).thenReturn(Optional.of(sampleWarehouse));
        when(warehouseRepository.existsByCodeAndIdNot("WH-NORTH-1-UPDATED", warehouseId)).thenReturn(false);
        when(warehouseRepository.save(any(Warehouse.class))).thenReturn(sampleWarehouse);

        WarehouseResponse response = warehouseService.updateWarehouse(warehouseId, updateRequest);

        assertThat(response).isNotNull();
        verify(warehouseRepository).save(sampleWarehouse);
    }

    @Test
    void deleteWarehouse_Success() {
        when(warehouseRepository.existsById(warehouseId)).thenReturn(true);

        warehouseService.deleteWarehouse(warehouseId);

        verify(warehouseRepository).deleteById(warehouseId);
    }
}
