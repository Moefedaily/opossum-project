package com.opossum;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OpossumApplication {

    public static void main(String[] args) {
        // Only load .env file in development (when file exists)
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing() // This is the key fix!
                    .load();
            dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
        } catch (Exception e) {
            // In production, .env file doesn't exist - use environment variables
            System.out.println("No .env file found, using environment variables");
        }

        SpringApplication.run(OpossumApplication.class, args);
    }
}