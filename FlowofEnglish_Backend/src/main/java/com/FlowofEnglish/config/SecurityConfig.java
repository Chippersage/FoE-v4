package com.FlowofEnglish.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors
                .configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:8080", "http://localhost:5173", "https://chippersageblr.s3.ap-south-1.amazonaws.com")); // Add your front-end URL
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                })
            )
            .authorizeHttpRequests(authorize -> authorize
            		.requestMatchers("/api/v1/superadmin/**").permitAll() 
                    .requestMatchers("/api/v1/organizations/login").permitAll() 
                    .requestMatchers("/api/v1/organizations/forgotorgpassword").permitAll() 
                    .requestMatchers("/api/v1/organizations/resetorgpassword").permitAll() 
                    .requestMatchers("/api/v1/organizations/create").permitAll() 
                    .requestMatchers("/api/v1/users/create").permitAll()
                    .requestMatchers("/api/v1/users/login").permitAll()
                    .requestMatchers("/api/v1/users/**").permitAll()
                    .requestMatchers("/api/v1/content-masters/**").permitAll()
                    .requestMatchers("/api/v1/concepts/**").permitAll()
                    .requestMatchers("/api/v1/subconcepts/**").permitAll()
                    .requestMatchers("/api/v1/cohorts/**").permitAll()
                    .requestMatchers("/api/v1/programs/**").permitAll()
                    .requestMatchers("/api/v1/user-cohort-mappings/**").permitAll()
                    .requestMatchers("/api/v1/cohortprogram/**").permitAll()
                    .requestMatchers("/api/v1/cohortprogram/create").permitAll()
                    .requestMatchers("/api/v1/organizations/**").permitAll() // Require authentication for all other organization operations
                    .requestMatchers("/api/v1/cohorts/create").permitAll()
                    .requestMatchers("/api/v1/user-cohort-mappings/create").permitAll()
                    .requestMatchers("/api/v1/programs/create").permitAll()
                    .requestMatchers("/api/v1/stages/**").permitAll()
                    .requestMatchers("/api/v1/units/**").permitAll()
                    .requestMatchers("/api/v1/user-attempts/**").permitAll()
                    .requestMatchers("/api/v1/user-session-mappings/**").permitAll()
                    .requestMatchers("/api/v1/userSubConceptsCompletion/**").permitAll()
                    .requestMatchers("/api/v1/programconceptsmappings/**").permitAll()
             
                    .anyRequest().authenticated() // Require authentication for all other requests
                )
                .csrf(csrf -> csrf.disable()); // Disable CSRF protection

            return http.build();
        }
}






//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//@Configuration
//public class SecurityConfig {
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//            .authorizeHttpRequests(authorize -> authorize
//                .requestMatchers("/api/v1/superadmin/**").permitAll() // Allow public access to superadmin endpoints
//                .requestMatchers("/api/v1/organizations/login").permitAll() // Allow public access to login endpoint
//                .requestMatchers("/api/v1/organizations/forgotorgpassword").permitAll() // Allow public access to forgot password endpoint
//                .requestMatchers("/api/v1/organizations/resetorgpassword").permitAll() // Allow public access to reset password endpoint
//                .requestMatchers("/api/v1/organizations/**").authenticated() // Require authentication for all other organization operations
//                .anyRequest().authenticated() // Require authentication for all other requests
//            )
//            .csrf(csrf -> csrf.disable()); // Disable CSRF protection
//
//        return http.build();
//    }
//}
//
////    @Bean
////    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
////        http
////            .authorizeHttpRequests(authorize -> authorize
////                // Publicly accessible endpoints
////                .requestMatchers("/api/v1/public/**").permitAll() // Allow all public endpoints
////
////                // Endpoints requiring authentication
////                .requestMatchers("/api/v1/admin/**").authenticated() // Secure all admin endpoints
////                .requestMatchers("/api/v1/user/**").authenticated() // Secure all user endpoints
////                
////                // Allow specific endpoint without authentication
////                .requestMatchers("/api/v1/superadmin/login").permitAll()
////                
////                // Any other requests that don't match the above should be authenticated
////                .anyRequest().authenticated()
////            )
////            .csrf(csrf -> csrf.disable()) // Disable CSRF protection for simplicity
////            .httpBasic(); // Enable basic authentication (or choose another method)
////
////        return http.build();
////    }
//
