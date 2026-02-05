package com.example.ecom.controller;

import com.example.ecom.dto.OrderUpdateRequest;
import com.example.ecom.model.Order;
import com.example.ecom.repository.OrderRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin
public class AdminOrderController {

    private final OrderRepository orderRepository;

    public AdminOrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * =========================
     * GET ORDER DETAILS (ADMIN)
     * =========================
     * URL: /api/admin/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found with id: " + id)
                );

        return ResponseEntity.ok(order);
    }

    /**
     * =========================
     * UPDATE ORDER (ADMIN)
     * =========================
     */
    @PutMapping("/{orderId}")
    public ResponseEntity<Order> updateOrder(
            @PathVariable Long orderId,
            @RequestBody OrderUpdateRequest request
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found with id: " + orderId)
                );

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        if (request.getDeliveryDate() != null) {
            order.setDeliveryDate(request.getDeliveryDate());
        }

        return ResponseEntity.ok(orderRepository.save(order));
    }
}
