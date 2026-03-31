package com.bluepal.config;

import com.bluepal.entity.User;
import com.bluepal.repository.UserRepository;
import com.bluepal.repository.CategoryRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.entity.Category;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.RecipeStatus;
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
    private final CategoryRepository categoryRepository;
    private final RecipeRepository recipeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("DEBUG: Running DataSeeder for Admin Setup...");
        
        // --- 1. Create a dedicated admin account if it doesn't exist ---
        createDefaultAdmin();

        // --- 2. Promote ONLY necessary accounts to ADMIN (if needed) ---
        // promoteToAdmin("Akriti"); // Removed per user request
        // promoteToAdmin("Akriti jha"); // Removed per user request
        
        // --- 3. Deny ADMIN role to everyone else ---
        demoteOtherAdmins("admin@culinario.com");
        
        // --- 4. Seed Categories ---
        seedCategories();

        // --- 5. Seed Sample Recipes ---
        seedSampleRecipes();
        
        System.out.println("DEBUG: DataSeeder completed.");
    }

    private void promoteToAdmin(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!user.getRoles().contains("ROLE_ADMIN") || user.getRoles().contains("ROLE_MODERATOR")) {
                user.getRoles().add("ROLE_USER");
                user.getRoles().add("ROLE_ADMIN");
                user.getRoles().remove("ROLE_MODERATOR"); // Cleanup legacy role
                userRepository.save(user);
                System.out.println("SUCCESS: User '" + username + "' roles synchronized (ADMIN).");
            } else {
                System.out.println("INFO: User '" + username + "' is already an ADMIN.");
            }
        } else {
            System.out.println("WARN: User '" + username + "' not found in database.");
        }
    }

    private void demoteOtherAdmins(String mainAdminEmail) {
        userRepository.findAll().forEach(user -> {
            if (!mainAdminEmail.equalsIgnoreCase(user.getEmail()) && 
                user.getRoles().contains("ROLE_ADMIN")) {
                user.getRoles().remove("ROLE_ADMIN");
                userRepository.save(user);
                System.out.println("INFO: Demoted user '" + user.getUsername() + "' from ADMIN role.");
            }
        });
    }

    private void createDefaultAdmin() {
        if (!userRepository.existsByEmail("admin@culinario.com")) {
            User admin = User.builder()
                    .username("admin")
                    .fullName("System Administrator")
                    .email("admin@culinario.com")
                    .password(passwordEncoder.encode("admin123"))
                    .roles(new java.util.HashSet<>(java.util.Set.of("ROLE_USER", "ROLE_ADMIN")))
                    .enabled(true)
                    .verified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("SUCCESS: Default admin account created (admin@culinario.com / admin123).");
        } else {
            // Ensure the main admin DOES have the ROLE_ADMIN if it already exists
            userRepository.findByEmail("admin@culinario.com").ifPresent(admin -> {
                if (!admin.getRoles().contains("ROLE_ADMIN")) {
                    admin.getRoles().add("ROLE_ADMIN");
                    userRepository.save(admin);
                }
            });
            System.out.println("INFO: Default admin account already exists.");
        }
    }

    private void seedCategories() {
        String[] cats = {"Breakfast", "Lunch", "Dinner", "Dessert", "Healthy", "Vegan", "Italian", "Indian", "Seafood", "Baking", "Vegetarian", "Non-Vegetarian"};
        for (String catName : cats) {
            if (!categoryRepository.existsByNameIgnoreCase(catName)) {
                categoryRepository.save(new Category(catName));
            }
        }
    }

    private void seedSampleRecipes() {
        if (recipeRepository.count() < 5) {
            User admin = userRepository.findByUsername("admin").orElse(null);
            Category healthy = categoryRepository.findByNameIgnoreCase("Healthy").orElse(null);
            
            if (admin != null && healthy != null) {
                Recipe r1 = Recipe.builder()
                        .title("Sample Recipe 26")
                        .description("Automated seed recipe for ID 26 stabilization")
                        .author(admin)
                        .category(healthy)
                        .isPublished(true)
                        .isPremium(false)
                        .status(RecipeStatus.ACTIVE)
                        .prepTimeMinutes(10)
                        .cookTimeMinutes(20)
                        .servings(2)
                        .build();
                recipeRepository.save(r1);

                Recipe r2 = Recipe.builder()
                        .title("Sample Recipe 27")
                        .description("Automated seed recipe for ID 27 stabilization")
                        .author(admin)
                        .category(healthy)
                        .isPublished(true)
                        .isPremium(true)
                        .status(RecipeStatus.ACTIVE)
                        .prepTimeMinutes(15)
                        .cookTimeMinutes(25)
                        .servings(4)
                        .build();
                recipeRepository.save(r2);
                System.out.println("SUCCESS: Sample recipes seeded.");
            }
        }
    }
}