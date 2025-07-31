# Project Directory Overview: `/src`

This document provides a structured overview of the `/src` directory, grouping related files and folders with brief descriptions of their purpose.

---

## 🧭 Application Entry & Global Setup

- `middleware.js` — Middleware logic for handling requests globally.
- `app/` — Main application directory following Next.js App Router structure.
  - `layout.js` — Root layout component for consistent page structure.
  - `globals.css` — Global styles applied across the app.
  - `metadata.js` — Default metadata for the application.
  - `not-found.js` — Custom 404 page.
  - `page.js` — Home page of the application.

---

## 📄 Pages

- `about/page.js` — About page.
- `contact/page.js` — Contact page.
- `login/page.js` — Login page.
- `signup/page.js` — Signup page.
- `privacy/page.js` — Privacy policy page.
- `terms/page.js` — Terms and conditions page.

---

## 🧑 User Profile & Dashboard

- `dashboard/`
  - `page.js` — Dashboard landing page.
  - `metadata.js` — Metadata for dashboard.
  - `profile/page.js` — User profile section within dashboard.
- `profile/page.js` — General profile page.
- `profile/[slug]/` — Dynamic user profile pages.
  - `page.js` — Profile by slug.
  - `not-found.js` — 404 for invalid slugs.
- `settings/`
  - `page.js` — User settings page.
  - `loading.js` — Loading state for settings.
  - `not-found.js` — 404 for settings.

---

## 🔌 API Routes

- `api/auth/` — Authentication endpoints:
  - `login/route.js` — Login handler.
  - `signup/route.js` — Signup handler.
  - `refresh/route.js` — Token refresh.
  - `verify/route.js` — Email verification.
- `api/dev/domains/route.js` — Developer domain tools.
- `api/image-proxy/route.js` — Image proxying.
- `api/profile/[slug]/route.js` — Fetch profile by slug.
- `api/scrape/` — Scraping utilities:
  - `route.js` — General scrape.
  - `validate/route.js` — Scrape validation.
- `api/test-db/route.js` — Test database connection.
- `api/user/` — User-specific actions:
  - `delete/route.js` — Delete user.
  - `profile/route.js` — Get user profile.
- `api/users/` — User directory:
  - `[slug]/route.js` — Get user by slug.
  - `profile/route.js` — Get current user profile.
  - `search/route.js` — Search users.
- `api/vercel-env/route.js` — Vercel environment info.
- `api/wishlist/` — Wishlist management:
  - `route.js` — General wishlist handler.
  - `[id]/route.js` — Wishlist item by ID.

---

## 🧩 Components

- `components/` — Reusable UI and logic components:
  - `DeleteAccount.js` — Delete account button.
  - `Footer.js` — Site footer.
  - `GamingFeatures.js` — Gaming-related features.
  - `LoadingSpinner.js` — Loading indicator.
  - `Navbar.js` — Top navigation bar.
  - `OptimizedImage.js` — Image optimization wrapper.
  - `ProfileContent.js` — Profile display logic.
  - `ProfileWishlistItem.js` — Wishlist item in profile.
  - `SupportedSites.js` — List of supported sites.
  - `ThemeToggle.js` — Light/dark mode toggle.
  - `Wishlist.js` — Wishlist display.
  - `WishlistForm.js` — Form to add wishlist items.
  - `WishlistItem.js` — Individual wishlist item.
- `components/ui/Toast.js` — Toast notification component.

---

## ⚙️ Configuration

- `config/database.js` — Database connection config.
- `config/image-domains.js` — Allowed image domains.

---

## 🌐 Context Providers

- `contexts/AuthContext.js` — Authentication context.
- `contexts/ThemeContext.js` — Theme context.
- `contexts/ToastContext.js` — Toast notification context.
s
---

## 🧠 Utilities & Libraries

- `lib/apiClient.js` — Axios client for API calls.
- `lib/apiUtils.js` — API helper functions.
- `lib/auth.js` — Auth-related utilities.
- `lib/db.js` — DB connection logic.
- `lib/logger.js` — Logging utility.
- `lib/rateLimit.js` — Rate limiting middleware.
- `lib/scraper.js` — Web scraping logic.
- `lib/siteCategories.js` — Site categorization logic.

---

## 🧬 Models

- `models/User.js` — User schema/model.

---

## 🎨 Styles

- `styles/scrollbar-hide.css` — Utility to hide scrollbars.

---

## 🛠️ Utilities

- `utils/domain-logger.js` — Logs domain-related info.