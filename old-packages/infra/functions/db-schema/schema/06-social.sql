-- Create social_posts table for the social feed
CREATE TABLE IF NOT EXISTS social_posts (
  post_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  content TEXT,
  photo_urls TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  dish_id VARCHAR(36),
  restaurant_id VARCHAR(36),
  ranking_id VARCHAR(36),
  review_id VARCHAR(36),
  post_type VARCHAR(50) NOT NULL, -- 'RANKING', 'REVIEW', 'GENERAL', etc.
  visibility VARCHAR(20) DEFAULT 'PUBLIC', -- 'PUBLIC', 'FOLLOWERS', 'PRIVATE'
  country_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE SET NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE SET NULL,
  FOREIGN KEY (ranking_id) REFERENCES dish_rankings(ranking_id) ON DELETE SET NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE SET NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);

-- Create index on post_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_posts_post_type ON social_posts(post_type);

-- Create index on visibility for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);

-- Create index on country_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_posts_country_code ON social_posts(country_code);

-- Create index on created_at for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at);

-- Create index on dish_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_posts_dish_id ON social_posts(dish_id);

-- Create index on restaurant_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_posts_restaurant_id ON social_posts(restaurant_id);

-- Create trigger to automatically update the updated_at column for social_posts
DROP TRIGGER IF EXISTS update_social_posts_updated_at ON social_posts;
CREATE TRIGGER update_social_posts_updated_at
BEFORE UPDATE ON social_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create post_comments table for comments on social posts
CREATE TABLE IF NOT EXISTS post_comments (
  comment_id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  parent_comment_id VARCHAR(36), -- For nested comments/replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES post_comments(comment_id) ON DELETE CASCADE
);

-- Create index on post_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- Create index on parent_comment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_comment_id ON post_comments(parent_comment_id);

-- Create trigger to automatically update the updated_at column for post_comments
DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON post_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create post_likes table to track likes on posts
CREATE TABLE IF NOT EXISTS post_likes (
  like_id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- Create index on post_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- Create comment_likes table to track likes on comments
CREATE TABLE IF NOT EXISTS comment_likes (
  like_id VARCHAR(36) PRIMARY KEY,
  comment_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES post_comments(comment_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id)
);

-- Create index on comment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
