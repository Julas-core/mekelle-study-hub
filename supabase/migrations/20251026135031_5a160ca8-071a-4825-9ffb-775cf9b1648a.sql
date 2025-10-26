-- Add download_count to materials table
ALTER TABLE public.materials 
ADD COLUMN download_count INTEGER DEFAULT 0 NOT NULL;

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, material_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
ON public.bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
ON public.bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
ON public.bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, material_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
ON public.ratings FOR SELECT
USING (true);

CREATE POLICY "Users can create own ratings"
ON public.ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
ON public.ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
ON public.ratings FOR DELETE
USING (auth.uid() = user_id);

-- Create recently_viewed table
CREATE TABLE public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
ON public.recently_viewed FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own history"
ON public.recently_viewed FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on recently viewed queries
CREATE INDEX idx_recently_viewed_user_time ON public.recently_viewed(user_id, viewed_at DESC);

-- Create user_points table
CREATE TABLE public.user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
ON public.user_points FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all points for leaderboard"
ON public.user_points FOR SELECT
USING (true);

-- Create point_transactions table
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON public.point_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Create function to award points
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update user_points
  INSERT INTO public.user_points (user_id, total_points, updated_at)
  VALUES (p_user_id, p_points, now())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_points = user_points.total_points + p_points,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.point_transactions (user_id, points, action_type, reference_id)
  VALUES (p_user_id, p_points, p_action_type, p_reference_id);
END;
$$;

-- Create function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(p_material_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.materials
  SET download_count = download_count + 1
  WHERE id = p_material_id;
END;
$$;

-- Create trigger to update ratings updated_at
CREATE OR REPLACE FUNCTION public.update_rating_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_ratings_updated_at
BEFORE UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_rating_updated_at();