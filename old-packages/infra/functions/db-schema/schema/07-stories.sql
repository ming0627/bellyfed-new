-- Create user_stories table for ephemeral content (24-hour stories)
CREATE TABLE IF NOT EXISTS user_stories (
  story_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL, -- 'IMAGE', 'VIDEO'
  caption TEXT,
  dish_id VARCHAR(36),
  restaurant_id VARCHAR(36),
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 24 hours after creation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE SET NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE SET NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON user_stories(user_id);

-- Create index on expires_at for faster lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_user_stories_expires_at ON user_stories(expires_at);

-- Create story_views table to track who viewed a story
CREATE TABLE IF NOT EXISTS story_views (
  view_id VARCHAR(36) PRIMARY KEY,
  story_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES user_stories(story_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_story_view UNIQUE (story_id, user_id)
);

-- Create index on story_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id);

-- Create trigger to automatically update the updated_at column for story_views
DROP TRIGGER IF EXISTS update_story_views_updated_at ON story_views;
CREATE TRIGGER update_story_views_updated_at
BEFORE UPDATE ON story_views
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
