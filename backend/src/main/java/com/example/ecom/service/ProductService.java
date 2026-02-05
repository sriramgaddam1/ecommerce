package com.example.ecom.service;


import com.example.ecom.model.Product;
import com.example.ecom.repository.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Product getProduct(int id) {
        return repo.findById(id).orElse(null);
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());

        return repo.save(product);
    }

    public Product updateProduct(int id, Product updatedProduct, MultipartFile imageFile)
            throws IOException {

        Product existing = repo.findById(id).orElse(null);

        if (existing == null) return null;

        // Update normal fields
        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setBrand(updatedProduct.getBrand());
        existing.setPrice(updatedProduct.getPrice());
        existing.setCategory(updatedProduct.getCategory());
        existing.setReleaseDate(updatedProduct.getReleaseDate());
        existing.setProductAvailable(updatedProduct.isProductAvailable());
        existing.setStockQuantity(updatedProduct.getStockQuantity());

        // ✅ IMAGE UPDATE ONLY IF NEW IMAGE IS SENT
        if (imageFile != null && !imageFile.isEmpty()) {
            existing.setImageData(imageFile.getBytes());
            existing.setImageName(imageFile.getOriginalFilename());
            existing.setImageType(imageFile.getContentType());
        }

        return repo.save(existing);
    }


    public void deleteProduct(int id) {
        repo.deleteById(id);
    }


    public List<Product> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }
}