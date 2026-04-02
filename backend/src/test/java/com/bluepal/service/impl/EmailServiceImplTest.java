package com.bluepal.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @Test
    void sendResetPasswordEmail_Success() {
        emailService.sendResetPasswordEmail("test@example.com", "123456");

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendResetPasswordEmail_NoMailSender_NoException() {
        EmailServiceImpl serviceNoMail = new EmailServiceImpl(null);
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> 
            serviceNoMail.sendResetPasswordEmail("test@example.com", "123456")
        );
    }
}
