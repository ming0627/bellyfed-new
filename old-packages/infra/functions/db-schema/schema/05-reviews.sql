-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  review_id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  visit_status VARCHAR(20) CHECK (visit_status IN ('VISITED', 'WANT_TO_VISIT', 'NOT_INTERESTED')),
  photo_urls TEXT[],
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on restaurant_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Create index on rating for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create trigger to automatically update the updated_at column for reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create review_likes table to track likes on reviews
CREATE TABLE IF NOT EXISTS review_likes (
  like_id VARCHAR(36) PRIMARY KEY,
  review_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_review_like UNIQUE (review_id, user_id)
);

-- Create index on review_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON review_likes(user_id);

-- Create review_comments table
CREATE TABLE IF NOT EXISTS review_comments (
  comment_id VARCHAR(36) PRIMARY KEY,
  review_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on review_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_review_comments_user_id ON review_comments(user_id);

-- Create trigger to automatically update the updated_at column for review_comments
DROP TRIGGER IF EXISTS update_review_comments_updated_at ON review_comments;
CREATE TRIGGER update_review_comments_updated_at
BEFORE UPDATE ON review_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
