package com.bluepal.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(@org.springframework.beans.factory.annotation.Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetPasswordEmail(String to, String token) {
        if (mailSender == null) {
            System.err.println("Mail sender not configured. Cannot send email to: " + to);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("aakritikumarikhg@gmail.com");
        message.setTo(to);
        message.setSubject("Password Reset OTP - CulinarIO");
        message.setText("Hello,\n\n"
                + "We received a request to reset your password for your CulinarIO account.\n\n"
                + "Your 6-Digit OTP is: " + token + "\n\n"
                + "Please use this code in the application to reset your password. It will expire in 24 hours.\n"
                + "If you did not request this, you can safely ignore this email.");
        mailSender.send(message);
    }
}
