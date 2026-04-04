# Recipe App: Test Case Document

This document provides a comprehensive overview of all implemented test cases in the Recipe App project. It covers both the Spring Boot backend and the React frontend.

---

## 1. Backend Test Suite (Spring Boot)

### 1.1 Controller Tests (API Layer)
Testing REST endpoints, request mapping, status codes, and authorization.

| Component | Test Case | Description |
| :--- | :--- | :--- |
| **Auth** | `registerUser_Success` | Ensures a new user can register successfully. |
| | `registerUser_UsernameTaken` | Validates that duplicate usernames are rejected. |
| | `loginUser_Success` | Verifies and generates JWT for valid credentials. |
| | `loginUser_Locked` | Checks if locked accounts are denied access. |
| **User** | `getUserProfile_Success` | Retrieves profile data for the authenticated user. |
| | `followUser_Success` | Verifies following functionality. |
| | `unfollowUser_Success` | Verifies unfollow functionality. |
| | `followUser_Unauthenticated_Returns401` | Ensures security for follow actions. |
| **Recipe** | `getRecipeById_Success` | Retrieves a single recipe with full details. |
| | `createRecipe_Success` | Validates recipe creation logic. |
| | `getPersonalizedFeed_Success` | Checks recipe recommendation logic. |
| | `deleteRecipe_Success` | Ensures authors can delete their recipes. |
| **Interaction** | `toggleLike_NotLiked_Likes` | Adds a like to a recipe. |
| | `addComment_WithParent_Success` | Handles nested comments/replies. |
| | `reportContent_Success` | Submits a report for moderation. |
| **Stripe** | `createCheckoutSession_Success` | Initiates premium subscription flow. |
| | `verifySession_Paid_UpgradesUser` | Upgrades user status after successful payment. |
| **Shopping List** | `addItem_Success` | Adds ingredients to user's shopping list. |
| | `togglePurchased_Success` | Marks items as purchased. |

### 1.2 Service Tests (Business Logic)
Testing core business rules, repository interactions, and complex calculations.

| Service | Test Case | Description |
| :--- | :--- | :--- |
| **UserService** | `updateReputation_Thresholds` | Verifies user level upgrades (Sous Chef, etc.). |
| | `followUser_SelfFollow_ThrowsException` | Prevents users from following themselves. |
| **RecipeService** | `createRecipe_PremiumRecipe_NonPremiumUser` | Enforces premium content restrictions. |
| | `updateAuthorReputation_SousChefLevel` | Calculates reputation points correctly. |
| | `getFilteredExploreFeed_WithFilters` | Validates multi-criteria search. |
| **ShoppingList** | `addItem_MergeQuantities_Numeric` | Merges quantities of the same item (e.g., 200g + 300g = 500g). |
| | `addIngredientsFromMealPlan` | Handles bulk additions from meal plans. |
| **RealTimeChef** | `generateTips_Success` | AI-generated cooking tips based on recipe context. |

### 1.3 Security & Infrastructure Tests
| Category | Test Case | Description |
| :--- | :--- | :--- |
| **JWT** | `generateToken_Valid` | Validates JWT structure and payload. |
| | `validateToken_Expired` | Ensures expired tokens are rejected. |
| **Filters** | `JwtAuthFilter_AuthenticatedRequest` | Verifies that valid tokens populate the SecurityContext. |
| **DTOs** | `RecipeValidation_MissingTitle` | Ensures Bean Validation constraints are respected. |

---

## 2. Frontend Test Suite (React)

### 2.1 Page Tests (User Flows)
| Page | Test Case | Description |
| :--- | :--- | :--- |
| **LoginPage** | `renders login form correctly` | UI sanity check for the login screen. |
| | `shows validation errors when fields are empty` | Form validation testing. |
| **RegisterPage** | `shows error when passwords do not match` | Client-side password confirmation check. |
| **FeedPage** | `displays empty state when no recipes found` | UX check for empty recipe feed. |
| **RecipeDetail** | `renders recipe details correctly` | Ensures all recipe properties are visible. |
| | `shows 404 page when recipe not found` | Error boundary/navigation testing. |
| **ProfilePage** | `renders profile information correctly` | Checks display of user stats and bio. |

### 2.2 Component & Hook Tests
| Component/Hook | Test Case | Description |
| :--- | :--- | :--- |
| **RecipeCard** | `calls onLike when like button is clicked` | Interaction testing with callback mocks. |
| | `opens planner modal when calendar icon clicked` | Integration with MealPlan system. |
| **useAuth** | `returns authentication state from Redux` | Custom hook state management testing. |
| | `signOut dispatches logout action` | Verifies Redux action dispatch. |
| **QuickComment** | `calls onClose when Cancel is clicked` | Modal lifecycle testing. |

---

## 3. Coverage Summary (Estimated)
- **Backend**: ~85% method coverage across controllers and services.
- **Frontend**: Focused on critical paths (Auth, CRUD, Navigation).

> [!NOTE]
> All tests are automated using **JUnit 5 / Mockito** (Backend) and **Vitest / React Testing Library** (Frontend).
