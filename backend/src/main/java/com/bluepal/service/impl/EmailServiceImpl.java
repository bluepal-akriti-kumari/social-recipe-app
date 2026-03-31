package com.bluepal.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl {

    private final JavaMailSender mailSender;
    
    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:}")
    private String fromEmail;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.password:}")
    private String mailPassword;

    public EmailServiceImpl(
            @org.springframework.beans.factory.annotation.Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        System.out.println("DEBUG: Email Service initialized");
        System.out.println("DEBUG: fromEmail is: " + fromEmail);
        System.out.println("DEBUG: mailPassword is: " + (mailPassword != null && !mailPassword.isEmpty() ? "set (length " + mailPassword.length() + ")" : "not set"));
    }

    public void sendResetPasswordEmail(String to, String token) {
        if (mailSender == null) {
            System.err.println("Mail sender not configured. Cannot send email to: " + to);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "noreply@culinario.com");
        message.setTo(to);
        message.setSubject("Password Reset OTP - CulinarIO");
        message.setText("Hello,\n\n"
                + "We received a request to reset your password for your CulinarIO account.\n\n"
                + "Your 6-Digit OTP is: " + token + "\n\n"
                + "Please use this code in the application to reset your password. It will expire in 24 hours.\n"
                + "If you did not request this, you can safely ignore this email.");
        
        mailSender.send(message);
        System.out.println("SUCCESS: Password reset email sent to: " + to);
    }

    public void sendVerificationEmail(String to, String token) {
        if (mailSender == null) {
            System.err.println("Mail sender not configured. Cannot send verification email to: " + to);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "noreply@culinario.com");
        message.setTo(to);
        message.setSubject("Verify Your Email - CulinarIO");
        // Update URL to match frontend deployment or localhost
        String verificationUrl = "http://localhost:5173/verify-email?token=" + token;
        message.setText("Hello,\n\n"
                + "Thank you for registering with CulinarIO! Please click the link below to verify your email address:\n\n"
                + verificationUrl + "\n\n"
                + "This link will expire in 24 hours.\n"
                + "If you did not register for an account, you can safely ignore this email.");
        
        mailSender.send(message);
        System.out.println("SUCCESS: Verification email sent to: " + to);
    }

    public void sendRestrictionEmail(String to, String username, boolean isRestricted) {
        if (mailSender == null) {
            System.err.println("Mail sender not configured. Cannot send restriction email to: " + to);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "noreply@culinario.com");
        message.setTo(to);
        
        if (isRestricted) {
            message.setSubject("Account Restricted - CulinarIO");
            message.setText("Hello " + username + ",\n\n"
                    + "your account is restricted by admin we cannot login again.\n\n"
                    + "If you believe this is a mistake, please contact our support team.");
        } else {
            message.setSubject("Account Access Restored - CulinarIO");
            message.setText("Hello " + username + ",\n\n"
                    + "Good news! Your account access on CulinarIO has been restored.\n\n"
                    + "You can now log in and continue sharing your culinary journey with the community.\n\n"
                    + "Welcome back!");
        }
        
        mailSender.send(message);
        System.out.println("SUCCESS: Restriction status email sent to: " + to + " (Restricted: " + isRestricted + ")");
    }
}
