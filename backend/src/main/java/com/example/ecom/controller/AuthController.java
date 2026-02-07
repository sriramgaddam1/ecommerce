package com.example.ecom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.ecom.dto.AddressRequest;
import com.example.ecom.dto.LoginRequest;
import com.example.ecom.dto.LoginResponse;
import com.example.ecom.dto.PaymentMethodRequest;
import com.example.ecom.dto.RegisterRequest;
import com.example.ecom.dto.UpdateUserRequest;
import com.example.ecom.dto.UserProfileResponse;
import com.example.ecom.service.UserService;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "true") 
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            String message = userService.registerUser(request);
            return ResponseEntity.ok().body(new ApiResponse(true, message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Login user and get JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.authenticateUser(
                    request.getUsername(),
                    request.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Get user profile by ID
     */
    @GetMapping("/user/{userId}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            UserProfileResponse profile = userService.getUserProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Update user profile
     */
    @PutMapping("/user/{userId}/profile")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody UpdateUserRequest request) {
        try {
            UserProfileResponse response = userService.updateUserProfile(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Upload profile photo
     */
    @PostMapping("/user/{userId}/upload-photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "File is empty"));
            }

            // Limit file size to 5MB
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "File size exceeds 5MB limit"));
            }

            byte[] photoData = file.getBytes();
            UserProfileResponse response = userService.updateProfilePhoto(userId, photoData);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Failed to read file"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // ==================== ADDRESS ENDPOINTS ====================

    /**
     * Get all addresses for user
     */
    @GetMapping("/user/{userId}/addresses")
    public ResponseEntity<?> getAddresses(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(userService.getAddresses(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Add new address
     */
    @PostMapping("/user/{userId}/address")
    public ResponseEntity<?> addAddress(@PathVariable Long userId, @RequestBody AddressRequest request) {
        try {
            return ResponseEntity.ok(userService.addAddress(userId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Update address
     */
    @PutMapping("/user/{userId}/address/{addressId}")
    public ResponseEntity<?> updateAddress(@PathVariable Long userId, @PathVariable Long addressId, @RequestBody AddressRequest request) {
        try {
            return ResponseEntity.ok(userService.updateAddress(userId, addressId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Delete address
     */
    @DeleteMapping("/user/{userId}/address/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        try {
            userService.deleteAddress(userId, addressId);
            return ResponseEntity.ok(new ApiResponse(true, "Address deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Set address as default
     */
    @PutMapping("/user/{userId}/address/{addressId}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        try {
            return ResponseEntity.ok(userService.setDefaultAddress(userId, addressId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // ==================== PAYMENT METHOD ENDPOINTS ====================

    /**
     * Get all payment methods for user
     */
    @GetMapping("/user/{userId}/payment-methods")
    public ResponseEntity<?> getPaymentMethods(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(userService.getPaymentMethods(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Add new payment method
     */
    @PostMapping("/user/{userId}/payment-method")
    public ResponseEntity<?> addPaymentMethod(@PathVariable Long userId, @RequestBody PaymentMethodRequest request) {
        try {
            return ResponseEntity.ok(userService.addPaymentMethod(userId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Delete payment method
     */
    @DeleteMapping("/user/{userId}/payment-method/{paymentMethodId}")
    public ResponseEntity<?> deletePaymentMethod(@PathVariable Long userId, @PathVariable Long paymentMethodId) {
        try {
            userService.deletePaymentMethod(userId, paymentMethodId);
            return ResponseEntity.ok(new ApiResponse(true, "Payment method deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Set payment method as default
     */
    @PutMapping("/user/{userId}/payment-method/{paymentMethodId}/default")
    public ResponseEntity<?> setDefaultPaymentMethod(@PathVariable Long userId, @PathVariable Long paymentMethodId) {
        try {
            return ResponseEntity.ok(userService.setDefaultPaymentMethod(userId, paymentMethodId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Simple API Response class
     */
    static class ApiResponse {
        private boolean success;
        private String message;

        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
    @GetMapping("/user/{id}/photo")
    public ResponseEntity<byte[]> getUserPhoto(@PathVariable Long id) {

        byte[] photo = userService.getUserProfilePhoto(id);


        if (photo == null || photo.length == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // or IMAGE_PNG
                .body(photo);
    }


}
