package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getProducts() {
        return productRepository.getProducts();
    }

    public Product addProduct(Product product) {
        return productRepository.addProduct(product);
    }
    public Product updateProduct(int id, Product product) {
        return productRepository.updateProduct(id, product);
    }
    public Product getProductById(int id) {
        return productRepository.getProductById(id);
    }
    public boolean deleteProduct(int id) {
        return productRepository.deleteProduct(id);
    }
}