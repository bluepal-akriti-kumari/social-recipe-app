package com.bluepal.controller;

import com.bluepal.entity.User;
import com.bluepal.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class StripeController {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    private final UserRepository userRepository;

    public StripeController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession() {
        Stripe.apiKey = stripeApiKey;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = auth.getName();

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && userOpt.get().hasActivePremium()) {
            Map<String, String> responseData = new HashMap<>();
            responseData.put("message", "You already have an active premium membership. No need to pay again.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseData);
        }

        Long userId = userOpt.get().getId();

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/profile/" + userId + "?upgrade=success&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:5173/profile/" + userId + "?upgrade=cancel")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount(49900L) // ₹499.00
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Culinario Premium Plus Membership")
                                        .setDescription("Unlock unlimited exclusive recipes and pro-chef community highlights")
                                        .build())
                                .build())
                        .build())
                .putMetadata("username", username)
                .build();

        try {
            Session session = Session.create(params);
            Map<String, String> responseData = new HashMap<>();
            responseData.put("id", session.getId());
            responseData.put("url", session.getUrl());
            return ResponseEntity.ok(responseData);
        } catch (StripeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                String username = session.getMetadata().get("username");
                upgradeUserToPremium(username);
            }
        }

        return ResponseEntity.ok("Received");
    }

    private void upgradeUserToPremium(String username) {
        if (username == null) return;
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Prevent duplicated expiry increments if they accidentally verify multiple times
            if (!user.hasActivePremium()) {
                user.setPremium(true);
                user.setPremiumExpiryDate(java.time.LocalDateTime.now().plusDays(30));
                userRepository.save(user);
                System.out.println("SUCCESS: User " + username + " upgraded to Premium via Stripe. Valid until: " + user.getPremiumExpiryDate());
            }
        }
    }

    @GetMapping("/verify-session")
    public ResponseEntity<Map<String, String>> verifySession(@RequestParam("session_id") String sessionId) {
        Stripe.apiKey = stripeApiKey;
        try {
            Session session = Session.retrieve(sessionId);
            if ("paid".equals(session.getPaymentStatus())) {
                String username = session.getMetadata().get("username");
                upgradeUserToPremium(username);
                Map<String, String> responseData = new HashMap<>();
                responseData.put("message", "Payment verified and user upgraded successfully.");
                return ResponseEntity.ok(responseData);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
