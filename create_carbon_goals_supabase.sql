-- Carbon Goals Table for Supabase
-- This table stores user monthly carbon footprint goals that can be set via the interactive chart

CREATE TABLE IF NOT EXISTS public.carbon_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    goal_value DECIMAL(10,2) NOT NULL CHECK (goal_value > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one goal per user per month/year
    CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year)
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

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on carbon_goals
CREATE TRIGGER carbon_goals_updated_at
    BEFORE UPDATE ON public.carbon_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to get user's monthly carbon footprint from orders
CREATE OR REPLACE FUNCTION public.get_monthly_carbon_footprint(
    p_user_id UUID,
    p_month INTEGER,
    p_year INTEGER
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_footprint DECIMAL(10,2) := 0;
BEGIN
    -- Sum carbon footprint from orders for the specified month/year
    SELECT COALESCE(SUM(o.carbon_footprint), 0)
    INTO total_footprint
    FROM public.orders o
    WHERE o.user_id = p_user_id
    AND EXTRACT(MONTH FROM o.created_at) = p_month
    AND EXTRACT(YEAR FROM o.created_at) = p_year;
    
    RETURN total_footprint;
END;
$$;

-- Function to get user's carbon data for the chart
CREATE OR REPLACE FUNCTION public.get_user_carbon_data(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    monthly_data JSON[];
    month_record RECORD;
    total_footprint DECIMAL(10,2) := 0;
    monthly_footprint DECIMAL(10,2) := 0;
    last_month_footprint DECIMAL(10,2) := 0;
    yearly_goal DECIMAL(10,2) := 300; -- Default yearly goal
BEGIN
    -- Get monthly data for the last 12 months
    FOR i IN 0..11 LOOP
        DECLARE
            target_month INTEGER;
            target_year INTEGER;
            month_footprint DECIMAL(10,2);
            month_goal DECIMAL(10,2);
            month_name TEXT;
        BEGIN
            -- Calculate target month and year
            target_month := current_month - i;
            target_year := current_year;
            
            IF target_month <= 0 THEN
                target_month := target_month + 12;
                target_year := target_year - 1;
            END IF;
            
            -- Get month name
            month_name := to_char(make_date(target_year, target_month, 1), 'Mon');
            
            -- Get actual footprint for this month
            month_footprint := public.get_monthly_carbon_footprint(p_user_id, target_month, target_year);
            
            -- Get goal for this month (default to 25 if not set)
            SELECT COALESCE(goal_value, 25)
            INTO month_goal
            FROM public.carbon_goals
            WHERE user_id = p_user_id
            AND month = target_month
            AND year = target_year;
            
            -- Build monthly data entry
            monthly_data := array_append(monthly_data, json_build_object(
                'month', month_name,
                'footprint', month_footprint,
                'goal', month_goal
            ));
        END;
    END LOOP;
    
    -- Reverse array to have oldest first
    monthly_data := array(SELECT unnest(monthly_data) ORDER BY array_position(monthly_data, unnest(monthly_data)) DESC);
    
    -- Calculate current month and last month footprints
    monthly_footprint := public.get_monthly_carbon_footprint(p_user_id, current_month, current_year);
    
    -- Last month calculation
    DECLARE
        last_month INTEGER := current_month - 1;
        last_year INTEGER := current_year;
    BEGIN
        IF last_month = 0 THEN
            last_month := 12;
            last_year := last_year - 1;
        END IF;
        last_month_footprint := public.get_monthly_carbon_footprint(p_user_id, last_month, last_year);
    END;
    
    -- Calculate total footprint for current year
    SELECT COALESCE(SUM(carbon_footprint), 0)
    INTO total_footprint
    FROM public.orders
    WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM created_at) = current_year;
    
    -- Build result JSON
    result := json_build_object(
        'totalFootprint', total_footprint,
        'monthlyFootprint', monthly_footprint,
        'lastMonthFootprint', last_month_footprint,
        'yearlyGoal', yearly_goal,
        'monthlyData', array_to_json(monthly_data)
    );
    
    RETURN result;
END;
$$;

-- Function to set or update carbon goal
CREATE OR REPLACE FUNCTION public.set_carbon_goal(
    p_user_id UUID,
    p_month INTEGER,
    p_year INTEGER,
    p_goal_value DECIMAL(10,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update the goal
    INSERT INTO public.carbon_goals (user_id, month, year, goal_value)
    VALUES (p_user_id, p_month, p_year, p_goal_value)
    ON CONFLICT (user_id, month, year)
    DO UPDATE SET 
        goal_value = EXCLUDED.goal_value,
        updated_at = timezone('utc'::text, now());
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carbon_goals_user_month_year 
ON public.carbon_goals(user_id, month, year);

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at 
ON public.orders(user_id, created_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.carbon_goals TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_carbon_footprint TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_carbon_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_carbon_goal TO authenticated;

-- Insert some sample carbon goals for testing (optional)
-- You can remove this section if you don't want sample data
/*
INSERT INTO public.carbon_goals (user_id, month, year, goal_value) 
VALUES 
    ('00000000-0000-0000-0000-000000000000', 1, 2024, 25.0),
    ('00000000-0000-0000-0000-000000000000', 2, 2024, 25.0),
    ('00000000-0000-0000-0000-000000000000', 3, 2024, 25.0)
ON CONFLICT (user_id, month, year) DO NOTHING;
*/
