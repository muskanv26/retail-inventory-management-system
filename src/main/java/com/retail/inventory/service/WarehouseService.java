package com.retail.inventory.service;

import com.retail.inventory.dto.CreateWarehouseRequest;
import com.retail.inventory.dto.UpdateWarehouseRequest;
import com.retail.inventory.dto.WarehouseResponse;
import com.retail.inventory.entity.Warehouse;
import com.retail.inventory.exception.ResourceAlreadyExistsException;
import com.retail.inventory.exception.ResourceNotFoundException;
import com.retail.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Transactional
    public WarehouseResponse createWarehouse(CreateWarehouseRequest request) {
        String formattedCode = request.getCode().trim().toUpperCase();

        if (warehouseRepository.existsByCode(formattedCode)) {
            throw new ResourceAlreadyExistsException("Warehouse with code '" + formattedCode + "' already exists");
        }

        Warehouse warehouse = Warehouse.builder()
                .code(formattedCode)
                .name(request.getName().trim())
                .location(request.getLocation() != null ? request.getLocation().trim() : null)
                .capacity(request.getCapacity())
                .active(request.isActive())
                .build();

        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        return mapToWarehouseResponse(savedWarehouse);
    }

    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseRepository.findAll()
                .stream()
                .map(this::mapToWarehouseResponse)
                .toList();
    }

    public WarehouseResponse getWarehouseById(UUID id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
        return mapToWarehouseResponse(warehouse);
    }

    public WarehouseResponse getWarehouseByCode(String code) {
        String formattedCode = code.trim().toUpperCase();
        Warehouse warehouse = warehouseRepository.findByCode(formattedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with code: " + formattedCode));
        return mapToWarehouseResponse(warehouse);
    }

    @Transactional
    public WarehouseResponse updateWarehouse(UUID id, UpdateWarehouseRequest request) {
        Warehouse existingWarehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        String formattedCode = request.getCode().trim().toUpperCase();
        if (warehouseRepository.existsByCodeAndIdNot(formattedCode, id)) {
            throw new ResourceAlreadyExistsException("Warehouse with code '" + formattedCode + "' already exists");
        }

        existingWarehouse.setCode(formattedCode);
        existingWarehouse.setName(request.getName().trim());
        existingWarehouse.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        existingWarehouse.setCapacity(request.getCapacity());
        existingWarehouse.setActive(request.isActive());

        Warehouse updatedWarehouse = warehouseRepository.save(existingWarehouse);
        return mapToWarehouseResponse(updatedWarehouse);
    }

    @Transactional
    public void deleteWarehouse(UUID id) {
        if (!warehouseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse not found with ID: " + id);
        }
        warehouseRepository.deleteById(id);
    }

    private WarehouseResponse mapToWarehouseResponse(Warehouse warehouse) {
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .code(warehouse.getCode())
                .name(warehouse.getName())
                .location(warehouse.getLocation())
                .capacity(warehouse.getCapacity())
                .active(warehouse.isActive())
                .createdAt(warehouse.getCreatedAt())
                .updatedAt(warehouse.getUpdatedAt())
                .build();
    }
}
