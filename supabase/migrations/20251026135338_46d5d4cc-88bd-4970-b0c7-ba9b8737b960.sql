-- Enable realtime for the tables we need
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.materials;