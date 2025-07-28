package com.FlowofEnglish.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Configuration
public class CloudFrontConfig {

    @Value("${cloudfront.domain}")
    private String domain;

    @Value("${cloudfront.keyPairId}")
    private String keyPairId;

    @Value("${cloudfront.privateKeyPath:}")
    private Resource privateKeyResource; // Will be null if not set

    @Value("${cloudfront.url.expiration.seconds}")
    private long expirationSeconds;

    private final Environment environment;

    public CloudFrontConfig(Environment environment) {
        this.environment = environment;
    }

    public String getDomain() {
        return domain;
    }

    public String getKeyPairId() {
        return keyPairId;
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    @Bean
    public PrivateKey cloudFrontPrivateKey() {
        try {
            String activeProfile = environment.getProperty("spring.profiles.active", "default");

            String privateKeyPem;

            if ("prod".equalsIgnoreCase(activeProfile)) {
                // Read from environment variable in ECS
                privateKeyPem = System.getenv("CLOUDFRONT_PRIVATE_KEY");
                if (privateKeyPem == null || privateKeyPem.isBlank()) {
                    throw new RuntimeException("CLOUDFRONT_PRIVATE_KEY environment variable is not set");
                }
            } else {
                // Fallback to local file for dev/test
                try (InputStream is = privateKeyResource.getInputStream()) {
                    byte[] keyBytes = is.readAllBytes();
                    privateKeyPem = new String(keyBytes, StandardCharsets.UTF_8);
                }
            }

            // Sanitize PEM and decode
            privateKeyPem = privateKeyPem
                    .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                    .replace("-----END RSA PRIVATE KEY-----", "")
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s+", "");

            byte[] decoded = Base64.getDecoder().decode(privateKeyPem);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
            return KeyFactory.getInstance("RSA").generatePrivate(spec);

        } catch (Exception e) {
            throw new RuntimeException("Failed to load CloudFront private key", e);
        }
    }
}
