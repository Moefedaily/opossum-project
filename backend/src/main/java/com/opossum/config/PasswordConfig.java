package com.opossum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(
                16, // saltLength - 16 bytes (128 bits)
                32, // hashLength - 32 bytes (256 bits)
                1, // parallelism - number of threads
                4096, // memory - 4MB memory usage
                3 // iterations - number of iterations
        );
    }
}