package com.retail.inventory.repository;

import com.retail.inventory.entity.Order;
import com.retail.inventory.entity.OrderStatus;
import com.retail.inventory.entity.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    boolean existsByOrderNumber(String orderNumber);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByType(OrderType type);

    List<Order> findByStatusAndType(OrderStatus status, OrderType type);
}
