# Recipe App: Comprehensive Test Case Document (100+ Cases)

This document provides a massive, detailed test suite for the **Recipe App**, covering User, Social, Premium, and **Admin** functionalities.

**Note**: "Shopping List" functionality is excluded from these test cases.

---

## 1. Authentication & Account Management (15 Cases)
*Ensures users can securely manage their identity and access.*

| # | Test Case | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| 1 | Register Success | Valid input (Name, unique Email, strong Password). | Account created; verification email sent. |
| 2 | Register Duplicate | Try to register with an existing username. | Error: "Username already exists." |
| 3 | Login Success | Provide correct credentials. | System issues JWT; user redirected to Feed. |
| 4 | Login Invalid | Provide wrong password. | Error: "Invalid credentials." |
| 5 | Login Locked | Try to login with a restricted/banned account. | Error: "Your account is restricted." |
| 6 | Forgot Password | Request reset link for a valid email. | Reset email sent with a unique token. |
| 7 | Forgot Password - Unknown | Request reset for an unregistered email. | "Email not found" message displayed. |
| 8 | Reset Password | Use a valid token to set a new password. | Password updated successfully. |
| 9 | Expired Token | Use an old/expired reset token. | Error: "Reset token has expired." |
| 10 | Change Profile Pix | Upload a new image to Cloudinary via profile. | Profile picture updates instantly. |
| 11 | Update Bio | Edit biography in user settings. | Bio is saved and visible on the public profile. |
| 12 | Logout | Click logout button. | JWT cleared from storage; redirected to Login. |
| 13 | Secure Route | Access `/admin` as a normal user. | "Access Denied" (403) or redirect to Home. |
| 14 | JWT Refresh | Token auto-appends to every request. | Request succeeds; user identity verified. |
| 15 | Password Strength | Register with a simplistic password (e.g., "123"). | Error: "Password is too weak." |

---

## 2. Admin Operations & Governance (20 Cases)
*Testing the control center and moderation features.*

| # | Test Case | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| 16 | Admin Fetch Users | Access "Manage Users" in Admin Dashboard. | List of all registered users is displayed. |
| 17 | Platform Stats | Check "Total Users" and "Total Recipes". | Correct counts from database are shown. |
| 18 | Restrict User | Toggle "Restrict" on a reported user. | User can no longer post recipes or comments. |
| 19 | Unrestrict User | Re-enable an account after restriction. | User regains full access to the platform. |
| 20 | Promote to Admin | Admin updates another user's role to ADMIN. | Target user gains access to Admin Dashboard. |
| 21 | Revoke Admin | Try to revoke the "Admin" role from another admin. | Allowed (or blocked if only one admin exists). |
| 22 | Manage All Recipes | List all recipes (published + drafts) in platform. | Admin sees every recipe regardless of state. |
| 23 | Delete Any Recipe | Admin deletes offensive content by another user. | Recipe is removed; audit log entry created. |
| 24 | Toggle Premium Fix | Admin marks a free recipe as "Premium Only". | Free users can no longer view the details. |
| 25 | View Audit Logs | Access "Audit Logs" to see history of admin actions. | Chronological list of who restricted whom and when. |
| 26 | Merge Users | Use Admin merging tool to link two accounts. | Data from source user is transferred to target. |
| 27 | Override Premium | Manually grant premium status to a loyalty user. | User's account flips to PREMIUM without Stripe. |
| 28 | Revoke Premium | Manually end a user's subscription early. | User loses premium badge and features. |
| 29 | Dashboard Guards | Direct URL access to `/api/admin/*` sans token. | Returns 401 Unauthorized. |
| 30 | Batch Action | Try to restrict multiple users at once. | Restriction applied across all selected accounts. |
| 31 | Audit - Recipe Delete | Log entry shows exactly which admin deleted a recipe. | High traceability for moderation. |
| 32 | Stats - Real-time | Create a new user; check stats dashboard. | Count increments by 1 immediately. |
| 33 | Verification Badge | Admin marks a chef as "Verified". | Checkmark appears next to chef's name on cards. |
| 34 | Support Override | Admin resets a user's password who lost access. | New temporary password generated. |
| 35 | Platform Maintenance | Admin toggles maintenance mode (if implemented). | Front-end shows "Scheduled Maintenance" banner. |

---

## 3. Recipe Management: Author Flow (15 Cases)
*Core lifecycle of content creation.*

| # | Test Case | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| 36 | Create Draft | Save a recipe without clicking "Publish". | Recipe appears in "My Drafts"; invisible on Feed. |
| 37 | Publish Recipe | Click "Post Recipe" from the editor. | Recipe appears on the public Global Feed. |
| 38 | Upload Multiple Photos | Add 3-5 images in the "Additional Photos" section. | Gallery renders correctly in Recipe Detail page. |
| 39 | Set Preparation Time | Edit "Prep Time" to 20 mins. | Correct timing displayed on recipe card. |
| 40 | Edit Published | Author changes ingredients on a published recipe. | Recipe updates; existing likes/comments remain. |
| 41 | Delete My Recipe | Author removes their own post. | Deleted from feed and author's profile. |
| 42 | Validation - Empty Title | Try to save a recipe with no title. | Error: "Title is required." |
| 43 | Minimum Ingredients | Submit recipe with 0 ingredients. | Error: "At least one ingredient is required." |
| 44 | Invalid Prep Time | Set prep time to -5 minutes. | Error: "Prep time cannot be negative." |
| 45 | Large Step count | Create a recipe with 25 cooking steps. | System handles pagination/scrolling of steps. |
| 46 | Cloudinary Failure | Upload a corrupted image file. | Error: "Image upload failed." |
| 47 | Auto-Save | Draft a recipe; refresh browser mid-way. | Draft persists in local storage or DB. |
| 48 | Category Change | Change "Italian" to "Healthy" after posting. | Cache invalidates; appears in "Healthy" filters. |
| 49 | Premium Toggle | Author marks their own recipe as "Premium". | Allowed only if Author is also a Premium user. |
| 50 | Servings Count | Change servings from 2 to 10. | No error; recipe detail updates. |

---

## 4. User Interactions & Social (15 Cases)
*Community engagement and feedback.*

| # | Test Case | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| 51 | Like Recipe | Click heart icon on a card. | Like count +1; heart stays red color. |
| 52 | Unlike Recipe | Click a colored heart icon. | Like count -1; heart turns grey. |
| 53 | Like Notification | User A likes User B's recipe. | User B receives a "User A liked your recipe" alert. |
| 54 | Follow User | Click "Follow" on a chef's profile. | Follow count +1; notifications for new recipes enabled. |
| 55 | Unfollow User | Click "Following" button. | Chef removed from "Users I Follow" list. |
| 56 | Add Comment | Type "Delicious!" and post to a recipe. | Comment appears at the bottom with author's avatar. |
| 57 | Reply to Comment | Post a reply to an existing comment. | Threaded comment appears nested beneath the original. |
| 58 | Delete My Comment | User removes their own feedback. | Comment is purged from the list. |
| 59 | Rate Recipe (1-5) | Select 4 stars on a recipe. | Average rating updates dynamically (e.g., 4.2 -> 4.3). |
| 60 | Multiple Ratings | Multiple users rate a recipe. | System calculates an accurate weighted average. |
| 61 | Report Comment | Mark person's comment as "Offensive". | Admin receives notification for pending review. |
| 62 | Report Recipe | Report a recipe for copyright violation. | Appears in Admin's "Mod Queue". |
| 63 | Mention User | @Username in a recipe description. | User mentioned receives a notification. |
| 64 | Feed Update | Follow a chef; wait for them to post. | New recipe appears at the top of "Followed" feed. |
| 65 | Comment Limit | Post 10 comments in 10 seconds. | Rate limiter triggers (Too many requests). |

---

## 5. Discovery & Search Experience (15 Cases)
*How users find the "Perfect Dish".*

| # | Test Case | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| 66 | Global Search | Search for "Mango". | Recipes with "Mango" in Title or Category appear. |
| 67 | Empty Results | Search for "XyzImpossibleString". | "No culinary treasures found" screen appears. |
| 68 | Category Filter | Click "Dessert" icon in Quick Bar. | Only dessert recipes are shown. |
| 69 | Sort by Newest | Apply "Newest First" filter. | Recent recipes (highest ID/Created Date) appear first. |
| 70 | Sort by Trending | Apply "Trending Now" filter. | Recipes with highest recent Like/View activity appear. |
| 71 | Time Filter | Filter for recipes under 30 mins (Prep+Cook). | All results are quick recipes. |
| 72 | Calorie Filter | Filter for recipes under 500 kcal. | Healthier options are filtered successfully. |
| 73 | Personalized Feed | Scroll through the main feed. | AI/Algorithm prioritizes followed authors. |
| 74 | Infinite Scroll | Reach bottom of recipes page. | Next page (nextCursor) loads automatically. |
| 75 | Recipe Recommendation | View a "Spaghetti" recipe. | "Related Recipes" section shows other Pasta. |
| 76 | Hero Carousel | Click featured recipe in Navbar carousel. | Redirects to the highlighted masterpiece detail. |
| 77 | Search Special Char | Search for "Pho (Traditional)". | Special characters are escaped; search works. |
| 78 | Mobile View Feed | View feed on a smartphone. | Responsive grid collapses to 1-column layout. |
| 79 | Offline Feed | Load feed without internet. | Show "Offline" notice + cached recipes. |
| 80 | Category Count | Check category bar badge numbers. | Match actual DB count for those tags. |

---

## 6. Premium Subscriptions & Stripe (10 Cases)
*Monetization and advanced content access.*

| # | Test Case | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| 81 | Trigger Checkout | Click "Get Premium" in Navbar. | Redirects to Stripe hosted checkout page. |
| 82 | Stripe Cancel | Click "Back" or "Cancel" on Stripe page. | Redirected to app with "Payment Cancelled" toast. |
| 83 | Stripe Success | Complete test payment (4242). | Redirected to app; user account level = PREMIUM. |
| 84 | Webhook Handling | Checkout succeeds at Stripe. | Webhook `session.completed` upgrades the DB user. |
| 85 | Locked Premium Recipe | Free user visits premium recipe direct URL. | "Upgrade Required" modal/overlay is shown. |
| 86 | Premium Experience | Premium user visits premium recipe. | Full recipe detail, cooking tips, and images are visible. |
| 87 | Subscription Status | Check "Level" on Profile Page. | Shows "Premium Chef" badge. |
| 88 | Webhook Security | Send a fake webhook to `/api/stripe/webhook` without sig. | Rejected with 400 Bad Request. |
| 89 | Access Expiration | Set subscription end date to yesterday. | Level reverts to FREE automatically. |
| 90 | Upsell Banner | Free user sees "Join Premium" ads. | Premium users have an ad-free/banner-free view. |

---

## 7. Organization & AI Logic (10 Cases)
*Advanced features including Meal Planning & Bookmarks.*

| # | Test Case | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| 91 | Bookmark Recipe | Click "Save" icon on a recipe card. | Added to "My Bookmarks" collection. |
| 92 | Remove Bookmark | Unclick "Save" icon. | Removed from "My Bookmarks". |
| 93 | Schedule Meal | drag-and-drop or select day in Meal Planner. | Recipe scheduled for selected date. |
| 94 | Meal Notification | Reaches 6:00 PM for a scheduled dinner. | Mobile/Web notification: "Time to cook Carbonara!" |
| 95 | Weekly Plan View | Switch to "Weekly View" in Planner. | Grid shows all 7 days with planned meals. |
| 96 | Delete Plan Entry | Clear "Thursday Lunch". | Entry disappears from planner. |
| 97 | AI Cooking Tip | Click "Get AI Tip" on a recipe. | System generates a tip (e.g., "Substitute butter for coconut oil for a vegan base"). |
| 98 | Contextual AI | Ask for tips on a Dessert recipe. | Tips are dessert-focused, not savory. |
| 99 | Planner Conflict | Schedule two recipes for the same time slot. | Alert: "Time conflict, are you sure?" |
| 100 | Sync with Mobile | Bookmark on Desktop, check mobile app. | Bookmarks are synced across all devices. |

---
*End of Comprehensive Suite*
