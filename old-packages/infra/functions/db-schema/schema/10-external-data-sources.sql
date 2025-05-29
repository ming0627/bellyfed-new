-- Create tables for tracking data imported from external sources like Google Maps API

-- Table to track external data sources
CREATE TABLE IF NOT EXISTS external_data_sources (
  source_id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  api_endpoint VARCHAR(255),
  auth_method VARCHAR(50),
  api_version VARCHAR(50),
  rate_limit_per_second INTEGER,
  rate_limit_per_day INTEGER,
  config JSONB, -- Store API-specific configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Google Maps as a data source
INSERT INTO external_data_sources (
  source_id,
  name,
  description,
  api_endpoint,
  auth_method,
  api_version,
  rate_limit_per_second,
  rate_limit_per_day,
  config
)
VALUES
  (
    'google-maps',
    'Google Maps API',
    'Google Maps Platform API for Places, Geocoding, etc.',
    'https://maps.googleapis.com',
    'API_KEY',
    'v3',
    100,
    100000,
    '{"places_api": {"enabled": true}, "geocoding_api": {"enabled": true}, "photos_api": {"enabled": true}}'
  )
ON CONFLICT (source_id) DO NOTHING;

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_external_data_sources_updated_at ON external_data_sources;
CREATE TRIGGER update_external_data_sources_updated_at
BEFORE UPDATE ON external_data_sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track Google Maps Place details
CREATE TABLE IF NOT EXISTS google_places (
  place_id VARCHAR(255) PRIMARY KEY, -- Google Place ID
  name VARCHAR(255) NOT NULL,
  formatted_address TEXT,
  location JSONB, -- lat/lng
  types TEXT[], -- place types from Google
  business_status VARCHAR(50),
  price_level INTEGER,
  rating DECIMAL(3, 1),
  user_ratings_total INTEGER,
  photos JSONB[], -- Array of photo references
  opening_hours JSONB,
  website VARCHAR(255),
  formatted_phone_number VARCHAR(50),
  international_phone_number VARCHAR(50),
  place_url VARCHAR(255), -- Google Maps URL
  raw_data JSONB, -- Complete API response
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for google_places
CREATE INDEX IF NOT EXISTS idx_google_places_name ON google_places(name);
CREATE INDEX IF NOT EXISTS idx_google_places_business_status ON google_places(business_status);
CREATE INDEX IF NOT EXISTS idx_google_places_last_updated ON google_places(last_updated);

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_google_places_updated_at ON google_places;
CREATE TRIGGER update_google_places_updated_at
BEFORE UPDATE ON google_places
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track imported restaurants from external sources
CREATE TABLE IF NOT EXISTS imported_restaurants (
  import_id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  source_id VARCHAR(36) NOT NULL,
  external_id VARCHAR(255) NOT NULL, -- e.g., Google Place ID
  import_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  raw_data JSONB, -- Store the original API response
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, DELETED, MERGED
  confidence_score DECIMAL(5, 2), -- Match confidence (0-100)
  match_method VARCHAR(50), -- How the match was determined (EXACT, FUZZY, MANUAL)
  last_verified TIMESTAMP WITH TIME ZONE, -- When the data was last verified
  verification_method VARCHAR(50), -- How the data was verified (API, MANUAL)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES external_data_sources(source_id) ON DELETE CASCADE,
  CONSTRAINT unique_restaurant_source UNIQUE (restaurant_id, source_id),
  CONSTRAINT unique_external_id_source UNIQUE (external_id, source_id)
);

-- Create indexes for imported_restaurants
CREATE INDEX IF NOT EXISTS idx_imported_restaurants_restaurant_id ON imported_restaurants(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_imported_restaurants_source_id ON imported_restaurants(source_id);
CREATE INDEX IF NOT EXISTS idx_imported_restaurants_external_id ON imported_restaurants(external_id);
CREATE INDEX IF NOT EXISTS idx_imported_restaurants_status ON imported_restaurants(status);
CREATE INDEX IF NOT EXISTS idx_imported_restaurants_confidence ON imported_restaurants(confidence_score);

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_imported_restaurants_updated_at ON imported_restaurants;
CREATE TRIGGER update_imported_restaurants_updated_at
BEFORE UPDATE ON imported_restaurants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track Google Maps menu data
CREATE TABLE IF NOT EXISTS google_menus (
  menu_id VARCHAR(36) PRIMARY KEY,
  place_id VARCHAR(255) NOT NULL, -- Google Place ID
  menu_type VARCHAR(50), -- e.g., REGULAR, BREAKFAST, LUNCH, DINNER
  menu_items JSONB[], -- Array of menu items
  source VARCHAR(50), -- e.g., GOOGLE_MAPS, THIRD_PARTY
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  raw_data JSONB, -- Complete API response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES google_places(place_id) ON DELETE CASCADE
);

-- Create indexes for google_menus
CREATE INDEX IF NOT EXISTS idx_google_menus_place_id ON google_menus(place_id);
CREATE INDEX IF NOT EXISTS idx_google_menus_menu_type ON google_menus(menu_type);
CREATE INDEX IF NOT EXISTS idx_google_menus_last_updated ON google_menus(last_updated);

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_google_menus_updated_at ON google_menus;
CREATE TRIGGER update_google_menus_updated_at
BEFORE UPDATE ON google_menus
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track imported dishes from external sources
CREATE TABLE IF NOT EXISTS imported_dishes (
  import_id VARCHAR(36) PRIMARY KEY,
  dish_id VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36) NOT NULL,
  source_id VARCHAR(36) NOT NULL,
  external_id VARCHAR(255), -- e.g., Google Place ID + menu item ID
  external_menu_id VARCHAR(255), -- Reference to the menu if applicable
  import_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  raw_data JSONB, -- Store the original API response
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, DELETED, MERGED
  confidence_score DECIMAL(5, 2), -- Match confidence (0-100)
  match_method VARCHAR(50), -- How the match was determined (EXACT, FUZZY, MANUAL)
  price_currency VARCHAR(10),
  price_amount DECIMAL(10, 2),
  dish_category VARCHAR(100),
  dish_attributes JSONB, -- e.g., {"spicy": true, "vegetarian": true}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES external_data_sources(source_id) ON DELETE CASCADE,
  CONSTRAINT unique_dish_source UNIQUE (dish_id, source_id)
);

-- Create indexes for imported_dishes
CREATE INDEX IF NOT EXISTS idx_imported_dishes_dish_id ON imported_dishes(dish_id);
CREATE INDEX IF NOT EXISTS idx_imported_dishes_restaurant_id ON imported_dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_imported_dishes_source_id ON imported_dishes(source_id);
CREATE INDEX IF NOT EXISTS idx_imported_dishes_external_id ON imported_dishes(external_id);
CREATE INDEX IF NOT EXISTS idx_imported_dishes_external_menu_id ON imported_dishes(external_menu_id);
CREATE INDEX IF NOT EXISTS idx_imported_dishes_status ON imported_dishes(status);
CREATE INDEX IF NOT EXISTS idx_imported_dishes_confidence ON imported_dishes(confidence_score);
CREATE INDEX IF NOT EXISTS idx_imported_dishes_category ON imported_dishes(dish_category);

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_imported_dishes_updated_at ON imported_dishes;
CREATE TRIGGER update_imported_dishes_updated_at
BEFORE UPDATE ON imported_dishes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track import jobs
CREATE TABLE IF NOT EXISTS import_jobs (
  job_id VARCHAR(36) PRIMARY KEY,
  source_id VARCHAR(36) NOT NULL,
  job_type VARCHAR(50) NOT NULL, -- RESTAURANT, DISH, MENU, etc.
  status VARCHAR(50) NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED, FAILED
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  success_records INTEGER DEFAULT 0,
  error_records INTEGER DEFAULT 0,
  error_details JSONB,
  parameters JSONB, -- Store job parameters
  region VARCHAR(100), -- Geographic region for the import
  search_query VARCHAR(255), -- Search query used for the import
  event_id VARCHAR(36), -- Reference to event that triggered this job
  created_by VARCHAR(36), -- User who created the job
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES external_data_sources(source_id) ON DELETE CASCADE
);

-- Create indexes for import_jobs
CREATE INDEX IF NOT EXISTS idx_import_jobs_source_id ON import_jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_job_type ON import_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_import_jobs_region ON import_jobs(region);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_by ON import_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_jobs_event_id ON import_jobs(event_id);

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_import_jobs_updated_at ON import_jobs;
CREATE TRIGGER update_import_jobs_updated_at
BEFORE UPDATE ON import_jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track API requests to external sources
CREATE TABLE IF NOT EXISTS external_api_requests (
  request_id VARCHAR(36) PRIMARY KEY,
  source_id VARCHAR(36) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL, -- GET, POST, etc.
  parameters JSONB,
  status_code INTEGER,
  response_time INTEGER, -- in milliseconds
  error_message TEXT,
  request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  job_id VARCHAR(36), -- Reference to import job if applicable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES external_data_sources(source_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES import_jobs(job_id) ON DELETE SET NULL
);

-- Create indexes for external_api_requests
CREATE INDEX IF NOT EXISTS idx_external_api_requests_source_id ON external_api_requests(source_id);
CREATE INDEX IF NOT EXISTS idx_external_api_requests_endpoint ON external_api_requests(endpoint);
CREATE INDEX IF NOT EXISTS idx_external_api_requests_status_code ON external_api_requests(status_code);
CREATE INDEX IF NOT EXISTS idx_external_api_requests_request_timestamp ON external_api_requests(request_timestamp);
CREATE INDEX IF NOT EXISTS idx_external_api_requests_job_id ON external_api_requests(job_id);

-- Add columns to restaurants table to track data source and verification
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'USER_CREATED',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by VARCHAR(36),
ADD COLUMN IF NOT EXISTS external_source_count INTEGER DEFAULT 0;

-- Add columns to dishes table to track data source and verification
ALTER TABLE dishes
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'USER_CREATED',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by VARCHAR(36),
ADD COLUMN IF NOT EXISTS external_source_count INTEGER DEFAULT 0;

-- Create a view to get restaurants with their Google Places data
CREATE OR REPLACE VIEW restaurant_with_google_data AS
SELECT
  r.restaurant_id,
  r.name AS restaurant_name,
  r.address,
  r.city,
  r.state,
  r.postal_code,
  r.country,
  r.country_code,
  r.latitude,
  r.longitude,
  r.cuisine_type,
  r.price_range,
  r.data_source,
  r.is_verified,
  gp.place_id AS google_place_id,
  gp.formatted_address AS google_address,
  gp.rating AS google_rating,
  gp.user_ratings_total AS google_reviews_count,
  gp.price_level AS google_price_level,
  gp.business_status AS google_business_status,
  gp.website AS google_website,
  gp.formatted_phone_number AS google_phone,
  ir.confidence_score AS match_confidence,
  ir.match_method,
  ir.last_verified
FROM restaurants r
LEFT JOIN imported_restaurants ir ON r.restaurant_id = ir.restaurant_id AND ir.source_id = 'google-maps'
LEFT JOIN google_places gp ON ir.external_id = gp.place_id
WHERE r.is_verified = TRUE OR ir.status = 'ACTIVE';

-- Create a function to update restaurant verification status
CREATE OR REPLACE FUNCTION update_restaurant_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the restaurant's verification status
  UPDATE restaurants
  SET
    is_verified = TRUE,
    verification_date = NEW.last_verified,
    external_source_count = (
      SELECT COUNT(*)
      FROM imported_restaurants
      WHERE restaurant_id = NEW.restaurant_id AND status = 'ACTIVE'
    )
  WHERE restaurant_id = NEW.restaurant_id;

  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create a trigger to update restaurant verification status
DROP TRIGGER IF EXISTS trigger_update_restaurant_verification ON imported_restaurants;
CREATE TRIGGER trigger_update_restaurant_verification
AFTER INSERT OR UPDATE ON imported_restaurants
FOR EACH ROW
WHEN (NEW.status = 'ACTIVE' AND NEW.last_verified IS NOT NULL)
EXECUTE FUNCTION update_restaurant_verification();
