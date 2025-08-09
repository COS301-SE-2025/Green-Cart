-- Carbon Goals Table for storing user monthly carbon footprint goals
CREATE TABLE IF NOT EXISTS carbon_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    goal_value DECIMAL(10,2) NOT NULL DEFAULT 25.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one goal per user per month/year
    UNIQUE(user_id, month, year),
    
    -- Foreign key to users table (adjust based on your user table name)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_carbon_goals_user_date ON carbon_goals(user_id, year, month);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_carbon_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carbon_goals_updated_at
    BEFORE UPDATE ON carbon_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_carbon_goals_updated_at();
