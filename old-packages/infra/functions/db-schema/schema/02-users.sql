-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(36) PRIMARY KEY,
  cognito_id VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  country_code VARCHAR(10),
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on cognito_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_cognito_id ON users(cognito_id);

-- Create index on country_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_country_code ON users(country_code);

-- Create trigger to automatically update the updated_at column for users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create user_followers table to track user relationships
CREATE TABLE IF NOT EXISTS user_followers (
  follow_id VARCHAR(36) PRIMARY KEY,
  follower_id VARCHAR(36) NOT NULL,
  followed_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (followed_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_follow UNIQUE (follower_id, followed_id)
);

-- Create index on follower_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_followers_follower_id ON user_followers(follower_id);

-- Create index on followed_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_followers_followed_id ON user_followers(followed_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  preference_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_user_preference UNIQUE (user_id, preference_key)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create trigger to automatically update the updated_at column for user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create user_activity_points table to track user engagement
CREATE TABLE IF NOT EXISTS user_activity_points (
  activity_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  reference_id VARCHAR(36),
  reference_type VARCHAR(50),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_activity_points_user_id ON user_activity_points(user_id);

-- Create index on activity_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_activity_points_activity_type ON user_activity_points(activity_type);

-- Create user_analytics_summary table
CREATE TABLE IF NOT EXISTS user_analytics_summary (
  user_id VARCHAR(36) PRIMARY KEY,
  total_rankings INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  influence_score DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create trigger to automatically update the updated_at column for user_analytics_summary
DROP TRIGGER IF EXISTS update_user_analytics_summary_updated_at ON user_analytics_summary;
CREATE TRIGGER update_user_analytics_summary_updated_at
BEFORE UPDATE ON user_analytics_summary
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create index on is_read for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create trigger to automatically update the updated_at column for notifications
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create events table to track system events
CREATE TABLE IF NOT EXISTS events (
  event_id VARCHAR(36) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  user_id VARCHAR(36),
  entity_id VARCHAR(36),
  entity_type VARCHAR(50),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create index on event_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

-- Create index on entity_id and entity_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_id, entity_type);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  badge_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_image_url TEXT,
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER DEFAULT 1,
  progress_data JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Create index on badge_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type);

-- Create trigger to automatically update the updated_at column for user_badges
DROP TRIGGER IF EXISTS update_user_badges_updated_at ON user_badges;
CREATE TRIGGER update_user_badges_updated_at
BEFORE UPDATE ON user_badges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
