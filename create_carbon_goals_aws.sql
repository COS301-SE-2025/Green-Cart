-- Carbon Goals Table for AWS RDS PostgreSQL
-- Compatible with existing carbon goals service code

-- Create carbon_goals table with proper foreign key to users
CREATE TABLE IF NOT EXISTS carbon_goals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    goal_value DECIMAL(10,2) NOT NULL CHECK (goal_value > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one goal per user per month
    CONSTRAINT unique_user_month UNIQUE (user_id, month),
    
    -- Foreign key to users table
    CONSTRAINT fk_carbon_goals_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carbon_goals_user_id ON carbon_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_goals_user_month ON carbon_goals(user_id, month);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_carbon_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on carbon_goals
CREATE TRIGGER update_carbon_goals_updated_at
    BEFORE UPDATE ON carbon_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_carbon_goals_updated_at();

-- Function to set or update carbon goal (compatible with existing service)
CREATE OR REPLACE FUNCTION set_carbon_goal(
    p_user_id VARCHAR(36),
    p_month INTEGER,
    p_goal_value DECIMAL(10,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL OR p_month < 1 OR p_month > 12 OR p_goal_value <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Insert or update the goal
    INSERT INTO carbon_goals (user_id, month, goal_value)
    VALUES (p_user_id, p_month, p_goal_value)
    ON CONFLICT (user_id, month)
    DO UPDATE SET 
        goal_value = EXCLUDED.goal_value,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Function to get carbon goal for a specific month (compatible with existing service)
CREATE OR REPLACE FUNCTION get_carbon_goal(
    p_user_id VARCHAR(36),
    p_month INTEGER
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    goal_value DECIMAL(10,2);
BEGIN
    SELECT cg.goal_value
    INTO goal_value
    FROM carbon_goals cg
    WHERE cg.user_id = p_user_id
    AND cg.month = p_month;
    
    -- Return default goal of 75 if no goal is set (matches your service code)
    RETURN COALESCE(goal_value, 75.0);
END;
$$;

-- Insert some default goals for testing (optional)
-- You can remove this section if you don't want test data
INSERT INTO carbon_goals (user_id, month, goal_value) VALUES
('test-user-123', 1, 75.0),
('test-user-123', 2, 70.0),
('test-user-123', 3, 65.0)
ON CONFLICT (user_id, month) DO NOTHING;

-- Verify the table was created
SELECT 'carbon_goals table created successfully' as status;
SELECT COUNT(*) as total_goals FROM carbon_goals;
