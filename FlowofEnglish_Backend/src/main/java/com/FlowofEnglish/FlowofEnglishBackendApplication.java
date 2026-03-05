package com.FlowofEnglish;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication(exclude = {RedisRepositoriesAutoConfiguration.class})
@EnableJpaRepositories(basePackages = "com.FlowofEnglish.repository")
@EnableTransactionManagement
public class FlowofEnglishBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(FlowofEnglishBackendApplication.class, args);
    }
}