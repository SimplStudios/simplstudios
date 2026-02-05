-- Complete Database Schema for SimplStudios Website
-- Run this in Neon PostgreSQL console to set up your database
-- Updated: 2026-02-05

-- ============================================
-- DROP EXISTING TABLES (if needed for fresh start)
-- ============================================
-- Uncomment these lines if you need to reset the database:
-- DROP TABLE IF EXISTS "post_likes" CASCADE;
-- DROP TABLE IF EXISTS "comments" CASCADE;
-- DROP TABLE IF EXISTS "posts" CASCADE;
-- DROP TABLE IF EXISTS "reviews" CASCADE;
-- DROP TABLE IF EXISTS "testimonials" CASCADE;
-- DROP TABLE IF EXISTS "updates" CASCADE;
-- DROP TABLE IF EXISTS "apps" CASCADE;
-- DROP TABLE IF EXISTS "users" CASCADE;

-- ============================================
-- APPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "apps" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "screenshots" TEXT[] DEFAULT '{}',
    "features" TEXT[] DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'live',
    "url" TEXT,
    "platforms" TEXT[] DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "apps_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "apps_slug_key" UNIQUE ("slug")
);

-- ============================================
-- UPDATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "updates" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "app_slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT,
    "type" TEXT NOT NULL DEFAULT 'update',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "updates_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "testimonials" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "app_slug" TEXT,
    "author" TEXT NOT NULL,
    "role" TEXT,
    "avatar" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- USERS TABLE (Admin accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- ============================================
-- POSTS TABLE (Message Board - replaces Announcements)
-- ============================================
CREATE TABLE IF NOT EXISTS "posts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'announcement',
    "image_url" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- COMMENTS TABLE (Comments on posts)
-- ============================================
CREATE TABLE IF NOT EXISTS "comments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "post_id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") 
        REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- POST LIKES TABLE (Like tracking for posts)
-- ============================================
CREATE TABLE IF NOT EXISTS "post_likes" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "post_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "post_likes_post_id_session_id_key" UNIQUE ("post_id", "session_id"),
    CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") 
        REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- REVIEWS TABLE (User reviews for apps)
-- ============================================
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "app_slug" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "email" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "admin_response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_app_slug_fkey" FOREIGN KEY ("app_slug") 
        REFERENCES "apps"("slug") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS "posts_pinned_created_idx" ON "posts"("pinned" DESC, "created_at" DESC);
CREATE INDEX IF NOT EXISTS "comments_post_id_idx" ON "comments"("post_id");
CREATE INDEX IF NOT EXISTS "post_likes_post_id_idx" ON "post_likes"("post_id");
CREATE INDEX IF NOT EXISTS "reviews_app_slug_idx" ON "reviews"("app_slug");
CREATE INDEX IF NOT EXISTS "reviews_approved_idx" ON "reviews"("approved");
CREATE INDEX IF NOT EXISTS "updates_app_slug_idx" ON "updates"("app_slug");

-- ============================================
-- SAMPLE DATA (Optional - uncomment to add)
-- ============================================

-- Sample admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- INSERT INTO "users" ("email", "password", "name", "role") VALUES
-- ('admin@simplstudios.com', '$2b$10$hashedpasswordhere', 'Admin', 'admin');

-- Sample app
-- INSERT INTO "apps" ("name", "slug", "tagline", "description", "icon", "color", "status", "url", "features", "platforms") VALUES
-- ('SimplStudy', 'simplstudy', 'AI-Powered Learning', 'The ultimate study companion powered by AI.', '/icons/simplstudy.png', 'blue', 'live', 'https://simplstudy.com', ARRAY['AI Tutoring', 'Flashcards', 'Quizzes'], ARRAY['Web', 'iOS', 'Android']);

-- Sample post
-- INSERT INTO "posts" ("title", "content", "type", "pinned") VALUES
-- ('Welcome to SimplStudios!', 'We are excited to launch our new website. Stay tuned for updates!', 'announcement', true);

-- ============================================
-- MIGRATION HELPER (if you have old announcements table)
-- ============================================
-- If you had an "announcements" table before, you can migrate like this:
-- INSERT INTO "posts" ("title", "content", "type", "pinned", "created_at")
-- SELECT "message" as title, "message" as content, 'announcement' as type, false as pinned, "created_at"
-- FROM "announcements" WHERE "active" = true;
-- DROP TABLE "announcements" CASCADE;
