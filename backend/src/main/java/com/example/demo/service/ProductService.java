package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Product;

@Service
public class ProductService {

    private final List<Product> products = new ArrayList<>();

    public ProductService() {
        products.add(new Product(1, "Trekking Bag", "Bags", 2999, "Waterproof hiking bag"));
        products.add(new Product(2, "Climbing Rope", "Climbing", 1499, "Strong safety rope"));
    }

    public List<Product> getProducts() {
        return products;
    }

    public Product addProduct(Product product) {
        products.add(product);
        return product;
    }
}