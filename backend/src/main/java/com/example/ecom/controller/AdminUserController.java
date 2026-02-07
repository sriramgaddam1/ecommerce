package com.example.ecom.controller;


import java.util.List;

import com.example.ecom.model.Order;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecom.dto.AdminUserListResponse;
import com.example.ecom.dto.UserProfileResponse;
import com.example.ecom.service.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "true") 
public class AdminUserController {

    @Autowired
    private UserService userService;

    /**
     * =========================
     * GET ALL USERS (ADMIN)
     * =========================
     * Lightweight list
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserListResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersForAdmin());
    }
    @GetMapping("/user/{userId}/orders")
    public ResponseEntity<List<Order>> getOrdersByUserId(
            @PathVariable Long userId) {

        List<Order> orders = userService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }
    /**
     * ==================================
     * GET USER PROFILE (ADMIN)
     * ==================================
     * Full profile info + Base64 photo
     */
    @GetMapping("/user/{id}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable Long id) {

        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    /**
     * ==================================
     * GET USER PROFILE PHOTO ONLY (ADMIN)
     * ==================================
     * OPTIONAL – keep if already used
     */
    @GetMapping("/user/{id}/photo")
    public ResponseEntity<byte[]> getUserProfilePhoto(
            @PathVariable Long id) {

        byte[] photo = userService.getUserProfilePhoto(id);

        if (photo == null || photo.length == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .body(photo);
    }
}
