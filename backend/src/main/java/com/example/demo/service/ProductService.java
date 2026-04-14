package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // GET all products
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    // ADD product
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    // UPDATE product
    public Product updateProduct(int id, Product product) {
        product.setId(id);
        return productRepository.save(product);
    }

    // GET product by ID
    public Product getProductById(int id) {
        Optional<Product> product =
                productRepository.findById(id);
        return product.orElse(null);
    }

    // DELETE product
    public boolean deleteProduct(int id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}