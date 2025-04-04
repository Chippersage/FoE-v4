package com.FlowofEnglish.config;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
//import org.thymeleaf.TemplateEngine;
//import org.thymeleaf.spring6.SpringTemplateEngine;
//import org.thymeleaf.templatemode.TemplateMode;
//import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
//import org.thymeleaf.templateresolver.ITemplateResolver;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender getjavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com"); // Replace with your SMTP server
        mailSender.setPort(587); // Replace with your SMTP port
        mailSender.setUsername("support@thechippersage.com"); // Replace with your email
        mailSender.setPassword("rrto uxbo tdha xtcn"); // Replace with your email password

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        return mailSender;
    }
    
//    @Bean
//    public TemplateEngine templateEngine(ITemplateResolver templateResolver) {
//        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
//        templateEngine.setTemplateResolver(templateResolver);
//        templateEngine.setEnableSpringELCompiler(true);
//        return templateEngine;
//    }
//    
//    @Bean
//    public ITemplateResolver templateResolver() {
//        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
//        templateResolver.setPrefix("templates/");
//        templateResolver.setSuffix(".html");
//        templateResolver.setTemplateMode(TemplateMode.HTML);
//        templateResolver.setCharacterEncoding("UTF-8");
//        return templateResolver;
//    }
}