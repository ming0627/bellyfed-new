-- Create saved_items table for bookmarking restaurants, dishes, posts
CREATE TABLE IF NOT EXISTS saved_items (
  save_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  item_type VARCHAR(50) NOT NULL, -- 'RESTAURANT', 'DISH', 'POST'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_saved_item UNIQUE (user_id, item_id, item_type)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);

-- Create index on item_id and item_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_items_item_id_type ON saved_items(item_id, item_type);
