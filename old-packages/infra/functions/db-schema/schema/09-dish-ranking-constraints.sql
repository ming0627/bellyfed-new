-- Add constraints to enforce the One-Best Ranking System rules

-- Create a unique index to enforce the One-Best Rule:
-- A user can have only ONE #1 ranking for each dish type at a restaurant
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_best_rule
ON dish_rankings (user_id, restaurant_id, dish_type)
WHERE rank = 1;

-- Create a function to enforce the One-Best Rule when inserting or updating rankings
CREATE OR REPLACE FUNCTION enforce_one_best_rule()
RETURNS TRIGGER AS $$
BEGIN
    -- If the new ranking is #1, demote any existing #1 ranking for the same dish type at the same restaurant
    IF NEW.rank = 1 THEN
        -- Insert a record in ranking_history for the demotion
        INSERT INTO ranking_history (
            history_id,
            ranking_id,
            user_id,
            dish_id,
            restaurant_id,
            dish_type,
            previous_rank,
            new_rank,
            previous_taste_status,
            new_taste_status,
            notes,
            photo_urls,
            created_at
        )
        SELECT
            uuid_generate_v4(),
            ranking_id,
            user_id,
            dish_id,
            restaurant_id,
            dish_type,
            rank,
            2, -- Demote to rank 2
            taste_status,
            taste_status,
            notes,
            photo_urls,
            CURRENT_TIMESTAMP
        FROM dish_rankings
        WHERE user_id = NEW.user_id
          AND restaurant_id = NEW.restaurant_id
          AND dish_type = NEW.dish_type
          AND rank = 1
          AND ranking_id != COALESCE(NEW.ranking_id, 'new-record'); -- Skip the current record being inserted/updated

        -- Update the rank of the existing #1 ranking to #2
        UPDATE dish_rankings
        SET rank = 2,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id
          AND restaurant_id = NEW.restaurant_id
          AND dish_type = NEW.dish_type
          AND rank = 1
          AND ranking_id != COALESCE(NEW.ranking_id, 'new-record'); -- Skip the current record being inserted/updated
    END IF;

    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create a trigger to enforce the One-Best Rule
DROP TRIGGER IF EXISTS trigger_enforce_one_best_rule ON dish_rankings;
CREATE TRIGGER trigger_enforce_one_best_rule
BEFORE INSERT OR UPDATE ON dish_rankings
FOR EACH ROW
EXECUTE FUNCTION enforce_one_best_rule();

-- Create a function to validate ranking data
CREATE OR REPLACE FUNCTION validate_ranking_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure notes are provided for all rankings
    IF NEW.notes IS NULL OR LENGTH(TRIM(NEW.notes)) = 0 THEN
        RAISE EXCEPTION 'Notes are required for all rankings';
    END IF;

    -- Ensure photo_urls are provided for all rankings
    IF NEW.photo_urls IS NULL OR ARRAY_LENGTH(NEW.photo_urls, 1) IS NULL OR ARRAY_LENGTH(NEW.photo_urls, 1) = 0 THEN
        RAISE EXCEPTION 'At least one photo is required for all rankings';
    END IF;

    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create a trigger to validate ranking data
DROP TRIGGER IF EXISTS trigger_validate_ranking_data ON dish_rankings;
CREATE TRIGGER trigger_validate_ranking_data
BEFORE INSERT OR UPDATE ON dish_rankings
FOR EACH ROW
EXECUTE FUNCTION validate_ranking_data();

-- Create a view to get the top-ranked dishes for each user by dish type
CREATE OR REPLACE VIEW user_top_ranked_dishes AS
SELECT
    r.user_id,
    r.restaurant_id,
    r.dish_id,
    r.dish_type,
    r.rank,
    r.notes,
    r.photo_urls,
    d.name AS dish_name,
    d.description AS dish_description,
    d.image_url AS dish_image_url,
    d.category AS dish_category,
    d.is_vegetarian,
    d.spicy_level,
    d.price,
    r.created_at,
    r.updated_at
FROM dish_rankings r
JOIN dishes d ON r.dish_id = d.dish_id
WHERE r.rank = 1
ORDER BY r.user_id, r.dish_type, r.created_at DESC;
