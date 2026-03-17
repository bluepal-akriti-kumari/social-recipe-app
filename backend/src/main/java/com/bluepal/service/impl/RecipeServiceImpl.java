package com.bluepal.service.impl;

import com.bluepal.dto.request.RecipeRequest;
import com.bluepal.dto.response.RecipeResponse;
import com.bluepal.entity.*;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.*;
import com.bluepal.service.interfaces.RecipeService;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecipeServiceImpl implements RecipeService {

	private final RecipeRepository recipeRepository;
	private final UserRepository userRepository;
	private final LikeRepository likeRepository;
	private final com.bluepal.service.interfaces.RatingService ratingService;
	private final com.bluepal.service.interfaces.BookmarkService bookmarkService;

	public RecipeServiceImpl(RecipeRepository recipeRepository, UserRepository userRepository,
			LikeRepository likeRepository, com.bluepal.service.interfaces.RatingService ratingService,
			@Lazy com.bluepal.service.interfaces.BookmarkService bookmarkService) {
		this.recipeRepository = recipeRepository;
		this.userRepository = userRepository;
		this.likeRepository = likeRepository;
		this.ratingService = ratingService;
		this.bookmarkService = bookmarkService;
	}

	@Override
	public Map<String, Object> getExploreFeedCursor(LocalDateTime cursor, int size, String currentUsername) {
		LocalDateTime effectiveCursor = (cursor == null) ? LocalDateTime.now() : cursor;
		Pageable limit = PageRequest.of(0, size);

		List<Recipe> recipes = recipeRepository.findExploreCursor(effectiveCursor, limit);

		List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, currentUsername))
				.collect(Collectors.toList());

		String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

		return Map.of("content", content, "nextCursor", nextCursor);
	}

	@Override
	public List<RecipeResponse> searchRecipesFullText(String query, String currentUsername) {
		// Prepare query for Postgres tsquery: 'chicken & rice'
		String formattedQuery = query.trim().replaceAll("\\s+", " & ");
		return recipeRepository.searchByIngredientFullText(formattedQuery).stream()
				.map(r -> this.mapToResponse(r, currentUsername)).collect(Collectors.toList());
	}

	@Override
	@Transactional
	public RecipeResponse createRecipe(RecipeRequest request, String username) {
		User author = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

		// --- Safety logic for Category ---
		RecipeCategory category;
		if (request.getCategory() == null || request.getCategory().isBlank()) {
			// Default if null or empty
			category = RecipeCategory.VEG;
		} else {
			try {
				// Convert to uppercase safely
				category = RecipeCategory.valueOf(request.getCategory().trim().toUpperCase());
			} catch (IllegalArgumentException e) {
				// Default if the string doesn't match any Enum constant (e.g., "fastfood")
				category = RecipeCategory.VEG;
			}
		}

		Recipe recipe = Recipe.builder().title(request.getTitle()).description(request.getDescription())
				.imageUrl(request.getImageUrl()).prepTimeMinutes(request.getPrepTimeMinutes())
				.cookTimeMinutes(request.getCookTimeMinutes()).servings(request.getServings()).author(author)
				.category(category) // Use the safely determined category here
				.likeCount(0).commentCount(0).build();

		if (request.getIngredients() != null) {
			request.getIngredients().forEach(ir -> recipe.addIngredient(
					Ingredient.builder().name(ir.getName()).quantity(ir.getQuantity()).unit(ir.getUnit()).build()));
		}

		if (request.getSteps() != null) {
			request.getSteps().forEach(sr -> recipe
					.addStep(Step.builder().stepNumber(sr.getStepNumber()).instruction(sr.getInstruction()).build()));
		}

		if (request.getAdditionalImages() != null) {
			request.getAdditionalImages().forEach(url -> recipe.addImage(RecipeImage.builder().imageUrl(url).build()));
		}

		Recipe savedRecipe = recipeRepository.save(recipe);

		// Award reputation points
		author.setReputationPoints(author.getReputationPoints() + 50);

		// Check and update level
		if (author.getReputationPoints() >= 1000)
			author.setReputationLevel("Sous Chef");
		else if (author.getReputationPoints() >= 500)
			author.setReputationLevel("Chef de Partie");
		else
			author.setReputationLevel("Commis Chef");

		userRepository.save(author);

		return mapToResponse(savedRecipe, username);
	}

	// Helper method to check if current user liked the recipe
	private boolean checkIsLiked(Recipe recipe, String username) {
		if (username == null)
			return false;
		return userRepository.findByUsername(username).map(user -> likeRepository.existsByUserAndRecipe(user, recipe))
				.orElse(false);
	}

	// The Mapping Method that fixes your Compilation Error
	private RecipeResponse mapToResponse(Recipe recipe, String currentUsername) {
		boolean isLiked = checkIsLiked(recipe, currentUsername);
		User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
		boolean isBookmarked = currentUser != null && bookmarkService.isBookmarked(currentUser, recipe.getId());
		int userRating = currentUser != null ? ratingService.getUserRating(currentUser, recipe) : 0;

		return RecipeResponse.builder().id(recipe.getId()).title(recipe.getTitle()).description(recipe.getDescription())
				.imageUrl(recipe.getImageUrl()).prepTimeMinutes(recipe.getPrepTimeMinutes())
				.cookTimeMinutes(recipe.getCookTimeMinutes()).servings(recipe.getServings())
				.likeCount(recipe.getLikeCount()).commentCount(recipe.getCommentCount())
				.averageRating(recipe.getAverageRating()).ratingCount(recipe.getRatingCount())
				.category(recipe.getCategory() != null ? recipe.getCategory().name() : null).isLiked(isLiked)
				.isBookmarked(isBookmarked).userRating(userRating)
				.additionalImages(
						recipe.getImages().stream().map(RecipeImage::getImageUrl).collect(Collectors.toList()))
				.createdAt(recipe.getCreatedAt())
				.author(RecipeResponse.AuthorDto.builder().id(recipe.getAuthor().getId())
						.username(recipe.getAuthor().getUsername())
						.isVerified(recipe.getAuthor().isVerified())
						.profilePictureUrl(recipe.getAuthor().getProfilePictureUrl()).build())
				.ingredients(recipe.getIngredients().stream()
						.map(i -> RecipeResponse.IngredientDto.builder().id(i.getId()).name(i.getName())
								.quantity(i.getQuantity()).unit(i.getUnit()).build())
						.collect(Collectors.toList()))
				.steps(recipe
						.getSteps().stream().map(s -> RecipeResponse.StepDto.builder().id(s.getId())
								.stepNumber(s.getStepNumber()).instruction(s.getInstruction()).build())
						.collect(Collectors.toList()))
				.build();
	}

	@Override
	public RecipeResponse getRecipeById(Long id, String currentUsername) {
		Recipe recipe = recipeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
		return mapToResponse(recipe, currentUsername);
	}

	@Override
	public Map<String, Object> getPersonalizedFeedCursor(String username, LocalDateTime cursor, int size) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

		LocalDateTime effectiveCursor = (cursor == null) ? LocalDateTime.now() : cursor;
		Pageable limit = PageRequest.of(0, size);

		List<Recipe> recipes = recipeRepository.findPersonalizedCursor(user, effectiveCursor, limit);

		List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, username))
				.collect(Collectors.toList());

		String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

		return Map.of("content", content, "nextCursor", nextCursor);
	}

	@Override
	public List<RecipeResponse> getUserRecipes(String username, String currentUsername) {
		User author = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

		return recipeRepository.findAll().stream().filter(r -> r.getAuthor().equals(author))
				.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
				.map(r -> this.mapToResponse(r, currentUsername)).collect(Collectors.toList());
	}

	@Override
	public List<RecipeResponse> getUserLikedRecipes(String username, String currentUsername) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

		return likeRepository.findByUser(user).stream().map(Like::getRecipe)
				.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
				.map(r -> this.mapToResponse(r, currentUsername)).collect(Collectors.toList());
	}

	@Override
	@Transactional
	public RecipeResponse updateRecipe(Long id, RecipeRequest request, String username) {
		Recipe recipe = recipeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

		if (!recipe.getAuthor().getUsername().equals(username)) {
			throw new RuntimeException("You are not authorized to update this recipe");
		}

		recipe.setTitle(request.getTitle());
		recipe.setDescription(request.getDescription());
		recipe.setImageUrl(request.getImageUrl());
		recipe.setPrepTimeMinutes(request.getPrepTimeMinutes());
		recipe.setCookTimeMinutes(request.getCookTimeMinutes());
		recipe.setServings(request.getServings());

		// Simple clear and re-add for ingredients/steps (can be optimized)
		recipe.getIngredients().clear();
		if (request.getIngredients() != null) {
			request.getIngredients().forEach(ir -> recipe.addIngredient(
					Ingredient.builder().name(ir.getName()).quantity(ir.getQuantity()).unit(ir.getUnit()).build()));
		}

		recipe.getSteps().clear();
		if (request.getSteps() != null) {
			request.getSteps().forEach(sr -> recipe
					.addStep(Step.builder().stepNumber(sr.getStepNumber()).instruction(sr.getInstruction()).build()));
		}

		recipe.getImages().clear();
		if (request.getAdditionalImages() != null) {
			request.getAdditionalImages().forEach(url -> recipe.addImage(RecipeImage.builder().imageUrl(url).build()));
		}

		return mapToResponse(recipeRepository.save(recipe), username);
	}

	@Override
	public void deleteRecipe(Long id, String username) {
		Recipe recipe = recipeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
		
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

		boolean isAuthor = recipe.getAuthor().getUsername().equals(username);
		boolean isModeratorOrAdmin = user.getRoles().stream()
				.anyMatch(r -> r.equals("ROLE_MODERATOR") || r.equals("ROLE_ADMIN"));

		if (!isAuthor && !isModeratorOrAdmin) {
			throw new RuntimeException("You are not authorized to delete this recipe");
		}
		recipeRepository.delete(recipe);
	}

	@Override
	public List<RecipeResponse> getTrendingRecipes(String currentUsername, int limit) {
		Pageable pageable = PageRequest.of(0, limit);
		return recipeRepository.findTrending(pageable).stream().map(r -> this.mapToResponse(r, currentUsername))
				.collect(Collectors.toList());
	}

	@Override
	public List<RecipeResponse> getRecipesByCategory(String category, String currentUsername, int limit) {
		com.bluepal.entity.RecipeCategory cat = com.bluepal.entity.RecipeCategory.valueOf(category.toUpperCase());
		Pageable pageable = PageRequest.of(0, limit);
		return recipeRepository.findByCategoryOrderByCreatedAtDesc(cat, pageable).stream()
				.map(r -> this.mapToResponse(r, currentUsername)).collect(Collectors.toList());
	}

	@Override
	public Map<String, Object> getExploreFeedCursorByCategory(String category, LocalDateTime cursor, int size,
			String currentUsername) {
		com.bluepal.entity.RecipeCategory cat = com.bluepal.entity.RecipeCategory.valueOf(category.toUpperCase());
		LocalDateTime effectiveCursor = (cursor == null) ? LocalDateTime.now() : cursor;
		Pageable limit = PageRequest.of(0, size);

		List<Recipe> recipes = recipeRepository.findExploreCursorWithCategory(cat, effectiveCursor, limit);

		List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, currentUsername))
				.collect(Collectors.toList());

		String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

		return Map.of("content", content, "nextCursor", nextCursor);
	}
}