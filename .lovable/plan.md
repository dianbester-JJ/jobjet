## Goal

- Move reviews off the listing page; show them only on the Pro's profile.
- Add a clickable Pro banner (avatar, name, star rating) on each listing that links to the Pro's profile.
- Build a real Pro Profile page (currently it uses mock data) with reviews and a "Recently Completed Jobs" section the Pro can post to.
- Add a "Profile" link under Pro Tools in the sidebar.

## Database changes

New table `completed_jobs` (Pro-posted portfolio entries, newest-first):

```text
completed_jobs
  id            uuid pk
  provider_id   uuid (auth user id)
  title         text
  description   text nullable
  image_urls    text[] default '{}'
  completed_at  date nullable
  created_at    timestamptz default now()
```

RLS:
- SELECT: public (anyone can view a Pro's portfolio).
- INSERT/UPDATE/DELETE: `auth.uid() = provider_id`.

Storage: reuse the existing public `listing-photos` bucket for completed-job images (folder `completed-jobs/<user_id>/...`).

No schema changes needed for reviews — they already join provider→reviews via `provider_id`.

## Page changes

### 1. `src/pages/ListingProfile.tsx`
- Remove the entire "Reviews" section (the heading, list, and image lightbox usage tied to it).
- Remove the `ReviewForm` block on this page (reviews now belong on the Pro profile page; we'll move review eligibility there).
- Replace the small "by {full_name}" line with a **Pro banner** card placed directly under the cover photo:
  - Avatar (`profiles.avatar_url`, fallback initials)
  - Pro name
  - Star + average rating + review count (computed from `reviews` already fetched, or fetched fresh)
  - Wrapped in `<Link to={`/pro/${listing.user_id}`}>` with hover styles.
- Keep the enquiry form, contact details sidebar, booking, etc. unchanged.

### 2. New page `src/pages/ProProfile.tsx` (route `/pro/:userId`)
Replaces the mock-data `ProviderProfile.tsx` for live Pro profiles. Fetches:
- `profiles` (full_name, avatar_url, location)
- All `provider_listings` for the Pro (approved) — shown as a small grid linking to each listing.
- All `reviews` where `provider_id = userId` (with reviewer names) — full reviews section moved here.
- All `completed_jobs` for the Pro, ordered `created_at desc`.
- Eligible bookings for the current viewer (any confirmed past booking with this provider not yet reviewed) → renders the existing `ReviewForm`.

Sections (top to bottom):
1. Header: avatar, name, location, average rating (X.X ⭐ · N reviews).
2. Listings strip: small cards linking to `/listing/:id`.
3. Recently Completed Jobs: gallery of cards (image(s), title, description, date) newest first. If the viewer **is** this Pro, show an "Add completed job" button that opens a dialog to upload images + title/description. Each owned card gets edit/delete controls.
4. Reviews: same review list UI currently on ListingProfile, plus the `ReviewForm` (when eligible).

### 3. `src/App.tsx`
- Add route `/pro/:userId` → `ProProfile`.
- Keep the old `/provider/:id` (mock) route for now or repoint it to `ProProfile`. Plan: repoint `/provider/:id` to `ProProfile` so all existing links keep working, and delete the unused `ProviderProfile.tsx`.

### 4. `src/components/AppSidebar.tsx`
Add a "Profile" item to `proNav`:
```text
{ title: "Profile", url: `/pro/${user.id}`, icon: User }
```
(Computed inside the component since it depends on `user.id`; render only when `isPro && user`.)

### 5. `src/components/ListingCard.tsx`
No change required for this request, but optionally also surface a tiny avatar — out of scope unless you want it.

## Files touched

- New: `src/pages/ProProfile.tsx`
- New: migration creating `completed_jobs` table + RLS policies
- Edit: `src/pages/ListingProfile.tsx` (remove reviews & review form, add Pro banner)
- Edit: `src/App.tsx` (add `/pro/:userId`, repoint `/provider/:id`)
- Edit: `src/components/AppSidebar.tsx` (Profile link in Pro Tools)
- Delete: `src/pages/ProviderProfile.tsx` (mock-data page no longer used)

## Out of scope

- Editing existing reviews.
- Reordering/sorting the completed-jobs gallery beyond newest-first.
- Showing the banner on listing cards in search results (only on the listing detail page, per the request).
