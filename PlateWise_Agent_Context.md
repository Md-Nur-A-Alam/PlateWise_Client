# PROJECT CONTEXT — READ AND FOLLOW EXACTLY. DO NOT DEVIATE.

This document is the single source of truth for this project. Before writing any code, re-check every decision against this file. If a later prompt seems to conflict with this file, this file wins unless I explicitly say "override context."

---

## 1. Identity

- **Project name:** PlateWise
- **Tagline:** AI-Powered Recipe & Meal Planning Platform
- **One-liner:** Users browse, publish, and rate recipes; logged-in users can generate new recipes with AI and get AI-personalized meal recommendations.
- **This is a NEW, standalone project.** Do not reference, port, or reuse code/architecture from any other project (e.g., ServiceHub, CueKeep, AIUB_HRMS). No shared naming, no shared schema, no copy-pasted boilerplate from those.

## 2. Non-negotiable tech stack

Do not swap, add, or "upgrade" any of these without being asked.

| Layer | Choice |
|---|---|
| Frontend | Next.js 15, TypeScript (strict), Tailwind CSS |
| Data fetching | TanStack Query |
| Charts | Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas via Mongoose |
| Auth | Better Auth (email/password + Google OAuth) |
| AI | Google Gemini API only |

**Explicitly NOT used in this project:** Redis, Pusher, ImgBB/Cloudinary (image field is a plain URL string, no upload pipeline), any other LLM provider, any UI kit beyond Tailwind (no DaisyUI/shadcn unless I ask).

**Resolved conflict (2026-07-19):** The bootstrapped repos initially had `@upstash/redis`, `pusher`, `pusher-js`, and `daisyui` installed — leftovers from a template, not an intentional choice for this project. **Uninstall all four** and remove them from `installed_packages.txt`. This project uses Tailwind only, no realtime pub/sub layer, no separate cache layer.

**Server also needs TypeScript set up from scratch** — the bootstrapped `plate-wise_server` is currently a bare `index.js` with no `src/` folder and no TS config. Add `typescript`, `ts-node` (or `tsx`), `@types/node`, `@types/express`, `@types/cors`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/morgan`, and a `tsconfig.json`, then migrate to the `src/` structure defined in the build prompts before writing any feature code. Also install the missing pieces: Gemini SDK (`@google/genai`) on the server, and `react-toastify` on the client.

## 3. Repository structure

Two separate repos:
- `plate-wise-client` — Next.js app
- `plate-wise_server` — Express API

Do not merge them into a monorepo unless told to.

## 4. Global UI rules (enforce on every page/component)

- Maximum 3 primary colors + 1 neutral. Pick them once, define as Tailwind theme tokens, reuse everywhere — never introduce a new ad hoc color.
- Every card component (recipe cards, etc.) must share identical height, width, border radius, and shadow/border style. Build one `<RecipeCard>` component and reuse it everywhere — never create a second, slightly different card.
- No lorem ipsum, no placeholder text, no "Sample Recipe 1"-style dummy data in the final build. Seed data must look like real recipes.
- Fully responsive at mobile, tablet, desktop breakpoints — test every page at all three before considering it done.

## 5. Exact page list — build only these, nothing extra unless asked

**Public:**
1. `/` — Home (navbar, hero 60–70vh, 7+ sections, footer)
2. `/recipes` — Explore/listing page (search, filter by cuisine + diet type, sort, pagination, skeleton loaders)
3. `/recipes/[id]` — Recipe details (images, description, ingredients/instructions, reviews, related recipes)
4. `/login`, `/register` — with validation, demo login button, Google OAuth
5. `/about`, `/contact`

**Protected (redirect to `/login` if not authenticated):**
6. `/recipes/add` — create recipe form
7. `/recipes/manage` — table/grid of the logged-in user's own recipes, View + Delete
8. `/ai/generate` — AI Content Generator UI
9. `/ai/recommendations` — AI Recommendation Engine UI

Do not invent additional pages/routes without asking.

## 6. Data model — use exactly these fields (extend only if asked)

**User:** name, email, passwordHash (if local), provider, dietaryPreferences[], allergies[], createdAt

**Recipe:** title, shortDescription, fullDescription/instructions, ingredients[], images[] (URLs), cuisine, dietType[], cookTimeMinutes, difficulty, authorId, avgRating, createdAt

**Review:** recipeId, userId, rating, comment, createdAt

**Interaction:** userId, recipeId, type (view/like), createdAt

## 7. AI features — implement exactly these two, no more

**AI Content Generator** (`/ai/generate`): input = ingredients, cuisine, servings, desired length. Calls Gemini, returns structured JSON (title, description, ingredients, numbered instructions). Must support Regenerate and be editable before saving.

**AI Smart Recommendation Engine** (`/ai/recommendations`): uses stored dietary preferences/allergies + Interaction history (views/likes) to rank candidate recipes, excluding anything matching an allergy. Include a short one-line "why recommended" per item, generated via Gemini. Must support filter refinement (diet type, max cook time) and a "Refresh" action.

Do not add a chatbot, image analyzer, or any third AI feature unless I explicitly ask for it.

## 8. Auth requirements

- Email/password registration and login with real validation and real error messages (no silent failures).
- A visible "Demo Login" button that auto-fills a seeded demo account's credentials and logs in — this account must actually exist in the seed data.
- Google OAuth login must work end-to-end (real Google Cloud OAuth client, not a mock).

## 8.1 Auth architecture — Better Auth + JWT + route protection (exact method, do not improvise a different one)

Better Auth is the **only** system that creates accounts, hashes passwords, and manages sessions. Do not build a second, parallel auth system.

1. **Better Auth runs on `plate-wise-client`** (Next.js) via its route handler at `app/api/auth/[...all]/route.ts`. It owns registration, login, Google OAuth, session cookies, and password hashing internally.
2. **Enable Better Auth's `jwt` (and `bearer`) plugin** so it can mint a signed JWT for cross-service calls, signed with `BETTER_AUTH_SECRET`.
3. **Server Actions** in `actions/` (which run on the Next.js server, not the browser) read the current Better Auth session, take its JWT, and attach it as `Authorization: Bearer <token>` when calling the Express API. The browser never talks to Express directly.
4. **Express (`plate-wise_server`) never issues or hashes anything.** Its `middleware/auth.middleware.ts` only *verifies* incoming tokens using the `jsonwebtoken` package's `verify()` against the shared `BETTER_AUTH_SECRET`, and rejects with 401 if invalid/missing. This is why `jsonwebtoken` is a legitimate dependency here — keep it, but only for verification, not for issuing new tokens.
5. **`bcryptjs` is not used anywhere in this project's own code** — Better Auth handles password hashing internally. Leave it uninstalled from active use (fine if it stays in `package.json` from the bootstrap, but don't write code that calls it).
6. **Route protection exists at two independent layers** and both must actually work, not just one:
   - Next.js: `middleware.ts` + `ProtectedLayout` (Step 7 of the build prompts) guard the protected route group and redirect unauthenticated users to `/login`.
   - Express: `auth.middleware.ts` guards mutating/protected endpoints (`POST /api/recipes`, `DELETE /api/recipes/:id`, `POST /api/ai/*`) independently of the frontend — the API must refuse an unauthenticated request even if someone bypasses the Next.js UI.
7. Recipe **reads** (`GET /api/recipes`, `GET /api/recipes/:id`) stay public/unauthenticated on the Express side, per the SRS.

## 9. Environment variables (names to use exactly, so my `.env` files match your code)

Backend: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`
Frontend: `NEXT_PUBLIC_API_URL`

Never hardcode secrets or commit `.env` files.

## 10. Working method — how I want you to operate

- Work in the order I give you in each prompt. Do not jump ahead to later phases (e.g., don't build AI features before the core recipe CRUD and auth are working).
- Before generating a new page or component, check whether an equivalent already exists in this codebase and reuse/extend it instead of duplicating.
- If something in a new instruction conflicts with this context file, flag the conflict instead of silently picking one.
- If a requirement is ambiguous, make the smallest reasonable assumption consistent with this document and note the assumption — don't invent unrelated features "to be helpful."
- Keep the three-color rule and the single reusable `RecipeCard` component in mind on every UI-related prompt, even ones that don't mention them.

## 11. Definition of done (check before marking any phase complete)

- [ ] No placeholder/dummy content visible in the running app
- [ ] All cards visually identical (size, radius, spacing)
- [ ] Only 3 primary + 1 neutral color in use
- [ ] Protected routes actually redirect unauthenticated users (Next.js layer)
- [ ] Express API independently rejects unauthenticated requests to protected endpoints (backend layer), verified via `jsonwebtoken` against `BETTER_AUTH_SECRET`
- [ ] No Redis, Pusher, or DaisyUI present anywhere in either repo
- [ ] Demo login button works
- [ ] Google OAuth login works
- [ ] Both AI features call the real Gemini API (not mocked/hardcoded responses)
- [ ] Responsive at mobile/tablet/desktop