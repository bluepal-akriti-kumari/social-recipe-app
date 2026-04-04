# Recipe App: Application Run - Test Case Document

This document outlines the core test cases for the **Recipe App**, focusing on the primary user flows for "running the application." These scenarios ensure the system's stability across critical functional areas.

**Note**: All "Shopping List" related functionality has been intentionally excluded from this document as per current project configuration.

---

## 1. Core Authentication & Security
These cases ensure users can securely access and manage their accounts.

| Module | Test Case | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **Registration** | `Register Success` | User provides valid name, email, and strong password. | User is created and prompted for verification. |
| | `Duplicate User` | Attempt to register with an existing username/email. | System returns "Username/Email already taken" error. |
| **Login** | `Login Success` | Authenticate with correct credentials. | System issues a valid JWT token and redirects to Feed. |
| | `Invalid Login` | Authenticate with incorrect password. | System returns "Unauthorized" (401) error. |
| **Access Control** | `JWT Persistence` | Close and reopen browser after login. | User remains authenticated via stored token. |
| | `Protected Routes` | Access `/profile` without logging in. | System redirects user to Login page. |

---

## 2. Recipe Discovery & Search
Testing the primary content consumption experience.

| Module | Test Case | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **Explore Feed** | `Fetch Latest` | Load the landing page for the first time. | A list of recent published recipes is displayed. |
| | `Filter by Category` | Select "Dessert" or "Lunch" from categories. | Feed filters to show only recipes in that category. |
| **Search** | `Full-Text Search` | Search for "Pasta" in the search bar. | Recipes containing "Pasta" in title/ingredients appear. |
| | `Empty Search` | Search for a non-existent term (e.g., "Xyz123"). | "No recipes found" message is displayed. |
| **Detail View** | `Recipe Preview` | Click on a recipe card from the feed. | Full details (ingredients, steps, author) load correctly. |

---

## 3. Content Creation & Interaction
Ensuring users can contribute and engage with content.

| Module | Test Case | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **Creation** | `Create Recipe` | Submit a recipe with title, ingredients, and steps. | Recipe is saved and appears in the user's "My Recipes." |
| | `Draft vs Publish` | Create a recipe without marking "Published." | Recipe is visible only to the author. |
| **Interaction** | `Like Toggle` | Click the heart icon on a recipe. | Like count increments; icon changes color. |
| | `Add Comment` | Post a feedback comment on a recipe. | Comment appears at the bottom of the recipe detail view. |
| | `Bookmark` | Click the "Save" icon. | Recipe is added to the user's Bookmarks collection. |

---

## 4. Premium Features & AI
Testing value-add features for subscribed users.

| Module | Test Case | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **Subscription** | `Stripe Checkout` | Click "Upgrade to Premium" and complete flow. | User account status updates to "PREMIUM." |
| | `Premium Access` | Access a recipe marked "Premium Only." | Allowed for Premium users; blocked for free users. |
| **AI Tips** | `Chef Tips` | Open "Get AI Tips" on a recipe page. | System generates context-aware tips using AI. |

---

## 5. Meal Planning & Social
Focusing on organization and community.

| Module | Test Case | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **Meal Planner** | `Schedule Meal` | Add a recipe to "Monday Lunch" in the calendar. | Recipe appears in the weekly planner view. |
| | `Remove Meal` | Delete an entry from the calendar. | Planner view updates to reflect the removal. |
| **Social** | `Follow User` | Click "Follow" on another chef's profile. | Follower count updates; following list stores the user. |
| | `Notifications` | Receive notification when someone likes your recipe. | Red dot appears on notification icon; alert list updates. |

---

## 6. Execution Instructions
To run these tests in the current environment:

### Automated Backend Tests
Run the following in the `/backend` directory:
```bash
mvn test
```

### Automated Frontend Tests
Run the following in the `/frontend` directory:
```bash
npm test
```

### Manual Verification Flow
1. Start Backend: `mvn spring-boot:run`
2. Start Frontend: `npm run dev`
3. Access `http://localhost:5173`
4. Follow the **Module** steps in the tables above.

---
*End of Document*
