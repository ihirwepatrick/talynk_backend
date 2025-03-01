-- SQL query to update the posts table to match the Sequelize model

-- First, let's create a backup of the current table
CREATE TABLE posts_backup AS SELECT * FROM posts;

-- Now, let's modify the posts table to match the model
ALTER TABLE posts
  -- Change id to integer with autoincrement if it's not already
  ALTER COLUMN id TYPE INTEGER USING (id::text::integer),
  
  -- Add unique_traceability_id if it doesn't exist
  ADD COLUMN IF NOT EXISTS unique_traceability_id VARCHAR(255) UNIQUE,
  
  -- Ensure title is not null
  ALTER COLUMN title SET NOT NULL,
  
  -- Add content column if it doesn't exist
  ADD COLUMN IF NOT EXISTS content TEXT,
  
  -- Ensure status has default 'pending'
  ALTER COLUMN status SET DEFAULT 'pending',
  
  -- Add views, likes, shares columns if they don't exist
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0,
  
  -- Rename video_url to videoUrl if needed
  RENAME COLUMN video_url TO videoUrl;

-- Create a sequence for the id column if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS posts_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- Set the sequence owner to the posts.id column
ALTER SEQUENCE posts_id_seq OWNED BY posts.id;

-- Set the default value for id to use the sequence
ALTER TABLE posts ALTER COLUMN id SET DEFAULT nextval('posts_id_seq');

-- Update the sequence to the max id value
SELECT setval('posts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM posts), true);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_posts_user' AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts
      ADD CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$; 