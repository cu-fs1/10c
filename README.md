# 10c

A full-stack community blogging platform built with Next.js 16, MongoDB, and Backblaze B2. Users can register, create posts with images, like posts from other users, and leave comments.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | MongoDB via Mongoose |
| Auth | JWT (jose) + HTTP-only cookies |
| Password hashing | Argon2 |
| File storage | Backblaze B2 (S3-compatible API) |
| State management | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| HTTP client | Axios |

---

## Project Structure

```
app/
  layout.tsx            # Root layout with Toaster
  page.tsx              # Home — community posts feed
  login/page.tsx        # Login page
  register/page.tsx     # Registration page
  my-posts/page.tsx     # Authenticated user's posts + post creation
  posts/[id]/page.tsx   # Single post view with comments

  api/
    auth/
      login/route.ts    # POST  — issue JWT cookie
      logout/route.ts   # POST  — clear JWT cookie
      register/route.ts # POST  — create user
      me/route.ts       # GET   — current session info
    posts/
      route.ts          # GET (paginated feed) / POST (create post)
      mine/route.ts     # GET   — current user's posts (paginated)
      [id]/
        route.ts        # GET / PUT / DELETE a single post
        like/route.ts   # POST  — toggle like
        comments/
          route.ts      # GET / POST comments on a post

components/
  PostCard.tsx          # Shared card UI for any post list
  PostsList.tsx         # Community feed with like interactions
  AddPostForm.tsx       # Create-post form with image upload
  CommentsSection.tsx   # Comments thread for a post
  AppHeader.tsx         # Top navigation bar
  NavUser.tsx           # User menu (avatar + logout)
  PostsPagination.tsx   # Page controls
  ClientOnly.tsx        # SSR guard wrapper
  ui/                   # shadcn/ui primitives

hooks/
  useRequireAuth.ts     # Redirect to /login if unauthenticated

store/
  useAuthStore.ts       # Zustand store — user + hydration state

lib/
  db.ts                 # Mongoose connection (singleton)
  jwt.ts                # signToken / verifyToken (jose, HS256, 7d expiry)
  api-utils.ts          # getSession, unauthorized, createAuthCookie helpers
  b2.ts                 # uploadImageToB2 — uploads to Backblaze B2 via S3 SDK
  utils.ts              # cn() class utility

models/
  User.ts               # Mongoose model — name, email, password (hashed)
  Post.ts               # Mongoose model — title, description, imageUrl, likes[]
  Comment.ts            # Mongoose model — postId, userId, content

services/
  posts.ts              # DB queries — create, read, update, delete, like, paginate
  comments.ts           # DB queries — get and create comments
```

---

## Authentication

- Registration hashes passwords with **Argon2**.
- Login issues a **signed JWT** (HS256, 7-day expiry) stored in an **HTTP-only cookie** named `token`.
- `getSession()` in `lib/api-utils.ts` reads and verifies this cookie on every protected API route.
- On the client, `useAuthStore` (Zustand + `localStorage` persistence) holds the user object. `useRequireAuth()` redirects to `/login` if the store is hydrated but empty.

---

## Image Uploads

Images attached to posts are uploaded directly to **Backblaze B2** via the S3-compatible API (`lib/b2.ts`). The returned public URL is stored in the `Post` document. The `next/image` hostname allowlist in `next.config.ts` is derived from `B2_PUBLIC_URL` so there is a single source of truth.

File validation (type + 5 MB size limit) is enforced on both the client (Zod schema in `AddPostForm`) and the server (`uploadImageToB2`).

---

## Pagination

Both the community feed (`/api/posts`) and the user's own posts (`/api/posts/mine`) support cursor-less offset pagination via `?page=` and `?limit=` query params. The UI uses `PostsPagination` to navigate pages.

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>

# JWT
JWT_SECRET=<random-secret>

# Backblaze B2
B2_KEY_ID=<key-id>
B2_APPLICATION_KEY=<application-key>
B2_BUCKET_NAME=<bucket-name>
B2_BUCKET_REGION=<region>          # e.g. us-east-005
B2_PUBLIC_URL=https://<bucket-name>.s3.<region>.backblazeb2.com
```

---

## Prerequisites

- Node.js 20+
- pnpm (recommended package manager for this repo)
- A running MongoDB instance (local or Atlas)
- A Backblaze B2 bucket with S3-compatible credentials

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

```bash
pnpm dev    # Run development server
pnpm build  # Build production bundle
pnpm start  # Run production server
pnpm lint   # Run ESLint checks
```

---

## Production Run

```bash
pnpm install
pnpm build
pnpm start
```
