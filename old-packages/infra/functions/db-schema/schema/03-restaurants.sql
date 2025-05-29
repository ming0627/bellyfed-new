-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  restaurant_id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  country_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  website VARCHAR(255),
  email VARCHAR(255),
  cuisine_type VARCHAR(100),
  price_range VARCHAR(20),
  opening_hours JSONB,
  features JSONB,
  image_url TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants(name);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);

-- Create index on cuisine_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type);

-- Create index on country_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_country_code ON restaurants(country_code);

-- Create index on location for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);

-- Create trigger to automatically update the updated_at column for restaurants
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create restaurant_hours table
CREATE TABLE IF NOT EXISTS restaurant_hours (
  hours_id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  CONSTRAINT unique_restaurant_day UNIQUE (restaurant_id, day_of_week)
);

-- Create index on restaurant_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_hours_restaurant_id ON restaurant_hours(restaurant_id);

-- Create trigger to automatically update the updated_at column for restaurant_hours
DROP TRIGGER IF EXISTS update_restaurant_hours_updated_at ON restaurant_hours;
CREATE TRIGGER update_restaurant_hours_updated_at
BEFORE UPDATE ON restaurant_hours
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
