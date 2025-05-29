-- Create tables for tracking events for EventBridge integration

-- Table to track event types
CREATE TABLE IF NOT EXISTS event_types (
  event_type_id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  schema JSONB, -- JSON schema for event data validation
  category VARCHAR(50), -- For grouping related events
  priority VARCHAR(20) DEFAULT 'NORMAL', -- HIGH, NORMAL, LOW
  retention_days INTEGER DEFAULT 90, -- How long to keep events of this type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert common event types
INSERT INTO event_types (event_type_id, name, description, schema, category, priority)
VALUES
  -- Restaurant events
  ('restaurant.created', 'Restaurant Created', 'A new restaurant has been created', '{"type": "object", "required": ["restaurantId"]}', 'RESTAURANT', 'NORMAL'),
  ('restaurant.updated', 'Restaurant Updated', 'A restaurant has been updated', '{"type": "object", "required": ["restaurantId"]}', 'RESTAURANT', 'NORMAL'),
  ('restaurant.deleted', 'Restaurant Deleted', 'A restaurant has been deleted', '{"type": "object", "required": ["restaurantId"]}', 'RESTAURANT', 'HIGH'),
  ('restaurant.viewed', 'Restaurant Viewed', 'A restaurant has been viewed', '{"type": "object", "required": ["restaurantId"]}', 'ANALYTICS', 'LOW'),

  -- Dish events
  ('dish.created', 'Dish Created', 'A new dish has been created', '{"type": "object", "required": ["dishId"]}', 'DISH', 'NORMAL'),
  ('dish.updated', 'Dish Updated', 'A dish has been updated', '{"type": "object", "required": ["dishId"]}', 'DISH', 'NORMAL'),
  ('dish.deleted', 'Dish Deleted', 'A dish has been deleted', '{"type": "object", "required": ["dishId"]}', 'DISH', 'HIGH'),
  ('dish.viewed', 'Dish Viewed', 'A dish has been viewed', '{"type": "object", "required": ["dishId"]}', 'ANALYTICS', 'LOW'),

  -- Ranking events
  ('ranking.created', 'Ranking Created', 'A new ranking has been created', '{"type": "object", "required": ["rankingId"]}', 'RANKING', 'HIGH'),
  ('ranking.updated', 'Ranking Updated', 'A ranking has been updated', '{"type": "object", "required": ["rankingId"]}', 'RANKING', 'NORMAL'),
  ('ranking.deleted', 'Ranking Deleted', 'A ranking has been deleted', '{"type": "object", "required": ["rankingId"]}', 'RANKING', 'HIGH'),

  -- User events
  ('user.created', 'User Created', 'A new user has been created', '{"type": "object", "required": ["userId"]}', 'USER', 'HIGH'),
  ('user.updated', 'User Updated', 'A user has been updated', '{"type": "object", "required": ["userId"]}', 'USER', 'NORMAL'),
  ('user.deleted', 'User Deleted', 'A user has been deleted', '{"type": "object", "required": ["userId"]}', 'USER', 'HIGH'),
  ('user.login', 'User Login', 'A user has logged in', '{"type": "object", "required": ["userId"]}', 'USER', 'LOW'),
  ('user.logout', 'User Logout', 'A user has logged out', '{"type": "object", "required": ["userId"]}', 'USER', 'LOW'),

  -- Import events
  ('import.started', 'Import Started', 'An import job has started', '{"type": "object", "required": ["jobId"]}', 'IMPORT', 'NORMAL'),
  ('import.completed', 'Import Completed', 'An import job has completed', '{"type": "object", "required": ["jobId"]}', 'IMPORT', 'NORMAL'),
  ('import.failed', 'Import Failed', 'An import job has failed', '{"type": "object", "required": ["jobId"]}', 'IMPORT', 'HIGH'),

  -- Analytics events
  ('analytics.page_view', 'Page View', 'A page has been viewed', '{"type": "object", "required": ["path"]}', 'ANALYTICS', 'LOW'),
  ('analytics.engagement', 'User Engagement', 'A user has engaged with content', '{"type": "object", "required": ["engagementType"]}', 'ANALYTICS', 'LOW'),
  ('analytics.search', 'Search', 'A search has been performed', '{"type": "object", "required": ["query"]}', 'ANALYTICS', 'LOW'),
  ('analytics.conversion', 'Conversion', 'A conversion has occurred', '{"type": "object", "required": ["conversionType"]}', 'ANALYTICS', 'NORMAL')
ON CONFLICT (event_type_id) DO NOTHING;

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_event_types_updated_at ON event_types;
CREATE TRIGGER update_event_types_updated_at
BEFORE UPDATE ON event_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track events
CREATE TABLE IF NOT EXISTS events (
  event_id VARCHAR(36) PRIMARY KEY,
  event_type_id VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL, -- e.g., 'api', 'import', 'system', 'frontend'
  resource_type VARCHAR(100) NOT NULL, -- e.g., 'restaurant', 'dish', 'user', 'page'
  resource_id VARCHAR(255) NOT NULL, -- ID of the affected resource (can be a URL for page views)
  user_id VARCHAR(36), -- User who triggered the event, if applicable
  session_id VARCHAR(100), -- Session ID for tracking user journey
  request_id VARCHAR(100), -- Request ID for correlation
  ip_address VARCHAR(45), -- IP address of the client
  user_agent TEXT, -- User agent of the client
  device_type VARCHAR(50), -- e.g., 'mobile', 'desktop', 'tablet'
  referrer VARCHAR(255), -- Referrer URL
  data JSONB NOT NULL, -- Event data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ttl TIMESTAMP WITH TIME ZONE, -- Time to live for the event
  FOREIGN KEY (event_type_id) REFERENCES event_types(event_type_id) ON DELETE CASCADE
);

-- Create indexes for events
CREATE INDEX IF NOT EXISTS idx_events_event_type_id ON events(event_type_id);
CREATE INDEX IF NOT EXISTS idx_events_resource_type_id ON events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_device_type ON events(device_type);
CREATE INDEX IF NOT EXISTS idx_events_ttl ON events(ttl);

-- Table to track user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  session_id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(36),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(50),
  region VARCHAR(50),
  city VARCHAR(50),
  referrer VARCHAR(255),
  landing_page VARCHAR(255),
  exit_page VARCHAR(255),
  page_views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_type ON user_sessions(device_type);

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track page views
CREATE TABLE IF NOT EXISTS page_views (
  view_id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(100),
  user_id VARCHAR(36),
  page_path VARCHAR(255) NOT NULL,
  page_title VARCHAR(255),
  query_params JSONB,
  view_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  time_on_page INTEGER, -- in seconds
  is_bounce BOOLEAN DEFAULT FALSE,
  is_exit BOOLEAN DEFAULT FALSE,
  device_type VARCHAR(50),
  referrer VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for page_views
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_view_time ON page_views(view_time);
CREATE INDEX IF NOT EXISTS idx_page_views_device_type ON page_views(device_type);

-- Table to track entity views (restaurants, dishes, etc.)
CREATE TABLE IF NOT EXISTS entity_views (
  view_id VARCHAR(36) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- e.g., 'RESTAURANT', 'DISH'
  entity_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  session_id VARCHAR(100),
  view_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  time_on_entity INTEGER, -- in seconds
  device_type VARCHAR(50),
  referrer VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_entity_view UNIQUE (entity_type, entity_id, user_id, session_id, DATE(view_time))
);

-- Create indexes for entity_views
CREATE INDEX IF NOT EXISTS idx_entity_views_entity_type_id ON entity_views(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_views_user_id ON entity_views(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_views_session_id ON entity_views(session_id);
CREATE INDEX IF NOT EXISTS idx_entity_views_view_time ON entity_views(view_time);

-- Table to track user engagements
CREATE TABLE IF NOT EXISTS user_engagements (
  engagement_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  session_id VARCHAR(100),
  entity_type VARCHAR(50) NOT NULL, -- e.g., 'RESTAURANT', 'DISH'
  entity_id VARCHAR(36) NOT NULL,
  engagement_type VARCHAR(50) NOT NULL, -- e.g., 'LIKE', 'SHARE', 'COMMENT', 'SAVE'
  engagement_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  device_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_engagements
CREATE INDEX IF NOT EXISTS idx_user_engagements_user_id ON user_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagements_session_id ON user_engagements(session_id);
CREATE INDEX IF NOT EXISTS idx_user_engagements_entity_type_id ON user_engagements(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_user_engagements_engagement_type ON user_engagements(engagement_type);
CREATE INDEX IF NOT EXISTS idx_user_engagements_engagement_time ON user_engagements(engagement_time);

-- Table to track event subscriptions
CREATE TABLE IF NOT EXISTS event_subscriptions (
  subscription_id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  event_type_id VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- e.g., 'lambda', 'sqs', 'eventbridge'
  target_arn VARCHAR(255) NOT NULL, -- ARN of the target
  filter_pattern JSONB, -- Optional filter pattern
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_type_id) REFERENCES event_types(event_type_id) ON DELETE CASCADE
);

-- Create indexes for event_subscriptions
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_event_type_id ON event_subscriptions(event_type_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_is_active ON event_subscriptions(is_active);

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_event_subscriptions_updated_at ON event_subscriptions;
CREATE TRIGGER update_event_subscriptions_updated_at
BEFORE UPDATE ON event_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table to track event delivery status
CREATE TABLE IF NOT EXISTS event_deliveries (
  delivery_id VARCHAR(36) PRIMARY KEY,
  event_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL, -- PENDING, DELIVERED, FAILED
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES event_subscriptions(subscription_id) ON DELETE CASCADE
);

-- Create indexes for event_deliveries
CREATE INDEX IF NOT EXISTS idx_event_deliveries_event_id ON event_deliveries(event_id);
CREATE INDEX IF NOT EXISTS idx_event_deliveries_subscription_id ON event_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_event_deliveries_status ON event_deliveries(status);

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_event_deliveries_updated_at ON event_deliveries;
CREATE TRIGGER update_event_deliveries_updated_at
BEFORE UPDATE ON event_deliveries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to create an event
CREATE OR REPLACE FUNCTION create_event(
  p_event_type_id VARCHAR(100),
  p_source VARCHAR(100),
  p_resource_type VARCHAR(100),
  p_resource_id VARCHAR(255),
  p_user_id VARCHAR(36),
  p_session_id VARCHAR(100),
  p_request_id VARCHAR(100),
  p_ip_address VARCHAR(45),
  p_user_agent TEXT,
  p_device_type VARCHAR(50),
  p_referrer VARCHAR(255),
  p_data JSONB
) RETURNS VARCHAR(36) AS $$
DECLARE
  v_event_id VARCHAR(36);
  v_retention_days INTEGER;
BEGIN
  -- Generate a new UUID for the event
  v_event_id := uuid_generate_v4();

  -- Get retention days for this event type
  SELECT retention_days INTO v_retention_days
  FROM event_types
  WHERE event_type_id = p_event_type_id;

  -- Insert the event
  INSERT INTO events (
    event_id,
    event_type_id,
    source,
    resource_type,
    resource_id,
    user_id,
    session_id,
    request_id,
    ip_address,
    user_agent,
    device_type,
    referrer,
    data,
    created_at,
    ttl
  ) VALUES (
    v_event_id,
    p_event_type_id,
    p_source,
    p_resource_type,
    p_resource_id,
    p_user_id,
    p_session_id,
    p_request_id,
    p_ip_address,
    p_user_agent,
    p_device_type,
    p_referrer,
    p_data,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + (v_retention_days || ' days')::INTERVAL
  );

  -- Return the event ID
  RETURN v_event_id;
END
$$ LANGUAGE plpgsql;

-- Function to track a page view
CREATE OR REPLACE FUNCTION track_page_view(
  p_session_id VARCHAR(100),
  p_user_id VARCHAR(36),
  p_page_path VARCHAR(255),
  p_page_title VARCHAR(255),
  p_query_params JSONB,
  p_device_type VARCHAR(50),
  p_referrer VARCHAR(255)
) RETURNS VARCHAR(36) AS $$
DECLARE
  v_view_id VARCHAR(36);
BEGIN
  -- Generate a new UUID for the view
  v_view_id := uuid_generate_v4();

  -- Insert the page view
  INSERT INTO page_views (
    view_id,
    session_id,
    user_id,
    page_path,
    page_title,
    query_params,
    view_time,
    device_type,
    referrer,
    created_at
  ) VALUES (
    v_view_id,
    p_session_id,
    p_user_id,
    p_page_path,
    p_page_title,
    p_query_params,
    CURRENT_TIMESTAMP,
    p_device_type,
    p_referrer,
    CURRENT_TIMESTAMP
  );

  -- Update session page views count
  UPDATE user_sessions
  SET
    page_views = page_views + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE session_id = p_session_id;

  -- Create an event for the page view
  PERFORM create_event(
    'analytics.page_view',
    'frontend',
    'page',
    p_page_path,
    p_user_id,
    p_session_id,
    NULL,
    NULL,
    NULL,
    p_device_type,
    p_referrer,
    jsonb_build_object(
      'page_path', p_page_path,
      'page_title', p_page_title,
      'query_params', p_query_params
    )
  );

  -- Return the view ID
  RETURN v_view_id;
END
$$ LANGUAGE plpgsql;

-- Function to track an entity view
CREATE OR REPLACE FUNCTION track_entity_view(
  p_entity_type VARCHAR(50),
  p_entity_id VARCHAR(36),
  p_user_id VARCHAR(36),
  p_session_id VARCHAR(100),
  p_device_type VARCHAR(50),
  p_referrer VARCHAR(255)
) RETURNS VARCHAR(36) AS $$
DECLARE
  v_view_id VARCHAR(36);
  v_event_type_id VARCHAR(100);
BEGIN
  -- Generate a new UUID for the view
  v_view_id := uuid_generate_v4();

  -- Determine the event type
  CASE p_entity_type
    WHEN 'RESTAURANT' THEN v_event_type_id := 'restaurant.viewed';
    WHEN 'DISH' THEN v_event_type_id := 'dish.viewed';
    ELSE v_event_type_id := 'analytics.entity_view';
  END CASE;

  -- Insert the entity view
  INSERT INTO entity_views (
    view_id,
    entity_type,
    entity_id,
    user_id,
    session_id,
    view_time,
    device_type,
    referrer,
    created_at
  ) VALUES (
    v_view_id,
    p_entity_type,
    p_entity_id,
    p_user_id,
    p_session_id,
    CURRENT_TIMESTAMP,
    p_device_type,
    p_referrer,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (entity_type, entity_id, user_id, session_id, DATE(view_time))
  DO NOTHING;

  -- Create an event for the entity view
  PERFORM create_event(
    v_event_type_id,
    'frontend',
    LOWER(p_entity_type),
    p_entity_id,
    p_user_id,
    p_session_id,
    NULL,
    NULL,
    NULL,
    p_device_type,
    p_referrer,
    jsonb_build_object(
      'entity_type', p_entity_type,
      'entity_id', p_entity_id
    )
  );

  -- Return the view ID
  RETURN v_view_id;
END
$$ LANGUAGE plpgsql;

-- Function to track user engagement
CREATE OR REPLACE FUNCTION track_user_engagement(
  p_user_id VARCHAR(36),
  p_session_id VARCHAR(100),
  p_entity_type VARCHAR(50),
  p_entity_id VARCHAR(36),
  p_engagement_type VARCHAR(50),
  p_metadata JSONB,
  p_device_type VARCHAR(50)
) RETURNS VARCHAR(36) AS $$
DECLARE
  v_engagement_id VARCHAR(36);
BEGIN
  -- Generate a new UUID for the engagement
  v_engagement_id := uuid_generate_v4();

  -- Insert the user engagement
  INSERT INTO user_engagements (
    engagement_id,
    user_id,
    session_id,
    entity_type,
    entity_id,
    engagement_type,
    engagement_time,
    metadata,
    device_type,
    created_at
  ) VALUES (
    v_engagement_id,
    p_user_id,
    p_session_id,
    p_entity_type,
    p_entity_id,
    p_engagement_type,
    CURRENT_TIMESTAMP,
    p_metadata,
    p_device_type,
    CURRENT_TIMESTAMP
  );

  -- Create an event for the user engagement
  PERFORM create_event(
    'analytics.engagement',
    'frontend',
    LOWER(p_entity_type),
    p_entity_id,
    p_user_id,
    p_session_id,
    NULL,
    NULL,
    NULL,
    p_device_type,
    NULL,
    jsonb_build_object(
      'entity_type', p_entity_type,
      'entity_id', p_entity_id,
      'engagement_type', p_engagement_type,
      'metadata', p_metadata
    )
  );

  -- Return the engagement ID
  RETURN v_engagement_id;
END
$$ LANGUAGE plpgsql;
