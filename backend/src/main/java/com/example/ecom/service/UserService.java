package com.example.ecom.service;
import java.util.List;
import java.util.stream.Collectors;

import com.example.ecom.model.Order;
import com.example.ecom.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.ecom.dto.AddressRequest;
import com.example.ecom.dto.AddressResponse;
import com.example.ecom.dto.AdminUserListResponse;
import com.example.ecom.dto.LoginResponse;
import com.example.ecom.dto.PaymentMethodRequest;
import com.example.ecom.dto.PaymentMethodResponse;
import com.example.ecom.dto.RegisterRequest;
import com.example.ecom.dto.UpdateUserRequest;
import com.example.ecom.dto.UserProfileResponse;
import com.example.ecom.model.Address;
import com.example.ecom.model.PaymentMethod;
import com.example.ecom.model.User;
import com.example.ecom.repository.AddressRepository;
import com.example.ecom.repository.PaymentMethodRepository;
import com.example.ecom.repository.UserRepository;
import com.example.ecom.security.JwtUtil;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public byte[] getUserProfilePhoto(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getProfilePhoto();
    }
    public byte[] getUserPhoto(Long userId) {
        return getUserProfilePhoto(userId);
    }





    /**
     * Register a new user
     */
    public String registerUser(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Check if phone number already exists (if provided)
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new RuntimeException("Phone number already registered");
            }
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setFullName(request.getUsername());

        // Save user to database
        userRepository.save(user);

        return "User registered successfully";
    }

// USER LIST

public List<AdminUserListResponse> getAllUsersForAdmin() {

    List<User> users = userRepository.findAll();

    return users.stream()
            .map(user -> new AdminUserListResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole(),
                    true, // or user.isEnabled() if you add the field
                    user.getProfilePhoto() != null
            ))
              .collect(Collectors.toList());
              
}

    /**
     * Authenticate user and generate JWT token
     */
    public LoginResponse authenticateUser(String username, String password) {
        // Find user by username, email or phone number
        User user = userRepository.findByUsername(username)
            .orElseGet(() -> userRepository.findByEmail(username)
                .orElseGet(() -> userRepository.findByPhoneNumber(username)
                    .orElseThrow(() -> new RuntimeException("User not found"))));

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());

        // Return login response with user details
        return new LoginResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getId()
        );
    }

    /**
     * Get user by username
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get user by ID
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get user profile with photo as base64
     */
    public UserProfileResponse getUserProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id: " + userId)
                );

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getDateOfBirth(),
                null   // ❌ DO NOT send photo here
        );
    }





    /**
     * Update user profile details
     */
    public UserProfileResponse updateUserProfile(Long userId, UpdateUserRequest request) {
        User user = getUserById(userId);

        // Check if new username already exists (and it's not the same user)
        if (!user.getUsername().equals(request.getUsername()) 
                && userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());

        userRepository.save(user);

        return getUserProfile(userId);
    }

    /**
     * Upload/Update profile photo
     */
    public UserProfileResponse updateProfilePhoto(Long userId, byte[] photoData) {
        User user = getUserById(userId);
        user.setProfilePhoto(photoData);
        userRepository.save(user);

        return getUserProfile(userId);
    }

    // ==================== ADDRESS MANAGEMENT ====================

    /**
     * Add new address
     */
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = getUserById(userId);

        // If marking as default, unset other defaults
        if (request.isDefault()) {
            Address currentDefault = addressRepository.findByUserIdAndIsDefaultTrue(userId);
            if (currentDefault != null) {
                currentDefault.setDefault(false);
                addressRepository.save(currentDefault);
            }
        }

        Address address = new Address();
        address.setUser(user);
        address.setLabel(request.getLabel());
        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        address.setDefault(request.isDefault());

        addressRepository.save(address);

        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getFullName(),
                address.getPhoneNumber(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getCountry(),
                address.isDefault()
        );
    }

    /**
     * Get all addresses for user
     */
    public List<AddressResponse> getAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        return addresses.stream()
                .map(addr -> new AddressResponse(
                        addr.getId(),
                        addr.getLabel(),
                        addr.getFullName(),
                        addr.getPhoneNumber(),
                        addr.getStreet(),
                        addr.getCity(),
                        addr.getState(),
                        addr.getZipCode(),
                        addr.getCountry(),
                        addr.isDefault()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Update address
     */
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Verify address belongs to user
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this address");
        }

        // If marking as default, unset other defaults
        if (request.isDefault() && !address.isDefault()) {
            Address currentDefault = addressRepository.findByUserIdAndIsDefaultTrue(userId);
            if (currentDefault != null) {
                currentDefault.setDefault(false);
                addressRepository.save(currentDefault);
            }
        }

        address.setLabel(request.getLabel());
        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        address.setDefault(request.isDefault());

        addressRepository.save(address);

        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getFullName(),
                address.getPhoneNumber(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getCountry(),
                address.isDefault()
        );
    }

    /**
     * Delete address
     */
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Verify address belongs to user
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this address");
        }

        addressRepository.delete(address);
    }

    /**
     * Set address as default
     */
    public AddressResponse setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Verify address belongs to user
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this address");
        }

        // Unset other defaults
        Address currentDefault = addressRepository.findByUserIdAndIsDefaultTrue(userId);
        if (currentDefault != null && !currentDefault.getId().equals(addressId)) {
            currentDefault.setDefault(false);
            addressRepository.save(currentDefault);
        }

        address.setDefault(true);
        addressRepository.save(address);

        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getFullName(),
                address.getPhoneNumber(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getCountry(),
                address.isDefault()
        );
    }

    // ==================== PAYMENT METHOD MANAGEMENT ====================

    /**
     * Add new payment method
     */
    public PaymentMethodResponse addPaymentMethod(Long userId, PaymentMethodRequest request) {
        User user = getUserById(userId);

        // Validate card number format (basic validation)
        if (request.getCardNumber().length() < 13 || request.getCardNumber().length() > 19) {
            throw new RuntimeException("Invalid card number");
        }

        // If marking as default, unset other defaults
        if (request.isDefault()) {
            PaymentMethod currentDefault = paymentMethodRepository.findByUserIdAndIsDefaultTrue(userId);
            if (currentDefault != null) {
                currentDefault.setDefault(false);
                paymentMethodRepository.save(currentDefault);
            }
        }

        // Store only last 4 digits for security
        String lastFour = request.getCardNumber().substring(request.getCardNumber().length() - 4);

        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setUser(user);
        paymentMethod.setCardholderName(request.getCardholderName());
        paymentMethod.setCardNumber(lastFour);
        paymentMethod.setCardType(request.getCardType());
        paymentMethod.setExpiryMonth(request.getExpiryMonth());
        paymentMethod.setExpiryYear(request.getExpiryYear());
        paymentMethod.setDefault(request.isDefault());

        paymentMethodRepository.save(paymentMethod);

        return new PaymentMethodResponse(
                paymentMethod.getId(),
                paymentMethod.getCardholderName(),
                paymentMethod.getCardNumber(),
                paymentMethod.getCardType(),
                paymentMethod.getExpiryMonth(),
                paymentMethod.getExpiryYear(),
                paymentMethod.isDefault()
        );
    }

    /**
     * Get all payment methods for user
     */
    public List<PaymentMethodResponse> getPaymentMethods(Long userId) {
        List<PaymentMethod> methods = paymentMethodRepository.findByUserId(userId);
        return methods.stream()
                .map(method -> new PaymentMethodResponse(
                        method.getId(),
                        method.getCardholderName(),
                        method.getCardNumber(),
                        method.getCardType(),
                        method.getExpiryMonth(),
                        method.getExpiryYear(),
                        method.isDefault()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Delete payment method
     */
    public void deletePaymentMethod(Long userId, Long paymentMethodId) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        // Verify payment method belongs to user
        if (!paymentMethod.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this payment method");
        }

        paymentMethodRepository.delete(paymentMethod);
    }

    /**
     * Set payment method as default
     */
    public PaymentMethodResponse setDefaultPaymentMethod(Long userId, Long paymentMethodId) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        // Verify payment method belongs to user
        if (!paymentMethod.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this payment method");
        }

        // Unset other defaults
        PaymentMethod currentDefault = paymentMethodRepository.findByUserIdAndIsDefaultTrue(userId);
        if (currentDefault != null && !currentDefault.getId().equals(paymentMethodId)) {
            currentDefault.setDefault(false);
            paymentMethodRepository.save(currentDefault);
        }

        paymentMethod.setDefault(true);
        paymentMethodRepository.save(paymentMethod);

        return new PaymentMethodResponse(
                paymentMethod.getId(),
                paymentMethod.getCardholderName(),
                paymentMethod.getCardNumber(),
                paymentMethod.getCardType(),
                paymentMethod.getExpiryMonth(),
                paymentMethod.getExpiryYear(),
                paymentMethod.isDefault()
        );
    }



    public List<Order> getOrdersByUserId(Long userId) {
       return  orderRepository.findByUserId(userId);

    }
}
