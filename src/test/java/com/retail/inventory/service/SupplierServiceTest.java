package com.retail.inventory.service;

import com.retail.inventory.dto.CreateSupplierRequest;
import com.retail.inventory.dto.SupplierResponse;
import com.retail.inventory.dto.UpdateSupplierRequest;
import com.retail.inventory.entity.Supplier;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.SupplierRepository;
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
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierService supplierService;

    private UUID supplierId;
    private Supplier sampleSupplier;

    @BeforeEach
    void setUp() {
        supplierId = UUID.randomUUID();
        sampleSupplier = Supplier.builder()
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
    void createSupplier_Success() {
        CreateSupplierRequest request = CreateSupplierRequest.builder()
                .code("SUP-GLOBAL-1")
                .name("Global Tech Supplies")
                .contactName("John Doe")
                .email("contact@globaltech.com")
                .phone("+1-555-0199")
                .address("100 Tech Way, San Jose, CA")
                .active(true)
                .build();

        when(supplierRepository.existsByCode("SUP-GLOBAL-1")).thenReturn(false);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(sampleSupplier);

        SupplierResponse response = supplierService.createSupplier(request);

        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("SUP-GLOBAL-1");
        assertThat(response.getName()).isEqualTo("Global Tech Supplies");
        verify(supplierRepository).save(any(Supplier.class));
    }

    @Test
    void createSupplier_DuplicateCode_ThrowsResourceAlreadyExistsException() {
        CreateSupplierRequest request = CreateSupplierRequest.builder()
                .code("SUP-GLOBAL-1")
                .name("Global Tech Supplies")
                .build();

        when(supplierRepository.existsByCode("SUP-GLOBAL-1")).thenReturn(true);

        assertThatThrownBy(() -> supplierService.createSupplier(request))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessageContaining("Supplier with code 'SUP-GLOBAL-1' already exists");

        verify(supplierRepository, never()).save(any(Supplier.class));
    }

    @Test
    void getSupplierById_Success() {
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(sampleSupplier));

        SupplierResponse response = supplierService.getSupplierById(supplierId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(supplierId);
        assertThat(response.getCode()).isEqualTo("SUP-GLOBAL-1");
    }

    @Test
    void getSupplierById_NotFound_ThrowsResourceNotFoundException() {
        UUID nonExistentId = UUID.randomUUID();
        when(supplierRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> supplierService.getSupplierById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Supplier not found with ID: " + nonExistentId);
    }

    @Test
    void getSupplierByCode_Success() {
        when(supplierRepository.findByCode("SUP-GLOBAL-1")).thenReturn(Optional.of(sampleSupplier));

        SupplierResponse response = supplierService.getSupplierByCode("SUP-GLOBAL-1");

        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("SUP-GLOBAL-1");
    }

    @Test
    void getAllSuppliers_Success() {
        when(supplierRepository.findAll()).thenReturn(List.of(sampleSupplier));

        List<SupplierResponse> suppliers = supplierService.getAllSuppliers();

        assertThat(suppliers).hasSize(1);
        assertThat(suppliers.get(0).getCode()).isEqualTo("SUP-GLOBAL-1");
    }

    @Test
    void updateSupplier_Success() {
        UpdateSupplierRequest updateRequest = UpdateSupplierRequest.builder()
                .code("SUP-GLOBAL-1-UPDATED")
                .name("Global Tech Supplies Inc.")
                .contactName("Jane Doe")
                .email("jane@globaltech.com")
                .phone("+1-555-0200")
                .address("200 New Tech Way, San Jose, CA")
                .active(true)
                .build();

        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(sampleSupplier));
        when(supplierRepository.existsByCodeAndIdNot("SUP-GLOBAL-1-UPDATED", supplierId)).thenReturn(false);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(sampleSupplier);

        SupplierResponse response = supplierService.updateSupplier(supplierId, updateRequest);

        assertThat(response).isNotNull();
        verify(supplierRepository).save(sampleSupplier);
    }

    @Test
    void deleteSupplier_Success() {
        when(supplierRepository.existsById(supplierId)).thenReturn(true);

        supplierService.deleteSupplier(supplierId);

        verify(supplierRepository).deleteById(supplierId);
    }
}
