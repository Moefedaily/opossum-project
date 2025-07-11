package com.opossum.util;

import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.SecureRandom;
import java.util.Base64;

public class Argon2idPasswordEncoder implements PasswordEncoder {

    private static final int SALT_LENGTH = 16; // 128 bits
    private static final int HASH_LENGTH = 32; // 256 bits
    private static final int ITERATIONS = 3; // Time cost
    private static final int MEMORY = 65536; // 64MB memory cost
    private static final int PARALLELISM = 4; // 4 threads

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public String encode(CharSequence rawPassword) {
        // Generate random salt
        byte[] salt = new byte[SALT_LENGTH];
        secureRandom.nextBytes(salt);

        // Hash password with salt
        byte[] hash = hash(rawPassword.toString().toCharArray(), salt);

        // Encode salt and hash to Base64
        String encodedSalt = Base64.getEncoder().encodeToString(salt);
        String encodedHash = Base64.getEncoder().encodeToString(hash);

        // Return format: salt$hash
        return encodedSalt + "$" + encodedHash;
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        // Parse encoded password
        String[] parts = encodedPassword.split("\\$");
        if (parts.length != 2) {
            return false;
        }

        // Decode salt and expected hash
        byte[] salt = Base64.getDecoder().decode(parts[0]);
        byte[] expectedHash = Base64.getDecoder().decode(parts[1]);

        // Hash the raw password with the same salt
        byte[] actualHash = hash(rawPassword.toString().toCharArray(), salt);

        // Constant-time comparison to prevent timing attacks
        return constantTimeEquals(expectedHash, actualHash);
    }

    /**
     * Hash password using Argon2id algorithm
     */
    private byte[] hash(char[] password, byte[] salt) {
        Argon2Parameters.Builder builder = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withSalt(salt)
                .withIterations(ITERATIONS)
                .withMemoryAsKB(MEMORY)
                .withParallelism(PARALLELISM);

        Argon2BytesGenerator generator = new Argon2BytesGenerator();
        generator.init(builder.build());

        byte[] result = new byte[HASH_LENGTH];
        generator.generateBytes(password, result, 0, result.length);

        return result;
    }

    /**
     * Constant-time comparison to prevent timing attacks
     */
    private boolean constantTimeEquals(byte[] expected, byte[] actual) {
        if (expected.length != actual.length) {
            return false;
        }

        int result = 0;
        for (int i = 0; i < expected.length; i++) {
            result |= expected[i] ^ actual[i];
        }

        return result == 0;
    }
}