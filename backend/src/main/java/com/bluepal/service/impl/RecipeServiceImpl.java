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

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecipeServiceImpl implements RecipeService {

	private final RecipeRepository recipeRepository;
	private final UserRepository userRepository;
	private final NotificationRepository notificationRepository;
	private final MealPlanRepository mealPlanRepository;
	private final ShoppingListItemRepository shoppingListItemRepository;
	private final LikeRepository likeRepository;
	private final CommentRepository commentRepository;
	private final BookmarkRepository bookmarkRepository;
	private final RatingRepository ratingRepository;
	private final com.bluepal.service.interfaces.RatingService ratingService;
	private final com.bluepal.service.interfaces.BookmarkService bookmarkService;

	public RecipeServiceImpl(RecipeRepository recipeRepository, UserRepository userRepository,
			NotificationRepository notificationRepository, MealPlanRepository mealPlanRepository,
			ShoppingListItemRepository shoppingListItemRepository,
			LikeRepository likeRepository, CommentRepository commentRepository, 
			BookmarkRepository bookmarkRepository, RatingRepository ratingRepository,
			com.bluepal.service.interfaces.RatingService ratingService,
			@Lazy com.bluepal.service.interfaces.BookmarkService bookmarkService) {
		this.recipeRepository = recipeRepository;
		this.userRepository = userRepository;
		this.notificationRepository = notificationRepository;
		this.mealPlanRepository = mealPlanRepository;
		this.shoppingListItemRepository = shoppingListItemRepository;
		this.likeRepository = likeRepository;
		this.commentRepository = commentRepository;
		this.bookmarkRepository = bookmarkRepository;
		this.ratingRepository = ratingRepository;
		this.ratingService = ratingService;
		this.bookmarkService = bookmarkService;
	}

	@Override
	public List<RecipeResponse> searchRecipesFullText(String query, String currentUsername) {
		// PostgreSQL ILIKE search handles standard string tokens
		return recipeRepository.searchRecipesFullText(query.trim()).stream()
				.map(r -> this.mapToResponse(r, currentUsername)).collect(Collectors.toList());
	}

	@Override
	@Transactional
	public RecipeResponse createRecipe(RecipeRequest request, String username) {
		System.out.println("DEBUG: Creating recipe for user: " + username);
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
				.category(category)
				.isPublished(request.isPublished())
				.calories(request.getCalories())
				.protein(request.getProtein())
				.carbs(request.getCarbs())
				.fats(request.getFats())
				.likeCount(0).commentCount(0).build();

		if (request.getIngredients() != null) {
			request.getIngredients().forEach(ir -> {
				ShoppingCategory ingCat = ShoppingCategory.OTHER;
				if (ir.getCategory() != null) {
					try {
						ingCat = ShoppingCategory.valueOf(ir.getCategory().toUpperCase());
					} catch (IllegalArgumentException ignored) {}
				}
				recipe.addIngredient(Ingredient.builder()
						.name(ir.getName())
						.quantity(ir.getQuantity())
						.unit(ir.getUnit())
						.category(ingCat)
						.build());
			});
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
		int currentPoints = author.getReputationPoints() != null ? author.getReputationPoints() : 0;
		author.setReputationPoints(currentPoints + 50);

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
		try {
			boolean isLiked = checkIsLiked(recipe, currentUsername);
			User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
			boolean isBookmarked = currentUser != null && bookmarkService.isBookmarked(currentUser, recipe.getId());
			int userRating = currentUser != null ? ratingService.getUserRating(currentUser, recipe) : 0;

			return RecipeResponse.builder().id(recipe.getId()).title(recipe.getTitle()).description(recipe.getDescription())
					.imageUrl(recipe.getImageUrl()).prepTimeMinutes(recipe.getPrepTimeMinutes())
					.cookTimeMinutes(recipe.getCookTimeMinutes()).servings(recipe.getServings())
					.calories(recipe.getCalories()).protein(recipe.getProtein()).carbs(recipe.getCarbs()).fats(recipe.getFats())
					.likeCount(recipe.getLikeCount()).commentCount(recipe.getCommentCount())
					.averageRating(recipe.getAverageRating()).ratingCount(recipe.getRatingCount())
					.category(recipe.getCategory() != null ? recipe.getCategory().name() : null).isLiked(isLiked)
				.isBookmarked(isBookmarked).userRating(userRating)
				.isPublished(recipe.isPublished())
				.additionalImages(
							recipe.getImages().stream().map(RecipeImage::getImageUrl).collect(Collectors.toList()))
					.createdAt(recipe.getCreatedAt())
					.author(recipe.getAuthor() != null ? RecipeResponse.AuthorDto.builder().id(recipe.getAuthor().getId())
							.username(recipe.getAuthor().getUsername())
							.isVerified(recipe.getAuthor().isVerified())
							.profilePictureUrl(recipe.getAuthor().getProfilePictureUrl()).build() : null)
					.ingredients(recipe.getIngredients().stream()
							.map(i -> RecipeResponse.IngredientDto.builder().id(i.getId()).name(i.getName())
									.quantity(i.getQuantity()).unit(i.getUnit())
									.category(i.getCategory() != null ? i.getCategory().name() : null).build())
							.collect(Collectors.toList()))
					.steps(recipe
							.getSteps().stream().map(s -> RecipeResponse.StepDto.builder().id(s.getId())
									.stepNumber(s.getStepNumber()).instruction(s.getInstruction()).build())
							.collect(Collectors.toList()))
					.build();
		} catch (Exception e) {
			System.err.println("CRITICAL ERROR in mapToResponse for recipe " + recipe.getId() + ": " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

	@Override
	@Transactional(readOnly = true)
	public RecipeResponse getRecipeById(Long id, String currentUsername) {
		Recipe recipe = recipeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
		return mapToResponse(recipe, currentUsername);
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getExploreFeedCursor(LocalDateTime cursor, int size, String currentUsername) {
		try {
			List<Recipe> recipes;
			Pageable limit = PageRequest.of(0, size);

			if (cursor == null) {
				recipes = recipeRepository.findAllByIsPublishedTrueOrderByCreatedAtDesc(limit);
			} else {
				recipes = recipeRepository.findExploreCursorPublished(cursor, limit);
			}

			List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, currentUsername))
					.collect(Collectors.toList());

			String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

			return Map.of("content", content, "nextCursor", nextCursor);
		} catch (Exception e) {
			return Map.of("content", List.of(), "nextCursor", "");
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getPersonalizedFeedCursor(String username, LocalDateTime cursor, int size) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

		Pageable limit = PageRequest.of(0, size);
		List<Recipe> recipes;

		if (cursor == null) {
			recipes = recipeRepository.findPersonalizedLatest(user, limit);
		} else {
			recipes = recipeRepository.findPersonalizedCursor(user, cursor, limit);
		}

		List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, username))
				.collect(Collectors.toList());

		String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

		return Map.of("content", content, "nextCursor", nextCursor);
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getUserRecipes(Long userId, LocalDateTime cursor, int size, String currentUsername) {
		try {
			User author = userRepository.findById(userId)
					.orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

			Pageable limit = PageRequest.of(0, size);
			List<Recipe> recipes;

			boolean isSelf = author.getUsername().equals(currentUsername);

			if (cursor == null) {
				if (isSelf) {
					recipes = recipeRepository.findByAuthorOrderByCreatedAtDesc(author, limit);
				} else {
					recipes = recipeRepository.findByAuthorAndIsPublishedTrueOrderByCreatedAtDesc(author, limit);
				}
			} else {
				if (isSelf) {
					recipes = recipeRepository.findUserRecipesCursor(author, cursor, limit);
				} else {
					recipes = recipeRepository.findUserRecipesCursorPublished(author, cursor, limit);
				}
			}

			System.out.println("DEBUG: Found " + recipes.size() + " recipes for user ID " + userId);

			List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, currentUsername))
					.collect(Collectors.toList());

			String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

			return Map.of("content", content, "nextCursor", nextCursor);
		} catch (Exception e) {
			System.err.println("FATAL ERROR in getUserRecipes for ID " + userId + ": " + e.getMessage());
			e.printStackTrace();
			return Map.of("content", List.of(), "nextCursor", "", "error", e.getMessage());
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getUserLikedRecipes(Long userId, LocalDateTime cursor, int size, String currentUsername) {
		try {
			User user = userRepository.findById(userId)
					.orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

			Pageable limit = PageRequest.of(0, size);
			List<Recipe> recipes;

			if (cursor == null) {
				recipes = recipeRepository.findLikedRecipesByUser(user, limit);
			} else {
				recipes = recipeRepository.findLikedRecipesCursor(user, cursor, limit);
			}

			List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, currentUsername))
					.collect(Collectors.toList());

			String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

			return Map.of("content", content, "nextCursor", nextCursor);
		} catch (Exception e) {
			System.err.println("ERROR: Failed to fetch liked recipes for ID " + userId + ": " + e.getMessage());
			return Map.of("content", List.of(), "nextCursor", "");
		}
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
		recipe.setCalories(request.getCalories());
		recipe.setProtein(request.getProtein());
		recipe.setCarbs(request.getCarbs());
		recipe.setFats(request.getFats());

		// Update category safely
		if (request.getCategory() != null && !request.getCategory().isBlank()) {
			try {
				recipe.setCategory(RecipeCategory.valueOf(request.getCategory().trim().toUpperCase()));
			} catch (IllegalArgumentException e) {
				// Keep existing if invalid
			}
		}

		recipe.setPublished(request.isPublished());

		// Simple clear and re-add for ingredients/steps (can be optimized)
		new java.util.ArrayList<>(recipe.getIngredients()).forEach(recipe::removeIngredient);
		if (request.getIngredients() != null) {
			request.getIngredients().forEach(ir -> {
				ShoppingCategory ingCat = ShoppingCategory.OTHER;
				if (ir.getCategory() != null) {
					try {
						ingCat = ShoppingCategory.valueOf(ir.getCategory().toUpperCase());
					} catch (IllegalArgumentException ignored) {}
				}
				recipe.addIngredient(Ingredient.builder()
						.name(ir.getName())
						.quantity(ir.getQuantity())
						.unit(ir.getUnit())
						.category(ingCat)
						.build());
			});
		}

		new java.util.ArrayList<>(recipe.getSteps()).forEach(recipe::removeStep);
		if (request.getSteps() != null) {
			request.getSteps().forEach(sr -> recipe
					.addStep(Step.builder().stepNumber(sr.getStepNumber()).instruction(sr.getInstruction()).build()));
		}

		new java.util.ArrayList<>(recipe.getImages()).forEach(recipe::removeImage);
		if (request.getAdditionalImages() != null) {
			request.getAdditionalImages().forEach(url -> recipe.addImage(RecipeImage.builder().imageUrl(url).build()));
		}

		return mapToResponse(recipeRepository.save(recipe), username);
	}

	@Override
	@Transactional
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
		
		// Cascade delete related entities
		likeRepository.deleteByRecipe(recipe);
		commentRepository.deleteByRecipe(recipe);
		bookmarkRepository.deleteByRecipe(recipe);
		ratingRepository.deleteByRecipe(recipe);
		notificationRepository.deleteByRecipeId(recipe.getId());
		mealPlanRepository.deleteByRecipe(recipe);
		shoppingListItemRepository.deleteByRecipe(recipe);

		recipeRepository.delete(recipe);
	}

	@Override
	@Transactional(readOnly = true)
	public List<RecipeResponse> getTrendingRecipes(String currentUsername, int limit) {
		Pageable pageable = PageRequest.of(0, limit);
		return recipeRepository.findTrending(pageable).stream().map(r -> this.mapToResponse(r, currentUsername))
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<RecipeResponse> getRecipesByCategory(String category, String currentUsername, int limit) {
		try {
			RecipeCategory cat = RecipeCategory.valueOf(category.toUpperCase());
			Pageable pageable = PageRequest.of(0, limit);
			return recipeRepository.findByCategoryAndIsPublishedTrueOrderByCreatedAtDesc(cat, pageable).stream()
					.map(r -> this.mapToResponse(r, currentUsername)).collect(Collectors.toList());
		} catch (IllegalArgumentException e) {
			return List.of(); // Return empty list for unknown category
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getExploreFeedCursorByCategory(String category, LocalDateTime cursor, int size,
			String currentUsername) {
		try {
			com.bluepal.entity.RecipeCategory cat = com.bluepal.entity.RecipeCategory
					.valueOf(category.trim().toUpperCase());
			Pageable limit = PageRequest.of(0, size);
			List<Recipe> recipes;

			if (cursor == null) {
				recipes = recipeRepository.findByCategoryAndIsPublishedTrueOrderByCreatedAtDesc(cat, limit);
			} else {
				recipes = recipeRepository.findExploreCursorWithCategoryPublished(cat, cursor, limit);
			}

			List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, currentUsername))
					.collect(Collectors.toList());

			String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

			return Map.of("content", content, "nextCursor", nextCursor);
		} catch (IllegalArgumentException e) {
			return Map.of("content", List.of(), "nextCursor", "");
		}
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> getFilteredExploreFeed(LocalDateTime cursor, int size, String category, Integer maxTime,
			Integer maxCalories, String sort, String currentUsername) {
		try {
			Specification<Recipe> spec = (root, query, cb) -> {
				List<Predicate> predicates = new ArrayList<>();
				
				// Always only show published recipes in explore
				predicates.add(cb.isTrue(root.get("isPublished")));
				
				if (cursor != null) {
					predicates.add(cb.lessThan(root.get("createdAt"), cursor));
				}
				
				if (category != null && !category.isEmpty() && !"all".equalsIgnoreCase(category)) {
					try {
						RecipeCategory cat = RecipeCategory.valueOf(category.trim().toUpperCase());
						predicates.add(cb.equal(root.get("category"), cat));
					} catch (IllegalArgumentException ignored) {}
				}
				
				if (maxTime != null) {
					// Combined prep + cook time (using coalesce to handle null values)
					Expression<Integer> prep = cb.coalesce(root.get("prepTimeMinutes"), 0);
					Expression<Integer> cook = cb.coalesce(root.get("cookTimeMinutes"), 0);
					predicates.add(cb.lessThanOrEqualTo(cb.sum(prep, cook), maxTime));
				}
				
				if (maxCalories != null) {
					// Use coalesce to treat NULL calories as 0 for filtering purposes
					predicates.add(cb.lessThanOrEqualTo(cb.coalesce(root.get("calories"), 0), maxCalories));
				}

				// CRITICAL FIX: Only add orderBy if it's not a count query
				if (query.getResultType() != Long.class && query.getResultType() != long.class) {
					if ("trending".equalsIgnoreCase(sort)) {
						Expression<Integer> likes = cb.coalesce(root.get("likeCount"), 0);
						Expression<Integer> ratings = cb.coalesce(root.get("ratingCount"), 0);
						query.orderBy(cb.desc(cb.sum(likes, ratings)));
					} else if ("rating".equalsIgnoreCase(sort)) {
						query.orderBy(cb.desc(cb.coalesce(root.get("averageRating"), 0.0)));
					} else {
						// Default to newest
						query.orderBy(cb.desc(root.get("createdAt")));
					}
				}
				
				return cb.and(predicates.toArray(new Predicate[0]));
			};

			Pageable limit = PageRequest.of(0, size);
			List<Recipe> recipes = recipeRepository.findAll(spec, limit).getContent();

			List<RecipeResponse> content = recipes.stream().map(r -> this.mapToResponse(r, currentUsername))
					.collect(Collectors.toList());

			String nextCursor = content.isEmpty() ? "" : content.get(content.size() - 1).getCreatedAt().toString();

			return Map.of("content", content, "nextCursor", nextCursor);
		} catch (Exception e) {
			System.err.println("ERROR in getFilteredExploreFeed: " + e.getMessage());
			e.printStackTrace();
			return Map.of("content", List.of(), "nextCursor", "", "error", e.getMessage());
		}
	}
}