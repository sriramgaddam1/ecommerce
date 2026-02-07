package com.example.ecom.controller;

import com.example.ecom.dto.OrderItemRequest;
import com.example.ecom.dto.OrderRequest;
import com.example.ecom.model.Order;
import com.example.ecom.model.OrderItem;
import com.example.ecom.repository.OrderRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
 
@RestController
@RequestMapping("/api/auth/user")
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
@GetMapping("/{userId}/orders")
public ResponseEntity<List<Order>> getOrders(@PathVariable Long userId) {
    return ResponseEntity.ok(
            orderRepository.findByUserId(userId)
    );
}

    @PostMapping("/{userId}/orders")
    public ResponseEntity<Order> createOrder(
            @PathVariable Long userId,
            @RequestBody OrderRequest request
    ) {

        Order order = new Order();
        order.setUserId(userId);
        order.setTotalPrice(request.getTotalPrice());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setAddressJson(request.getAddressJson());
        order.setOrderNumber("ORD-" + UUID.randomUUID());

        // ✅ IMPORTANT: map items correctly
        for (OrderItemRequest itemReq : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(itemReq.getProductId());   
            item.setName(itemReq.getName());
            item.setPrice(itemReq.getPrice());
            item.setQuantity(itemReq.getQuantity());

            order.addItem(item); // 🔥 sets BOTH sides
        }

        Order savedOrder = orderRepository.save(order); // 🔥 ACTUAL SAVE

        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/{userId}/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long userId,
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(
                orderRepository.findByIdAndUserId(orderId, userId)
                        .orElseThrow(() -> new RuntimeException("Order not found"))
        );
    }

    @PutMapping("/{userId}/orders/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long userId,
            @PathVariable Long orderId
    ) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if ("Cancelled".equals(order.getStatus())) {
            throw new RuntimeException("Order is already cancelled");
        }
        
        order.setStatus("Cancelled");
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }
}
