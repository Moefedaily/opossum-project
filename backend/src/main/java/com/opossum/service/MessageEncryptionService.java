package com.opossum.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@Slf4j
public class MessageEncryptionService {

    @Value("${app.messaging.encryption-key:opossum-default-secret-key-32-chars}")
    private String encryptionKey;

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";

    public String encryptMessage(String plainText) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(
                    encryptionKey.substring(0, 32).getBytes(StandardCharsets.UTF_8),
                    ALGORITHM);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);

            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);

        } catch (Exception e) {
            log.error("Error encrypting message: {}", e.getMessage());
            throw new RuntimeException("Failed to encrypt message", e);
        }
    }

    public String decryptMessage(String encryptedText) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(
                    encryptionKey.substring(0, 32).getBytes(StandardCharsets.UTF_8),
                    ALGORITHM);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decryptedBytes, StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Error decrypting message: {}", e.getMessage());
            return "[ENCRYPTED MESSAGE - DECRYPTION FAILED]";
        }
    }

    // For admin viewing - shows truncated encrypted content
    public String getAdminDisplayContent(String encryptedText) {
        if (encryptedText == null || encryptedText.length() < 10) {
            return "[ENCRYPTED MESSAGE]";
        }
        return "[ENCRYPTED: " + encryptedText.substring(0, 10) + "...]";
    }
}
