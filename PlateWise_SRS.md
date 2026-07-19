# Software Requirements Specification (SRS)
## PlateWise — AI-Powered Recipe & Meal Planning Platform

**Version:** 1.0
**Date:** July 19, 2026
**Prepared for:** Agentic AI Full Stack Project Submission

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for **PlateWise**, a full-stack web application that lets users discover, publish, and get AI-generated recipes, and receive AI-driven personalized meal recommendations. It is intended to guide design, implementation, and evaluation of the system.

### 1.2 Scope
PlateWise allows:
- Public users to browse, search, filter, and view recipes without an account.
- Registered users to publish, manage, and delete their own recipes.
- Registered users to generate new recipes using an LLM-based **AI Content Generator**.
- Registered users to receive personalized meal/recipe suggestions from an **AI Smart Recommendation Engine** based on stated dietary preferences and interaction history (views/likes).
- Authentication via email/password and Google OAuth, including a one-click demo login.

Out of scope: real payment processing, physical grocery ordering/delivery, native mobile apps.

### 1.3 Definitions, Acronyms, Abbreviations
| Term | Meaning |
|---|---|
| LLM | Large Language Model (Google Gemini API) |
| JWT | JSON Web Token |
| SRS | Software Requirements Specification |
| CRUD | Create, Read, Update, Delete |
| OAuth | Open Authorization (used here for Google login) |

### 1.4 References
- Project brief: "Agentic AI Project Requirements" (course/assignment document)
- Google Gemini API documentation
- Better Auth documentation
- MongoDB / Mongoose documentation

### 1.5 Overview
Section 2 describes the product at a high level. Section 3 lists detailed functional requirements grouped by module. Section 4 covers external interfaces. Section 5 covers non-functional requirements. Section 6 outlines the data model. Section 7 covers AI feature specifications in detail.

---

## 2. Overall Description

### 2.1 Product Perspective
PlateWise is a new, standalone two-repository system:
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + TanStack Query + Recharts
- **Backend:** Node.js + Express.js + TypeScript + MongoDB (Mongoose)
- **AI Provider:** Google Gemini API
- **Auth:** Better Auth (email/password + Google OAuth)

### 2.2 Product Functions (Summary)
1. Public recipe browsing, search, filtering, sorting, pagination
2. Recipe detail viewing with ratings/reviews and related recipes
3. User registration/login (email/password, Google OAuth, demo login)
4. Authenticated recipe creation and management (CRUD, own recipes only)
5. AI-generated recipe content from user-supplied ingredients/cuisine/servings
6. AI-personalized meal recommendations based on preferences and behavior
7. Static informational pages (About, Contact)

### 2.3 User Classes and Characteristics
| User class | Description | Access |
|---|---|---|
| Guest | Unauthenticated visitor | Browse, search, view recipe details |
| Registered User | Logged-in user | All guest actions + add/manage own recipes, AI Content Generator, AI Recommendations |
| Demo User | Seeded account for evaluators | Same as Registered User, pre-filled login |

### 2.4 Operating Environment
- Modern web browsers (Chrome, Firefox, Edge, Safari), desktop and mobile.
- Backend deployed on a Node-compatible host (e.g., Render/Railway).
- Frontend deployed on Vercel.
- Database: MongoDB Atlas (cloud).

### 2.5 Design and Implementation Constraints
- Maximum of 3 primary colors + 1 neutral, per global UI rules.
- All cards must share identical size, border radius, and layout.
- No placeholder/dummy content in the shipped product.
- TypeScript is mandatory on both frontend and backend.

### 2.6 Assumptions and Dependencies
- Gemini API key and quota are available and sufficient for demo usage.
- Google OAuth credentials are configured for both local and deployed origins.
- MongoDB Atlas free-tier cluster is sufficient for project scale.

---

## 3. Functional Requirements

### 3.1 Navigation & Layout
- FR-1: The system shall display a sticky/fixed navbar with at least 3 routes for guests and at least 5 routes for authenticated users.
- FR-2: The system shall display a footer with working internal links, contact information, and social links on every page.

### 3.2 Home Page
- FR-3: The system shall display a hero section constrained to 60–70% of viewport height, including a search call-to-action and an interactive element (carousel/animation).
- FR-4: The system shall display at least 7 distinct content sections (e.g., Featured Recipes, Cuisine Categories, How It Works, Platform Statistics, Testimonials, Newsletter Signup, FAQ).

### 3.3 Recipe Listing (Explore Page)
- FR-5: The system shall provide a search bar that filters recipes by title/ingredient keyword.
- FR-6: The system shall allow filtering by at least two fields: cuisine type and diet type (e.g., vegetarian, vegan, keto, gluten-free).
- FR-7: The system shall allow sorting by rating, newest, and cook time.
- FR-8: The system shall paginate or infinite-scroll recipe results.
- FR-9: The system shall display a skeleton loader while recipe data is loading.
- FR-10: The system shall display recipes as uniform cards (image, title, short description, cook time, difficulty, rating, "View Details" button), 4 per row on desktop.

### 3.4 Recipe Details Page
- FR-11: The system shall be publicly accessible without login.
- FR-12: The system shall display multiple images/media for a recipe where available.
- FR-13: The system shall display distinct sections: Description/Overview, Ingredients & Instructions (Key Information), Reviews/Ratings, and Related Recipes.

### 3.5 Authentication
- FR-14: The system shall provide registration and login forms with client- and server-side validation and error messaging.
- FR-15: The system shall provide a "Demo Login" button that auto-fills valid demo credentials and logs the user in.
- FR-16: The system shall support Google OAuth login.
- FR-17: The system shall issue and validate session tokens (via Better Auth) to protect authenticated routes.

### 3.6 Add Recipe (Protected)
- FR-18: The system shall restrict `/recipes/add` to authenticated users, redirecting unauthenticated users to `/login`.
- FR-19: The form shall capture: title, short description, full description/instructions, cook time (and/or difficulty), optional image URL(s).
- FR-20: The system shall persist a new recipe associated with the authenticated user's ID upon submission.

### 3.7 Manage Recipes (Protected)
- FR-21: The system shall restrict `/recipes/manage` to authenticated users.
- FR-22: The system shall list only the current user's recipes in a table/grid with View and Delete actions.
- FR-23: Delete actions shall require confirmation and shall only affect recipes owned by the requesting user.

### 3.8 AI Content Generator
- FR-24: The system shall accept user input (ingredients, cuisine, servings, desired length) and generate a complete recipe (title, description, step-by-step instructions) via the Gemini API.
- FR-25: The system shall allow the user to regenerate the AI output and to edit it before saving as a recipe.
- FR-26: The system shall support adjustable output length (e.g., short/detailed).

### 3.9 AI Smart Recommendation Engine
- FR-27: The system shall collect user dietary preferences and allergies during onboarding or from a profile setting.
- FR-28: The system shall generate personalized recipe/meal-plan recommendations based on stated preferences and recorded interactions (views, likes).
- FR-29: The system shall allow the user to refine recommendations via filters (diet type, max cook time).
- FR-30: The system shall update future recommendations based on new interactions (e.g., weighting recently liked cuisines higher).

### 3.10 Static Pages
- FR-31: The system shall provide an About page and a Contact page with working contact details/form.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- Responsive layouts for mobile, tablet, and desktop breakpoints.
- Consistent design tokens: max 3 primary colors + 1 neutral, uniform card styling and spacing across the app.

### 4.2 API Interfaces (Backend)
RESTful JSON API, e.g.:
- `POST /api/auth/*` — Better Auth endpoints (register, login, Google OAuth callback, session)
- `GET /api/recipes` — list with query params for search/filter/sort/pagination
- `GET /api/recipes/:id` — recipe detail
- `POST /api/recipes` — create (protected)
- `DELETE /api/recipes/:id` — delete own recipe (protected)
- `POST /api/ai/generate-recipe` — AI Content Generator (protected)
- `GET /api/ai/recommendations` — AI Recommendation Engine (protected)
- `POST /api/recipes/:id/reviews` — submit a rating/review (protected)

### 4.3 Software Interfaces
- MongoDB Atlas (data persistence)
- Google Gemini API (AI generation and recommendation logic)
- Google OAuth 2.0 (social login)

---

## 5. Non-Functional Requirements

- NFR-1 (Performance): Recipe listing pages shall load initial content within 2 seconds under normal network conditions, using pagination/infinite scroll to avoid over-fetching.
- NFR-2 (Security): Passwords shall be hashed; protected routes shall verify session/JWT server-side; users shall only be able to modify/delete their own data.
- NFR-3 (Usability): No lorem ipsum or placeholder content; all interactive elements shall be functional and clickable.
- NFR-4 (Responsiveness): All pages shall render correctly at mobile, tablet, and desktop breakpoints.
- NFR-5 (Reliability): AI generation failures (timeouts, API errors) shall be handled gracefully with a user-facing error state and retry option, without crashing the page.
- NFR-6 (Maintainability): Codebase shall use TypeScript throughout with a clear module/folder structure separating routes, controllers, models, and services.
- NFR-7 (Availability): Deployed frontend and backend shall be publicly reachable via a live URL for evaluation.

---

## 6. Data Model (High-Level)

**User**
`_id, name, email, passwordHash (if local), provider (local/google), dietaryPreferences[], allergies[], createdAt`

**Recipe**
`_id, title, shortDescription, fullDescription/instructions, ingredients[], images[], cuisine, dietType[], cookTimeMinutes, difficulty, authorId (ref User), avgRating, createdAt`

**Review**
`_id, recipeId (ref Recipe), userId (ref User), rating, comment, createdAt`

**Interaction** (for recommendation engine)
`_id, userId (ref User), recipeId (ref Recipe), type (view/like), createdAt`

---

## 7. AI Feature Specifications

### 7.1 AI Content Generator
- **Input:** ingredients (list), cuisine (enum/free text), servings (number), desired length (short/detailed)
- **Process:** Prompt template sent to Gemini API requesting structured JSON output (title, description, ingredients list, numbered instructions)
- **Output:** Editable draft populated into the Add Recipe form
- **Controls:** "Regenerate" button (re-calls API with same input), length toggle

### 7.2 AI Smart Recommendation Engine
- **Input:** user's stored dietary preferences/allergies, recent Interaction records (views/likes), optional filter refinements
- **Process:** Candidate recipes filtered by hard constraints (allergies excluded, diet type matched), then ranked using a weighted score combining recipe rating and interaction-based affinity (e.g., cuisines the user has liked recently score higher); Gemini API used to generate a short natural-language rationale per recommendation
- **Output:** A ranked list/weekly meal plan of recommended recipes with a one-line "why this was recommended" explanation
- **Controls:** Filter refinement (diet type, max cook time), "Refresh recommendations"

---

## 8. Appendix

### 8.1 Acceptance Criteria Checklist (maps to submission requirements)
- [ ] Navbar/hero/7+ sections/footer complete
- [ ] Card grid with skeleton loaders, 4/row desktop
- [ ] Public recipe details page
- [ ] Explore page with search, 2+ filters, sort, pagination
- [ ] Auth: register/login, demo login, Google login
- [ ] Protected Add Recipe page
- [ ] Protected Manage Recipes page
- [ ] About + Contact pages
- [ ] AI Content Generator implemented
- [ ] AI Smart Recommendation Engine implemented
- [ ] Fully responsive, no placeholder content
- [ ] Live URL + GitHub repos (frontend & backend) submitted
