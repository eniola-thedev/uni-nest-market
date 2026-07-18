This is a large MVP. I'll build it in phases so we can validate each layer before stacking the next. Everything below uses your requested stack: React + TypeScript + Tailwind on TanStack Start, Lovable Cloud (Supabase under the hood) for auth/DB/storage/realtime, and Paystack for listing payments.

## Phase 1 — Foundation (this phase)
1. Enable Lovable Cloud (database, auth, storage, realtime, server functions).
2. Design system: emerald green + dark navy + light gray, Inter/Poppins, rounded cards, mobile-first tokens in `src/styles.css`.
3. Public marketing home at `/` — hero, how it works, universities, CTA to sign up.
4. Auth: email/password sign up + login + password reset. Registration collects full name, email, phone, password, university (UNILORIN / Al-Hikmah / KWASU), department, level, matric number, profile picture.
5. Database schema + RLS + storage buckets:
   - `profiles`, `user_roles` (admin role via `has_role` security definer), `verifications`, `listings`, `offers`, `messages`, `reviews`, `payments`, `reports`, `saved_listings`.
   - Buckets: `avatars` (public), `student-ids` (private), `listing-images` (public).
6. Protected app shell under `_authenticated/`: header with search, nav (Home, Sell, Messages, Saved, Profile).

## Phase 2 — Verification + Listings
7. Verification flow: upload student ID → status PENDING/APPROVED/REJECTED. Only APPROVED users can create listings.
8. Create listing wizard (draft) → categories, condition, negotiable, up to 5 images, location (university → living type → hostel/area).
9. Marketplace feed with categories, featured section, final-year clearance section, product cards.
10. Product detail page, save/unsave, report listing, seller profile.
11. Search + filters (keyword, category, price, university, area, condition, date).
12. Listing lifecycle: DRAFT → PAYMENT_PENDING → ACTIVE → SOLD/EXPIRED/REMOVED. Mark as sold with confirmation. 30-day expiry field (`expires_at`) + reactivate.

## Phase 3 — Payments (Paystack)
13. Ask user for Paystack **secret key** (stored via add_secret) and publishable key.
14. Plans: Basic ₦200, Featured ₦500, Graduation Clearance ₦1,500.
15. Server function initializes Paystack transaction; public webhook route `/api/public/webhooks/paystack` verifies signature and activates listing. Never trust frontend.

## Phase 4 — Interaction layer
16. Offers (accept/reject/counter, history).
17. Realtime buyer↔seller chat scoped to a listing.
18. Ratings + reviews after transaction, aggregated on profile.

## Phase 5 — Admin + Trust
19. Admin dashboard (role-gated): verification queue, users, listings moderation, payments/revenue, reports, analytics.
20. Report user/listing, block user.
21. Expiry reminder logic (7-day flag surfaced in "My Listings").

## Technical notes
- All privileged reads/writes go through `createServerFn` with `requireSupabaseAuth`; Paystack webhook uses a public server route with HMAC verification.
- Roles stored in `user_roles` table with `has_role()` security definer (never on profiles).
- Every table gets explicit GRANTs + RLS policies scoped to `auth.uid()`.
- Public marketplace listings get a narrow `TO anon` SELECT policy so the feed can render server-side.

## What I need from you before Phase 3
- Paystack **test** secret key (`sk_test_...`) and public key (`pk_test_...`).
- Confirmation that ₦200 / ₦500 / ₦1,500 pricing is final for MVP.

## Starting now
If you approve, I'll execute Phase 1 in the next turn (Cloud enable + design system + landing + auth + full schema + protected shell). Phases 2–5 follow in sequence; I'll pause before Phase 3 to collect Paystack keys.