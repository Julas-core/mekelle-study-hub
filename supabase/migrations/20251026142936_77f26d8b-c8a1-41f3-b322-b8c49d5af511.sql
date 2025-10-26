-- Phase 2 & 3 Features Database Schema

-- Comments system
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_material ON public.comments(material_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Badges system
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view user badges" ON public.user_badges
  FOR SELECT USING (true);

-- Tags system
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.material_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(material_id, tag_id)
);

CREATE INDEX idx_material_tags_material ON public.material_tags(material_id);
CREATE INDEX idx_material_tags_tag ON public.material_tags(tag_id);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON public.tags
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view material tags" ON public.material_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create material tags" ON public.material_tags
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Study groups
CREATE TABLE public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  course TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_study_groups_department ON public.study_groups(department);
CREATE INDEX idx_study_group_members_group ON public.study_group_members(group_id);
CREATE INDEX idx_study_group_members_user ON public.study_group_members(user_id);

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view study groups" ON public.study_groups
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create study groups" ON public.study_groups
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update groups" ON public.study_groups
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view group members" ON public.study_group_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join groups" ON public.study_group_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.study_group_members
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Material requests
CREATE TABLE public.material_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  course TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_material_requests_user ON public.material_requests(user_id);
CREATE INDEX idx_material_requests_status ON public.material_requests(status);

ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view material requests" ON public.material_requests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create requests" ON public.material_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests" ON public.material_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Direct messaging
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to conversations" ON public.conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversation_participants.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages they sent" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_user_value INTEGER;
BEGIN
  FOR v_badge IN SELECT * FROM public.badges LOOP
    -- Skip if user already has this badge
    IF EXISTS (
      SELECT 1 FROM public.user_badges
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) THEN
      CONTINUE;
    END IF;

    -- Check if user meets the requirement
    CASE v_badge.requirement_type
      WHEN 'total_points' THEN
        SELECT total_points INTO v_user_value
        FROM public.user_points
        WHERE user_id = p_user_id;
      WHEN 'uploads' THEN
        SELECT COUNT(*) INTO v_user_value
        FROM public.materials
        WHERE uploaded_by_user_id = p_user_id;
      WHEN 'downloads' THEN
        SELECT COUNT(*) INTO v_user_value
        FROM public.point_transactions
        WHERE user_id = p_user_id AND action_type = 'download';
      WHEN 'ratings' THEN
        SELECT COUNT(*) INTO v_user_value
        FROM public.ratings
        WHERE user_id = p_user_id;
      WHEN 'comments' THEN
        SELECT COUNT(*) INTO v_user_value
        FROM public.comments
        WHERE user_id = p_user_id;
      ELSE
        CONTINUE;
    END CASE;

    -- Award badge if requirement is met
    IF v_user_value >= v_badge.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Insert initial badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('First Steps', 'Earned your first 10 points', '🌟', 'total_points', 10),
  ('Rising Star', 'Earned 100 points', '⭐', 'total_points', 100),
  ('Point Master', 'Earned 500 points', '🏆', 'total_points', 500),
  ('First Upload', 'Uploaded your first material', '📤', 'uploads', 1),
  ('Contributor', 'Uploaded 5 materials', '📚', 'uploads', 5),
  ('Super Contributor', 'Uploaded 20 materials', '🎓', 'uploads', 20),
  ('First Download', 'Downloaded your first material', '⬇️', 'downloads', 1),
  ('Knowledge Seeker', 'Downloaded 10 materials', '🔍', 'downloads', 10),
  ('First Rating', 'Rated your first material', '⭐', 'ratings', 1),
  ('Critic', 'Rated 10 materials', '📊', 'ratings', 10),
  ('First Comment', 'Posted your first comment', '💬', 'comments', 1),
  ('Conversationalist', 'Posted 10 comments', '🗨️', 'comments', 10);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_members;