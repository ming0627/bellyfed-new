-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  dish_id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  restaurant_id VARCHAR(36) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- Primary category for quick filtering
  image_url TEXT,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  spicy_level INT DEFAULT 0,
  price DECIMAL(10, 2),
  country_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- Create unique index on slug and country_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_dishes_slug_country ON dishes(slug, country_code);

-- Create index on restaurant_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON dishes(restaurant_id);

-- Create index on category for faster lookups
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);

-- Create index on country_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_dishes_country_code ON dishes(country_code);

-- Create trigger to automatically update the updated_at column for dishes
DROP TRIGGER IF EXISTS update_dishes_updated_at ON dishes;
CREATE TRIGGER update_dishes_updated_at
BEFORE UPDATE ON dishes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create dish_rankings table
CREATE TABLE IF NOT EXISTS dish_rankings (
  ranking_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  dish_id VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36) NOT NULL,
  dish_type VARCHAR(100),
  rank INT,
  taste_status VARCHAR(20) CHECK (taste_status IN ('ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED')),
  notes TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_ranking_type CHECK (
    (rank IS NOT NULL AND taste_status IS NULL) OR
    (rank IS NULL AND taste_status IS NOT NULL)
  ),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- Create unique index on user_id, dish_id, and restaurant_id
-- This allows users to rank the same dish at different restaurants
CREATE UNIQUE INDEX IF NOT EXISTS idx_dish_rankings_user_dish_restaurant ON dish_rankings(user_id, dish_id, restaurant_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_dish_rankings_user_id ON dish_rankings(user_id);

-- Create index on dish_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_dish_rankings_dish_id ON dish_rankings(dish_id);

-- Create index on restaurant_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_dish_rankings_restaurant_id ON dish_rankings(restaurant_id);

-- Create index on rank for faster lookups
CREATE INDEX IF NOT EXISTS idx_dish_rankings_rank ON dish_rankings(rank);

-- Create index on taste_status for faster lookups
CREATE INDEX IF NOT EXISTS idx_dish_rankings_taste_status ON dish_rankings(taste_status);

-- Create trigger to automatically update the updated_at column for dish_rankings
DROP TRIGGER IF EXISTS update_dish_rankings_updated_at ON dish_rankings;
CREATE TRIGGER update_dish_rankings_updated_at
BEFORE UPDATE ON dish_rankings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create ranking_history table to track changes
CREATE TABLE IF NOT EXISTS ranking_history (
  history_id VARCHAR(36) PRIMARY KEY,
  ranking_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  dish_id VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36) NOT NULL,
  dish_type VARCHAR(100),
  previous_rank INT,
  new_rank INT,
  previous_taste_status VARCHAR(20),
  new_taste_status VARCHAR(20),
  notes TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ranking_id) REFERENCES dish_rankings(ranking_id) ON DELETE CASCADE
);

-- Create index on ranking_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ranking_history_ranking_id ON ranking_history(ranking_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ranking_history_user_id ON ranking_history(user_id);

-- Create user_dish_stats table to track dish ranking counts for badges
CREATE TABLE IF NOT EXISTS user_dish_stats (
  stat_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  dish_id VARCHAR(36) NOT NULL,
  dish_type VARCHAR(100),
  total_rankings INTEGER DEFAULT 0,
  total_restaurants INTEGER DEFAULT 0,
  first_ranked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_ranked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
  CONSTRAINT unique_user_dish_stat UNIQUE (user_id, dish_id)
);

-- Create indexes for user_dish_stats
CREATE INDEX IF NOT EXISTS idx_user_dish_stats_user_id ON user_dish_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dish_stats_dish_id ON user_dish_stats(dish_id);

-- Create trigger to automatically update the updated_at column for user_dish_stats
DROP TRIGGER IF EXISTS update_user_dish_stats_updated_at ON user_dish_stats;
CREATE TRIGGER update_user_dish_stats_updated_at
BEFORE UPDATE ON user_dish_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
