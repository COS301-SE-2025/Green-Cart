-- Carbon Goals Table for Supabase
-- Simple table to store user monthly carbon footprint goals

CREATE TABLE IF NOT EXISTS public.carbon_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    goal_value DECIMAL(10,2) NOT NULL CHECK (goal_value > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one goal per user per month
    CONSTRAINT unique_user_month UNIQUE (user_id, month)
);

-- Enable Row Level Security
ALTER TABLE public.carbon_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carbon_goals
CREATE POLICY "Users can view their own carbon goals" ON public.carbon_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own carbon goals" ON public.carbon_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carbon goals" ON public.carbon_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carbon goals" ON public.carbon_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for carbon_goals updated_at
CREATE TRIGGER carbon_goals_updated_at
    BEFORE UPDATE ON public.carbon_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to set or update carbon goal (for when user drags chart points)
CREATE OR REPLACE FUNCTION public.set_carbon_goal(
    p_user_id VARCHAR(36),
    p_month INTEGER,
    p_goal_value DECIMAL(10,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL OR p_month < 1 OR p_month > 12 OR p_goal_value <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Insert or update the goal
    INSERT INTO public.carbon_goals (user_id, month, goal_value)
    VALUES (p_user_id, p_month, p_goal_value)
    ON CONFLICT (user_id, month)
    DO UPDATE SET 
        goal_value = EXCLUDED.goal_value,
        updated_at = timezone('utc'::text, now());
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Function to get carbon goal for a specific month
CREATE OR REPLACE FUNCTION public.get_carbon_goal(
    p_user_id VARCHAR(36),
    p_month INTEGER
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    goal_value DECIMAL(10,2);
BEGIN
    SELECT cg.goal_value
    INTO goal_value
    FROM public.carbon_goals cg
    WHERE cg.user_id = p_user_id
    AND cg.month = p_month;
    
    -- Return default goal of 75 if no goal is set
    RETURN COALESCE(goal_value, 75.0);
END;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_carbon_goals_user_month 
ON public.carbon_goals(user_id, month);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.carbon_goals TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_carbon_goal TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_carbon_goal TO authenticated;

-- Example usage:
-- Set a goal: SELECT public.set_carbon_goal('user-uuid-here', 12, 80.0);
-- Get a goal: SELECT public.get_carbon_goal('user-uuid-here', 12);
