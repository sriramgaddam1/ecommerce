package com.example.ecom.dto;

import java.math.BigDecimal;

public class ProductDTO {
    private int id;
    private String name;
    private String description;
    private String brand;
    private BigDecimal price;
    private String category;
    private int stockQuantity;
    private String imageType;
    private boolean available;
    // Don't include imageData here - too heavy for list view
    
    // Constructors
    public ProductDTO() {}
    
    public ProductDTO(int id, String name, String description, String brand, 
                      BigDecimal price, String category, int stockQuantity, 
                      String imageType, boolean available) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.brand = brand;
        this.price = price;
        this.category = category;
        this.stockQuantity = stockQuantity;
        this.imageType = imageType;
        this.available = available;
    }
    
    // Getters and Setters
    // ... generate all getters and setters
}
