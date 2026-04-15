package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;

@Configuration
@org.springframework.context.annotation.Profile("!test")
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ProductRepository repository) {
        return args -> {

            if (repository.count() == 0) {

                repository.save(new Product(
                        "Climbing Helmet",
                        "Climbing",
                        1500,
                        "Safety helmet for rock climbing"));

                repository.save(new Product(
                        "Dynamic Rope 60m",
                        "Climbing",
                        3200,
                        "Durable dynamic climbing rope"));

                repository.save(new Product(
                        "Hiking Backpack 45L",
                        "Hiking",
                        2800,
                        "Comfortable backpack for long hikes"));

                repository.save(new Product(
                        "Camping Tent 4-Person",
                        "Camping",
                        4500,
                        "Waterproof tent for outdoor camping"));

                repository.save(new Product(
                        "Sleeping Bag -10C",
                        "Camping",
                        2200,
                        "Thermal sleeping bag for cold weather"));

                repository.save(new Product(
                        "Headlamp LED",
                        "Accessories",
                        650,
                        "Rechargeable headlamp for night trekking"));

                repository.save(new Product(
                        "Water Bottle 1L",
                        "Accessories",
                        350,
                        "Insulated stainless steel bottle"));

                repository.save(new Product(
                        "First Aid Kit",
                        "Safety",
                        900,
                        "Compact emergency medical kit"));

                repository.save(new Product(
                        "Life Jacket",
                        "Water Sports",
                        2100,
                        "Safety life jacket for rafting"));

                repository.save(new Product(
                        "Portable Solar Charger",
                        "Electronics",
                        3200,
                        "Solar-powered charging device"));

            }

        };
    }
}