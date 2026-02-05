-- ╔══════════════════════════════════════════════════════════════════╗
-- ║                                                                  ║
-- ║              📊 SIMPLSTUDIOS DATABASE SCHEMA                     ║
-- ║                                                                  ║
-- ║   Run this SQL in your Neon database console to create tables   ║
-- ║   Dashboard: https://console.neon.tech                           ║
-- ║                                                                  ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ============================================================
-- 🗑️ DROP EXISTING TABLES (if re-creating)
-- ============================================================
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS updates CASCADE;
DROP TABLE IF EXISTS apps CASCADE;

-- ============================================================
-- 📱 APPS TABLE - Your flagship products
-- ============================================================
CREATE TABLE apps (
    id VARCHAR(30) PRIMARY KEY DEFAULT concat('app_', substr(md5(random()::text), 1, 16)),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    tagline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT 'blue',
    screenshots TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'live',
    url VARCHAR(500),
    platforms TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_apps_status ON apps(status);

-- ============================================================
-- 📰 UPDATES TABLE - Changelog and announcements
-- ============================================================
CREATE TABLE updates (
    id VARCHAR(30) PRIMARY KEY DEFAULT concat('upd_', substr(md5(random()::text), 1, 16)),
    app_slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(50),
    type VARCHAR(50) DEFAULT 'update',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_updates_app_slug ON updates(app_slug);
CREATE INDEX idx_updates_created_at ON updates(created_at DESC);

-- ============================================================
-- 💬 TESTIMONIALS TABLE - User reviews and feedback
-- ============================================================
CREATE TABLE testimonials (
    id VARCHAR(30) PRIMARY KEY DEFAULT concat('tst_', substr(md5(random()::text), 1, 16)),
    app_slug VARCHAR(100),
    author VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    avatar VARCHAR(500),
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_testimonials_app_slug ON testimonials(app_slug);
CREATE INDEX idx_testimonials_featured ON testimonials(featured);

-- ============================================================
-- 🌱 SEED DATA - Your 3 Flagship Apps
-- ============================================================

INSERT INTO apps (name, slug, tagline, description, icon, color, screenshots, features, status, url, platforms) VALUES
(
    'SimplStudy',
    'simplstudy',
    'Your AI-powered study companion',
    'SimplStudy is the ultimate study tool designed by students, for students. Generate flashcards, summarize notes, quiz yourself, and master any subject with the power of AI. Built to make studying less painful and more effective.',
    '📚',
    'blue',
    ARRAY['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200', 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200'],
    ARRAY['AI-powered flashcard generation', 'Smart note summarization', 'Interactive quizzes', 'Progress tracking', 'Dark mode support', 'Export to PDF'],
    'live',
    'https://simplstudy.vercel.app',
    ARRAY['web']
),
(
    'SimplStream Web',
    'simplstream-web',
    'Stream anything, anywhere',
    'SimplStream Web brings entertainment to your browser. A clean, fast, and ad-free streaming experience. Watch your favorite content without the bloat of traditional streaming platforms.',
    '🌐',
    'violet',
    ARRAY['https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200'],
    ARRAY['Zero ads experience', 'HD streaming quality', 'Watchlist & favorites', 'Continue watching', 'Multiple sources', 'Fast search'],
    'live',
    'https://simplstream.vercel.app',
    ARRAY['web']
),
(
    'SimplStream TV',
    'simplstream-tv',
    'The ultimate living room experience',
    'SimplStream TV is our biggest project yet. A full-featured streaming application designed for your TV. Navigate with your remote, enjoy a beautiful 10-foot UI, and access all your content from the comfort of your couch. This is streaming, simplified.',
    '📺',
    'cyan',
    ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200', 'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=1200', 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=1200'],
    ARRAY['10-foot TV interface', 'Remote control navigation', 'Voice search support', '4K streaming', 'Profile switching', 'Parental controls', 'Chromecast support', 'Auto-play next episode'],
    'live',
    NULL,
    ARRAY['tv', 'android-tv', 'fire-tv', 'web']
);

-- ============================================================
-- 📰 SEED DATA - Updates/Changelog
-- ============================================================

INSERT INTO updates (app_slug, title, content, version, type) VALUES
('simplstudy', 'SimplStudy 2.0 is here!', 'We completely redesigned SimplStudy from the ground up. New AI models, faster performance, and a beautiful new interface. Your study sessions just got a major upgrade.', '2.0.0', 'release'),
('simplstudy', 'New: Export to PDF', 'You can now export your flashcards and notes directly to PDF. Perfect for printing or sharing with classmates.', '2.1.0', 'update'),
('simplstream-web', 'SimplStream Web Launch', 'We''re excited to announce the launch of SimplStream Web! Stream your favorite content directly in your browser with zero ads.', '1.0.0', 'release'),
('simplstream-web', 'New streaming sources added', 'We''ve added multiple new streaming sources for better availability and faster loading times.', '1.2.0', 'update'),
('simplstream-tv', 'SimplStream TV Beta', 'Our biggest project yet is now in beta! SimplStream TV brings the ultimate streaming experience to your living room.', '0.9.0', 'release'),
('simplstream-tv', 'Voice search is here', 'Search for movies and shows using just your voice. Compatible with Android TV and Fire TV remotes.', '1.0.0', 'release'),
('simplstream-tv', '4K streaming support', 'SimplStream TV now supports 4K streaming on compatible devices. Experience your content in stunning detail.', '1.1.0', 'update');

-- ============================================================
-- 💬 SEED DATA - Testimonials
-- ============================================================

INSERT INTO testimonials (app_slug, author, role, content, rating, featured) VALUES
('simplstudy', 'Alex Chen', 'Computer Science Student', 'SimplStudy literally saved my GPA. The AI flashcards are insanely good at picking out what''s important.', 5, TRUE),
('simplstudy', 'Maria Garcia', 'Medical Student', 'I use this every single day. The summarization feature helps me get through massive textbooks in half the time.', 5, TRUE),
('simplstream-web', 'Jake Thompson', 'Movie Enthusiast', 'Finally, a streaming site that doesn''t assault me with ads. Clean, fast, and actually works.', 5, FALSE),
('simplstream-tv', 'Sarah Kim', 'Parent', 'Set this up on our living room TV and the kids love it. The parental controls give me peace of mind.', 5, TRUE),
('simplstream-tv', 'David Park', 'Tech Reviewer', 'The best alternative TV streaming app I''ve tested. The 10-foot UI is beautifully designed.', 5, TRUE),
(NULL, 'Jordan Lee', 'Software Developer', 'SimplStudios builds quality apps. You can tell these are made by people who actually use what they build.', 5, TRUE);

-- ============================================================
-- ✅ VERIFICATION - Run these to check your data
-- ============================================================

-- Check all apps
-- SELECT name, slug, status, platforms FROM apps;

-- Check all updates
-- SELECT app_slug, title, version, type FROM updates ORDER BY created_at DESC;

-- Check all testimonials
-- SELECT author, app_slug, rating, featured FROM testimonials;

-- ============================================================
-- 🎉 DONE! Your database is ready.
-- ============================================================
