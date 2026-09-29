package com.retail.inventory.service;

import com.retail.inventory.dto.CreateSupplierRequest;
import com.retail.inventory.dto.SupplierResponse;
import com.retail.inventory.dto.UpdateSupplierRequest;
import com.retail.inventory.entity.Supplier;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional
    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        String formattedCode = request.getCode().trim().toUpperCase();

        if (supplierRepository.existsByCode(formattedCode)) {
            throw new ResourceAlreadyExistsException("Supplier with code '" + formattedCode + "' already exists");
        }

        Supplier supplier = Supplier.builder()
                .code(formattedCode)
                .name(request.getName().trim())
                .contactName(request.getContactName() != null ? request.getContactName().trim() : null)
                .email(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .active(request.isActive())
                .build();

        Supplier savedSupplier = supplierRepository.save(supplier);
        return mapToSupplierResponse(savedSupplier);
    }

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll()
                .stream()
                .map(this::mapToSupplierResponse)
                .toList();
    }

    public SupplierResponse getSupplierById(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        return mapToSupplierResponse(supplier);
    }

    public SupplierResponse getSupplierByCode(String code) {
        String formattedCode = code.trim().toUpperCase();
        Supplier supplier = supplierRepository.findByCode(formattedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with code: " + formattedCode));
        return mapToSupplierResponse(supplier);
    }

    @Transactional
    public SupplierResponse updateSupplier(UUID id, UpdateSupplierRequest request) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));

        String formattedCode = request.getCode().trim().toUpperCase();
        if (supplierRepository.existsByCodeAndIdNot(formattedCode, id)) {
            throw new ResourceAlreadyExistsException("Supplier with code '" + formattedCode + "' already exists");
        }

        existingSupplier.setCode(formattedCode);
        existingSupplier.setName(request.getName().trim());
        existingSupplier.setContactName(request.getContactName() != null ? request.getContactName().trim() : null);
        existingSupplier.setEmail(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null);
        existingSupplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        existingSupplier.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        existingSupplier.setActive(request.isActive());

        Supplier updatedSupplier = supplierRepository.save(existingSupplier);
        return mapToSupplierResponse(updatedSupplier);
    }

    @Transactional
    public void deleteSupplier(UUID id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with ID: " + id);
        }
        supplierRepository.deleteById(id);
    }

    private SupplierResponse mapToSupplierResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .code(supplier.getCode())
                .name(supplier.getName())
                .contactName(supplier.getContactName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .active(supplier.isActive())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
