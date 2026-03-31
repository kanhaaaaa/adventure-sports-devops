package com.example.demo.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.model.Product;

@Repository
public class ProductRepository {

    private List<Product> products = new ArrayList<>();

    public List<Product> getProducts() {
        return products;
    }

    public Product addProduct(Product product) {
        products.add(product);
        return product;
    }
    public Product updateProduct(int id, Product updatedProduct) {
    for (int i = 0; i < products.size(); i++) {
        if (products.get(i).getId() == id) {
            products.set(i, updatedProduct);
            return updatedProduct;
        }
    }
    return null;
    }
    public Product getProductById(int id) {
    for (Product product : products) {
        if (product.getId() == id) {
            return product;
        }
    }
    return null;
    }
    public boolean deleteProduct(int id) {
        return products.removeIf(product -> product.getId() == id);
    }
}