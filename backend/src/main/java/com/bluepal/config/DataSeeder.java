package com.bluepal.config;

import com.bluepal.entity.User;
import com.bluepal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("DEBUG: Running DataSeeder for Admin Setup...");
        
        // --- 1. Create a dedicated admin account if it doesn't exist ---
        createDefaultAdmin();

        // --- 2. Promote 'Akriti' to ADMIN if exists ---
        promoteToAdmin("Akriti");
        
        // --- 3. Promote 'Akriti jha' to ADMIN if exists ---
        promoteToAdmin("Akriti jha");
        
        System.out.println("DEBUG: DataSeeder completed.");
    }

    private void promoteToAdmin(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.getRoles().contains("ROLE_ADMIN")) {
                user.getRoles().add("ROLE_ADMIN");
                user.getRoles().add("ROLE_MODERATOR");
                userRepository.save(user);
                System.out.println("SUCCESS: User '" + username + "' promoted to ADMIN/MODERATOR.");
            } else {
                System.out.println("INFO: User '" + username + "' is already an ADMIN.");
            }
        } else {
            System.out.println("WARN: User '" + username + "' not found in database.");
        }
    }

    private void createDefaultAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@culinario.com")
                    .password(passwordEncoder.encode("admin123"))
                    .roles(new java.util.HashSet<>(java.util.Set.of("ROLE_USER", "ROLE_ADMIN", "ROLE_MODERATOR")))
                    .enabled(true)
                    .isVerified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("SUCCESS: Default admin account created (admin / admin123).");
        } else {
            System.out.println("INFO: Default admin account already exists.");
        }
    }
}