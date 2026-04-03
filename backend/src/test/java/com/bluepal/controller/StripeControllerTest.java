package com.bluepal.controller;

import com.bluepal.entity.User;
import com.bluepal.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private StripeController stripeController;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setPremium(false);
        
        ReflectionTestUtils.setField(stripeController, "stripeApiKey", "sk_test_123");
        ReflectionTestUtils.setField(stripeController, "endpointSecret", "whsec_123");
        
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createCheckoutSession_Unauthenticated_ReturnsUnauthorized() {
        when(securityContext.getAuthentication()).thenReturn(null);
        
        ResponseEntity<Object> response = stripeController.createCheckoutSession();
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void createCheckoutSession_AlreadyPremium_ReturnsBadRequest() {
        mockUser.setPremium(true);
        mockUser.setPremiumExpiryDate(java.time.LocalDateTime.now().plusDays(10));
        
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        
        ResponseEntity<Object> response = stripeController.createCheckoutSession();
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void createCheckoutSession_Success() throws StripeException {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        
        try (MockedStatic<Session> mockedSession = mockStatic(Session.class)) {
            Session session = mock(Session.class);
            when(session.getId()).thenReturn("sess_123");
            when(session.getUrl()).thenReturn("http://stripe.com/pay");
            
            mockedSession.when(() -> Session.create(any(SessionCreateParams.class))).thenReturn(session);
            
            ResponseEntity<Object> response = stripeController.createCheckoutSession();
            
            assertEquals(HttpStatus.OK, response.getStatusCode());
        }
    }

    @Test
    void verifySession_Paid_UpgradesUser() throws StripeException {
        try (MockedStatic<Session> mockedSession = mockStatic(Session.class)) {
            Session session = mock(Session.class);
            when(session.getPaymentStatus()).thenReturn("paid");
            java.util.Map<String, String> metadata = new java.util.HashMap<>();
            metadata.put("username", "testuser");
            when(session.getMetadata()).thenReturn(metadata);
            
            mockedSession.when(() -> Session.retrieve("sess_123")).thenReturn(session);
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

            ResponseEntity<Object> response = stripeController.verifySession("sess_123");
            
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(mockUser.isPremium());
            verify(userRepository).save(mockUser);
        }
    }
}
