-- Create exam topics table for exam preparation tracker
CREATE TABLE public.exam_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  course text NOT NULL,
  department text NOT NULL,
  topic_name text NOT NULL,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user activity log for study streaks
CREATE TABLE public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  activity_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  reference_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create AI chat sessions table
CREATE TABLE public.ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  material_id uuid REFERENCES public.materials(id) ON DELETE CASCADE,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create AI chat messages table
CREATE TABLE public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create forum questions table
CREATE TABLE public.forum_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  course text NOT NULL,
  department text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  upvotes integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create forum answers table
CREATE TABLE public.forum_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.forum_questions(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  content text NOT NULL,
  upvotes integer NOT NULL DEFAULT 0,
  is_accepted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create study notes table
CREATE TABLE public.study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  material_id uuid REFERENCES public.materials(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'study_group', 'public')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create forum upvotes table
CREATE TABLE public.forum_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  question_id uuid REFERENCES public.forum_questions(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES public.forum_answers(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CHECK ((question_id IS NOT NULL AND answer_id IS NULL) OR (question_id IS NULL AND answer_id IS NOT NULL)),
  UNIQUE(user_id, question_id),
  UNIQUE(user_id, answer_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_topics
CREATE POLICY "Users can view own exam topics" ON public.exam_topics
  FOR SELECT USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can create own exam topics" ON public.exam_topics
  FOR INSERT WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update own exam topics" ON public.exam_topics
  FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete own exam topics" ON public.exam_topics
  FOR DELETE USING (auth.jwt()->>'sub' = user_id);

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view own activity" ON public.user_activity_log
  FOR SELECT USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can create own activity" ON public.user_activity_log
  FOR INSERT WITH CHECK (auth.jwt()->>'sub' = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

-- RLS Policies for AI chat sessions
CREATE POLICY "Users can view own chat sessions" ON public.ai_chat_sessions
  FOR SELECT USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can create own chat sessions" ON public.ai_chat_sessions
  FOR INSERT WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update own chat sessions" ON public.ai_chat_sessions
  FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete own chat sessions" ON public.ai_chat_sessions
  FOR DELETE USING (auth.jwt()->>'sub' = user_id);

-- RLS Policies for AI chat messages
CREATE POLICY "Users can view messages in own sessions" ON public.ai_chat_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.ai_chat_sessions 
    WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
    AND ai_chat_sessions.user_id = auth.jwt()->>'sub'
  ));

CREATE POLICY "Users can create messages in own sessions" ON public.ai_chat_messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_chat_sessions 
    WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
    AND ai_chat_sessions.user_id = auth.jwt()->>'sub'
  ));

-- RLS Policies for forum questions
CREATE POLICY "Anyone can view forum questions" ON public.forum_questions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON public.forum_questions
  FOR INSERT WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update own questions" ON public.forum_questions
  FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete own questions" ON public.forum_questions
  FOR DELETE USING (auth.jwt()->>'sub' = user_id);

-- RLS Policies for forum answers
CREATE POLICY "Anyone can view forum answers" ON public.forum_answers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON public.forum_answers
  FOR INSERT WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update own answers" ON public.forum_answers
  FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete own answers" ON public.forum_answers
  FOR DELETE USING (auth.jwt()->>'sub' = user_id);

-- RLS Policies for study notes
CREATE POLICY "Users can view own notes" ON public.study_notes
  FOR SELECT USING (auth.jwt()->>'sub' = user_id OR visibility = 'public');

CREATE POLICY "Users can create own notes" ON public.study_notes
  FOR INSERT WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update own notes" ON public.study_notes
  FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete own notes" ON public.study_notes
  FOR DELETE USING (auth.jwt()->>'sub' = user_id);

-- RLS Policies for forum upvotes
CREATE POLICY "Anyone can view upvotes" ON public.forum_upvotes
  FOR SELECT USING (true);

CREATE POLICY "Users can create own upvotes" ON public.forum_upvotes
  FOR INSERT WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete own upvotes" ON public.forum_upvotes
  FOR DELETE USING (auth.jwt()->>'sub' = user_id);

-- Drop old messaging tables if they exist
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_activity_log (user_id, activity_date, activity_type)
  VALUES (auth.jwt()->>'sub', CURRENT_DATE, TG_ARGV[0])
  ON CONFLICT (user_id, activity_date) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to log material views
CREATE TRIGGER log_material_view
  AFTER INSERT ON public.recently_viewed
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_activity('view_material');

-- Trigger to log material uploads
CREATE TRIGGER log_material_upload
  AFTER INSERT ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_activity('upload_material');

-- Function to calculate study streak
CREATE OR REPLACE FUNCTION public.get_user_streak(p_user_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak_count integer := 0;
  check_date date := CURRENT_DATE;
BEGIN
  LOOP
    IF EXISTS (
      SELECT 1 FROM public.user_activity_log 
      WHERE user_id = p_user_id AND activity_date = check_date
    ) THEN
      streak_count := streak_count + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$;