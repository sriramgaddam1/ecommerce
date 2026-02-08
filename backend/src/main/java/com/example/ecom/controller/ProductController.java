package com.example.ecom.controller;

import com.example.ecom.model.Product;
import com.example.ecom.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/api")


public class ProductController {




 @Autowired
    private ProductService service;
    
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<Product> products = service.getAllProducts();
        
        // Convert to DTO without image data
        List<ProductDTO> productDTOs = products.stream()
            .map(p -> new ProductDTO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getBrand(),
                p.getPrice(),
                p.getCategory(),
                p.getStockQuantity(),
                p.getImageType(),
                p.isAvailable()
            ))
            .collect(Collectors.toList());
        
        return new ResponseEntity<>(productDTOs, HttpStatus.OK);
    }
    
    // Keep other endpoints as they are
    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id) {
        Product product = service.getProduct(id);
        if (product != null) {
            return new ResponseEntity<>(product, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId) {
        Product product = service.getProduct(productId);
        if (product == null || product.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] imageFile = product.getImageData();
        return ResponseEntity.ok()
            .contentType(MediaType.valueOf(product.getImageType()))
            .body(imageFile);
    }
    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(
            @PathVariable int id,
            @RequestPart("product") Product product,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        try {
            Product updated = service.updateProduct(id, product, imageFile);

            if (updated != null) {
                return ResponseEntity.ok("updated");
            } else {
                return ResponseEntity.badRequest().body("Failed to update");
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to update");
        }
    }



        @DeleteMapping("/product/{id}")
        public ResponseEntity<String> deleteProduct(@PathVariable int id) {
            Product product = service.getProduct(id);
            if (product != null) {
                service.deleteProduct(id);
                return new ResponseEntity<>("Deleted", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
            }

        }

        @GetMapping("/products/search")
        public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {

            List<Product> products = service.searchProducts(keyword);
            System.out.println("searching with " + keyword);
            return new ResponseEntity<>(products, HttpStatus.OK);
        }

    }
