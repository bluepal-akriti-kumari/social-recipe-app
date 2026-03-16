# Project Completion Plan: Social Recipe App

The project is currently about 85% complete. Most core features (Auth, Recipe CRUD, Follow system, Explore feed, Search) are implemented but several placeholder methods remain in the backend, and some functional requirements (Threaded Replies) are missing.

## User Review Required

> [!IMPORTANT]
> **Threaded Replies Implementation**: I will add a `parent_id` column to the `comments` table and update the [Comment](file:///e:/ReceipeApp/backend/src/main/java/com/bluepal/entity/Comment.java#12-39) entity. This is a breaking change for the database schema (will use a Flyway migration).
> **Like Toggle Pattern**: The implementation note requested an UPSERT/Delete pattern. I will refactor the current check-then-insert logic to satisfy this requirement.

## Proposed Changes

### Backend (Spring Boot)

---

#### [MODIFY] [Comment.java](file:///e:/ReceipeApp/backend/src/main/java/com/bluepal/entity/Comment.java)
- Add `parent` (ManyToOne) and `replies` (OneToMany) fields to support threading.

#### [NEW] [V2__add_parent_to_comments.sql](file:///e:/ReceipeApp/backend/src/main/resources/db/migration/V2__add_parent_to_comments.sql)
- Add `parent_id` column to `comments` table with a foreign key back to `comments(id)`.

#### [MODIFY] [RecipeServiceImpl.java](file:///e:/ReceipeApp/backend/src/main/java/com/bluepal/service/impl/RecipeServiceImpl.java)
- Implement [getPersonalizedFeedCursor](file:///e:/ReceipeApp/backend/src/main/java/com/bluepal/service/impl/RecipeServiceImpl.java#139-140): Fetch recipes from followed users.
- Implement [getUserRecipes](file:///e:/ReceipeApp/backend/src/main/java/com/bluepal/service/impl/RecipeServiceImpl.java#140-141): Fetch recipes by username.
- Implement [getUserLikedRecipes](file:///e:/ReceipeApp/frontend/src/services/recipe.service.ts#73-75): Fetch recipes liked by a specific user.
- Implement [updateRecipe](file:///e:/ReceipeApp/frontend/src/services/recipe.service.ts#60-62): Allow authors to update their recipes.

#### [MODIFY] [InteractionController.java](file:///e:/ReceipeApp/backend/src/main/java/com/bluepal/controller/InteractionController.java)
- Refactor [toggleLike](file:///e:/ReceipeApp/backend/src/main/java/com/bluepal/controller/InteractionController.java#54-80) to use a more efficient pattern.
- Update [addComment](file:///e:/ReceipeApp/frontend/src/services/recipe.service.ts#82-84) to accept an optional `parentId`.

---

### Frontend (React)

---

#### [MODIFY] [ProfilePage.tsx](file:///e:/ReceipeApp/frontend/src/pages/Profile/ProfilePage.tsx)
- **Fix Bug**: The page currently expects `.content` from [getUserRecipes](file:///e:/ReceipeApp/backend/src/main/java/com/bluepal/service/impl/RecipeServiceImpl.java#140-141) and [getUserLikedRecipes](file:///e:/ReceipeApp/frontend/src/services/recipe.service.ts#73-75), but the service returns a raw array. I will align these.

#### [MODIFY] [recipe.service.ts](file:///e:/ReceipeApp/frontend/src/services/recipe.service.ts)
- Update return types for user-specific recipe lists to match the backend implementation (likely using pagination if scale is expected, or consistently returning arrays).

#### [MODIFY] [README.md](file:///e:/ReceipeApp/README.md)
- Restore/Rewrite the README with setup instructions, environment variables, and Docker Compose commands.

## Verification Plan

### Automated Tests
- Run backend tests: `./mvnw test` (after adding basic integration tests for the new features).
- Run frontend build to check for type errors: `npm run build` in `/frontend`.

### Manual Verification
1. **Threaded Replies**: Post a comment, then reply to it, and verify that it appears nested (or indicated as a reply).
2. **Personalized Feed**: Follow a user, then verify that their recipes appear in the "Personalized" feed section.
3. **Profile Recipes**: Verify that clicking "My Recipes" on the profile page correctly loads the user's recipes.
4. **Likes**: Toggle a like and verify the count updates correctly in the DB.
5. **Docker**: Run `docker-compose up --build` and verify the entire stack starts correctly.
