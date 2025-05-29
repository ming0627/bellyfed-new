-- Migration script for rankings feature
-- Creates tables for dishes, user rankings, and ranking photos

-- Dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  restaurant_id VARCHAR(36) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  spicy_level INT DEFAULT 0,
  price DECIMAL(10, 2),
  country_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (slug, country_code),
  INDEX (restaurant_id),
  INDEX (category),
  INDEX (country_code)
);

-- User Rankings table
CREATE TABLE IF NOT EXISTS user_rankings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  dish_id VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36) NOT NULL,
  dish_type VARCHAR(100),
  rank INT,
  taste_status ENUM('ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, dish_id),
  INDEX (user_id),
  INDEX (dish_id),
  INDEX (restaurant_id),
  INDEX (rank),
  INDEX (taste_status),
  CONSTRAINT check_ranking_type CHECK (
    (rank IS NOT NULL AND taste_status IS NULL) OR
    (rank IS NULL AND taste_status IS NOT NULL)
  )
);

-- Ranking Photos table
CREATE TABLE IF NOT EXISTS ranking_photos (
  id VARCHAR(36) PRIMARY KEY,
  ranking_id VARCHAR(36) NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (ranking_id),
  FOREIGN KEY (ranking_id) REFERENCES user_rankings(id) ON DELETE CASCADE
);

-- Create a dedicated database user for the application
-- Note: This should be executed manually with appropriate credentials
-- CREATE USER 'bellyfed_app'@'%' IDENTIFIED BY 'strong-password-here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON bellyfed.* TO 'bellyfed_app'@'%';
-- FLUSH PRIVILEGES;
