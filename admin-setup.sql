-- Run this command in your database query editor (Supabase, Neon, or psql)

-- 1. Create the admin user (Password: admin123)
-- We are manually inserting this because we haven't built a signup page for admins yet.
INSERT INTO "users" (id, email, password, role, name, "created_at")
VALUES (
  'admin-user-id-123', 
  'admin@simplstudios.com', 
  '$2b$12$gaWvDhFxUS1JM7t.SN/dHOyD3mQn77NDtLOrPFpQiHCc/0bR4SASm', 
  'admin', 
  'Admin User', 
  NOW()
) 
ON CONFLICT (email) DO NOTHING;

-- 2. Verify it worked
SELECT * FROM "users";
