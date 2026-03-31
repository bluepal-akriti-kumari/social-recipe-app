package com.bluepal;

import com.bluepal.repository.CategoryRepository;
import com.bluepal.repository.RecipeRepository;
import com.bluepal.entity.Recipe;
import com.bluepal.entity.Category;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DebugDataScanner implements CommandLineRunner {
    private final CategoryRepository categoryRepository;
    private final RecipeRepository recipeRepository;

    public DebugDataScanner(CategoryRepository categoryRepository, RecipeRepository recipeRepository) {
        this.categoryRepository = categoryRepository;
        this.recipeRepository = recipeRepository;
    }

    @Override
    public void run(String... args) {
        System.out.println("----- DEBUG CATEGORIES -----");
        categoryRepository.findAll().forEach(cat -> {
            System.out.println("ID: " + cat.getId() + " | Name: [" + cat.getName() + "]");
        });
        
        System.out.println("----- DEBUG RECIPES -----");
        recipeRepository.findAll().forEach(r -> {
            System.out.println("Title: [" + r.getTitle() + "] | Category: [" + (r.getCategory() != null ? r.getCategory().getName() : "NULL") + "] | CatID: " + (r.getCategory() != null ? r.getCategory().getId() : "NULL"));
        });
    }
}
