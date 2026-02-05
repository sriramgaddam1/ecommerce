package com.example.ecom.repository;
import java.util.List;
import java.util.Optional;
import com.example.ecom.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;


public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
}
