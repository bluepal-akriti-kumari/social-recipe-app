# Social Recipe App Implementation Plan

## Goal Description
Provide a fully comprehensive implementation architecture and file structure for both the Spring Boot 3 Backend and Vite + React 18 Frontend. The backend will integrate Cloudinary. The frontend will incorporate React, Vite, Tailwind CSS, Redux Toolkit, Axios, Material UI, and Material UI Icons with a highly reusable component architecture.

## User Review Required
> [!IMPORTANT]
> Please review this structure to verify it aligns exactly with your vision for the project. Let me know if you would like me to adjust any layers, entity names, or feature slice breakdowns before proceeding to code generation.

## Proposed Changes

### Backend Structure
The Spring Boot 3 backend adheres to a standard multi-tiered architecture (Controller Layer, Service Layer, Repository Layer) integrated with Spring Security (JWT) and Cloudinary.

```text
backend/
├── src/main/java/com/recipeapp/social/
│   ├── SocialRecipeApplication.java
│   ├── config/
│   │   ├── CloudinaryConfig.java        # Cloudinary initialization
│   │   ├── SecurityConfig.java          # Spring Security & CORS rules
│   │   └── WebMvcConfig.java
│   ├── controller/
│   │   ├── AuthController.java          # /api/auth/register, /login
│   │   ├── RecipeController.java        # /api/recipes CRUD
│   │   ├── UserController.java          # /api/users profile logic
│   │   ├── FeedController.java          # /api/feed logic
│   │   └── InteractionController.java   # /api/interactions (likes, comments)
│   ├── dto/
│   │   ├── request/                     # e.g., LoginRequest, RecipeCreateRequest
│   │   └── response/                    # e.g., JwtResponse, RecipeResponse
│   ├── entity/
│   │   ├── User.java
│   │   ├── Recipe.java                  # Holds recipe metadata & Cloudinary URL
│   │   ├── Ingredient.java
│   │   ├── Step.java
│   │   ├── Comment.java
│   │   └── Like.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java  # @ControllerAdvice
│   │   └── ResourceNotFoundException.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── RecipeRepository.java        # Includes GIN index search query
│   │   ├── InteractionRepository.java
│   │   └── CommentRepository.java
│   ├── security/
│   │   ├── JwtAuthFilter.java           # JWT extraction and validation
│   │   ├── JwtUtils.java
│   │   ├── CustomUserDetails.java
│   │   └── CustomUserDetailsService.java
│   └── service/
│       ├── interfaces/                  # Service interfaces
│       │   ├── AuthService.java
│       │   ├── RecipeService.java
│       │   ├── CloudinaryService.java
│       │   └── FeedService.java
│       └── impl/                        # Implementations
│           ├── AuthServiceImpl.java
│           ├── RecipeServiceImpl.java
│           ├── CloudinaryServiceImpl.java
│           └── FeedServiceImpl.java
└── src/main/resources/
    ├── application.yml                  # Postgres, Cloudinary, JWT Secrets
    └── db/migration/                    # Flyway migration scripts
```

### Frontend Structure
The React 18 frontend uses a slice-based architecture pattern for Redux state, promoting reusability and separating feature-specific code.

```text
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx                          # Root React component
│   ├── main.tsx                         # Entry point (Store Provider, Theme)
│   ├── assets/                          # Images, global static assets
│   ├── components/                      # Shared Reusable UI Components
│   │   ├── common/                      # Base generic layout components
│   │   │   ├── CustomButton.tsx         # Tailwind/MUI wrapped Button
│   │   │   ├── FormInput.tsx            # React Hook Form wrapped Input
│   │   │   ├── Loader.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/                      # Application Layout
│   │   │   ├── Navbar.tsx               # Top app bar
│   │   │   ├── Sidebar.tsx              # Navigation panel
│   │   │   └── Footer.tsx
│   │   └── recipes/                     # Recipe related components used globally
│   │       ├── RecipeCard.tsx           # Individual recipe display card
│   │       ├── RecipeGrid.tsx           # Infinite scroll wrapper
│   │       └── CommentSection.tsx
│   ├── features/                        # Redux Logic & Async Thunks
│   │   ├── auth/                        # Auth store
│   │   │   ├── authSlice.ts
│   │   │   └── authThunks.ts
│   │   ├── recipes/                     # Recipes & Feed store
│   │   │   ├── recipeSlice.ts
│   │   │   └── recipeThunks.ts
│   │   └── user/                        # Profile & follows store
│   │       └── userSlice.ts
│   ├── hooks/                           # Custom React Hooks
│   │   ├── useAuthAuth.ts
│   │   └── useInfiniteScroll.ts
│   ├── pages/                           # Route level view components
│   │   ├── Auth/                        # Login.tsx, Register.tsx
│   │   ├── Home/                        # FeedPage.tsx
│   │   ├── Recipe/                      # CreateRecipe.tsx, RecipeDetail.tsx
│   │   └── Profile/                     # UserProfile.tsx
│   ├── routes/                          # React Router definitions
│   │   ├── AppRouter.tsx
│   │   └── PrivateRoute.tsx
│   ├── services/                        # Axios HTTP logic
│   │   ├── api.ts                     # Axios instance setup & interceptors
│   │   ├── auth.service.ts
│   │   ├── recipe.service.ts
│   │   └── cloudinary.service.ts        # Direct Cloudinary upload helpers
│   ├── store/                           # Global Redux Store config
│   │   └── store.ts
│   ├── theme/                           # Core Design System
│   │   └── muiTheme.ts                  # Material UI customized theme
│   └── utils/                           # Tooling
│       ├── validationSchemas.ts         # Zod or Yup schema definitions
│       └── formatters.ts
├── tailwind.config.js                   # Tailwind standard configuration
└── vite.config.ts                       # Vite tooling setup
```

## Verification Plan
### Automated Tests
* Unit tests in JUnit and React Testing Library covering utility parsing, JWT signing, state logic, and simple rendering.
### Manual Verification
* Run local `docker-compose up` verifying PostgreSQL readiness.
* Use Swagger UI & Postman against local Backend server targeting JWT generation.
* Run Vite frontend, log in, sign via backend, then upload mock files using Cloudinary component directly in the React frontend.
