-- Complete Carbon Footprint System for Supabase
-- This script creates all necessary tables and functions for carbon footprint tracking

-- 1. Ensure orders table has carbon_footprint column (if not already exists)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS carbon_footprint DECIMAL(10,2) DEFAULT 0;

-- 2. Create carbon_goals table
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

-- 3. Enable Row Level Security
ALTER TABLE public.carbon_goals ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for carbon_goals
CREATE POLICY "Users can view their own carbon goals" ON public.carbon_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own carbon goals" ON public.carbon_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carbon goals" ON public.carbon_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carbon goals" ON public.carbon_goals
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Function to automatically update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger for carbon_goals updated_at
CREATE TRIGGER carbon_goals_updated_at
    BEFORE UPDATE ON public.carbon_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Function to calculate carbon footprint from sustainability ratings
CREATE OR REPLACE FUNCTION public.calculate_order_carbon_footprint(
    p_order_id INTEGER
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_footprint DECIMAL(10,2) := 0;
    cart_item RECORD;
    avg_sustainability_rating DECIMAL(5,2);
    base_footprint_per_item DECIMAL(10,2) := 5.0; -- Base carbon footprint per item
BEGIN
    -- Get all items in the order's cart and calculate footprint
    FOR cart_item IN
        SELECT ci.quantity, p.id as product_id
        FROM public.orders o
        JOIN public.cart_items ci ON ci.cart_id = o.cart_id
        JOIN public.products p ON p.id = ci.product_id
        WHERE o.id = p_order_id
    LOOP
        -- Calculate average sustainability rating for this product
        SELECT AVG(sr.value)
        INTO avg_sustainability_rating
        FROM public.sustainability_ratings sr
        WHERE sr.product_id = cart_item.product_id
        AND sr.verification = true; -- Only use verified ratings
        
        -- If no sustainability rating, use default poor rating (70)
        IF avg_sustainability_rating IS NULL THEN
            avg_sustainability_rating := 70.0;
        END IF;
        
        -- Convert sustainability rating to carbon footprint
        -- Higher sustainability rating = lower carbon footprint
        -- Formula: base_footprint * (sustainability_rating / 100) * quantity
        -- Invert the rating so lower rating = higher footprint
        total_footprint := total_footprint + 
            (base_footprint_per_item * ((100 - avg_sustainability_rating) / 100) * cart_item.quantity);
    END LOOP;
    
    RETURN COALESCE(total_footprint, 0);
END;
$$;

-- 8. Function to update order carbon footprint
CREATE OR REPLACE FUNCTION public.update_order_carbon_footprint()
RETURNS TRIGGER AS $$
DECLARE
    footprint DECIMAL(10,2);
BEGIN
    -- Calculate carbon footprint for the new/updated order
    footprint := public.calculate_order_carbon_footprint(NEW.id);
    
    -- Update the order with calculated footprint
    UPDATE public.orders 
    SET carbon_footprint = footprint 
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger to automatically calculate carbon footprint on order creation/update
CREATE TRIGGER calculate_order_footprint
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_carbon_footprint();

-- 10. Function to get user's monthly carbon footprint
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
    WHERE o.user_id::uuid = p_user_id
    AND EXTRACT(MONTH FROM o.created_at) = p_month
    AND EXTRACT(YEAR FROM o.created_at) = p_year
    AND o.state != 'Cancelled'; -- Exclude cancelled orders
    
    RETURN total_footprint;
END;
$$;

-- 11. Function to get user's carbon data for the frontend
CREATE OR REPLACE FUNCTION public.get_user_carbon_data(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    monthly_data JSON[] := '{}';
    total_footprint DECIMAL(10,2) := 0;
    monthly_footprint DECIMAL(10,2) := 0;
    last_month_footprint DECIMAL(10,2) := 0;
    yearly_goal DECIMAL(10,2) := 300; -- Default yearly goal
    i INTEGER;
BEGIN
    -- Get monthly data for the last 6 months (for chart)
    FOR i IN 0..5 LOOP
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
            monthly_data := array_prepend(json_build_object(
                'month', month_name,
                'footprint', month_footprint,
                'goal', month_goal
            ), monthly_data);
        END;
    END LOOP;
    
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
    WHERE user_id::uuid = p_user_id
    AND EXTRACT(YEAR FROM created_at) = current_year
    AND state != 'Cancelled';
    
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

-- 12. Function to set or update carbon goal
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
    -- Validate inputs
    IF p_user_id IS NULL OR p_month < 1 OR p_month > 12 OR p_year < 2020 OR p_goal_value <= 0 THEN
        RETURN FALSE;
    END IF;
    
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

-- 13. Function to get recent orders with carbon impact
CREATE OR REPLACE FUNCTION public.get_user_carbon_orders(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    orders_json JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', o.id,
            'date', o.created_at::date,
            'footprint', COALESCE(o.carbon_footprint, 0),
            'state', o.state,
            'items', (
                SELECT COUNT(*)
                FROM public.cart_items ci
                WHERE ci.cart_id = o.cart_id
            )
        )
        ORDER BY o.created_at DESC
    )
    INTO orders_json
    FROM public.orders o
    WHERE o.user_id::uuid = p_user_id
    LIMIT p_limit;
    
    RETURN COALESCE(orders_json, '[]'::json);
END;
$$;

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carbon_goals_user_month_year 
ON public.carbon_goals(user_id, month, year);

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at 
ON public.orders(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_orders_carbon_footprint
ON public.orders(carbon_footprint);

CREATE INDEX IF NOT EXISTS idx_sustainability_ratings_product_verified
ON public.sustainability_ratings(product_id, verification);

-- 15. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.carbon_goals TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_carbon_footprint TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_carbon_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_carbon_goal TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_carbon_orders TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_order_carbon_footprint TO authenticated;

-- 16. Update existing orders to calculate their carbon footprint (optional)
-- Uncomment the following lines if you want to calculate footprints for existing orders
/*
UPDATE public.orders 
SET carbon_footprint = public.calculate_order_carbon_footprint(id)
WHERE carbon_footprint IS NULL OR carbon_footprint = 0;
*/

-- 17. Example usage queries (for testing)
/*
-- Get carbon data for a user
SELECT public.get_user_carbon_data('user-uuid-here');

-- Set a carbon goal
SELECT public.set_carbon_goal('user-uuid-here', 12, 2024, 30.0);

-- Get recent orders with carbon impact
SELECT public.get_user_carbon_orders('user-uuid-here', 5);
*/
