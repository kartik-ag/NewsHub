-- Schema for NewsHub personalized news digest application
-- This would be imported into Nhost/Hasura

-- User Preferences Table
CREATE TABLE "public"."user_preferences" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "topics" jsonb NOT NULL DEFAULT '[]',
  "keywords" jsonb NOT NULL DEFAULT '[]',
  "sources" jsonb NOT NULL DEFAULT '[]',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE ("user_id")
);

-- Enable RLS on user_preferences
ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON "public"."user_preferences"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON "public"."user_preferences"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON "public"."user_preferences"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- News Articles Table
CREATE TABLE "public"."news_articles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "external_id" text NOT NULL,
  "title" text NOT NULL,
  "content" text,
  "summary" text,
  "sentiment" text,
  "sentiment_explanation" text,
  "source" text NOT NULL,
  "author" text,
  "published_at" timestamptz NOT NULL,
  "url" text NOT NULL,
  "image_url" text,
  "category" text,
  "topics" jsonb NOT NULL DEFAULT '[]',
  "keywords" jsonb NOT NULL DEFAULT '[]',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("external_id")
);

-- Enable RLS on news_articles
ALTER TABLE "public"."news_articles" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for news_articles - all authenticated users can view
CREATE POLICY "Authenticated users can view news articles" ON "public"."news_articles"
  FOR SELECT USING (auth.role() = 'user');

-- Saved Articles Table
CREATE TABLE "public"."saved_articles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "article_id" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE ("user_id", "article_id")
);

-- Enable RLS on saved_articles
ALTER TABLE "public"."saved_articles" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_articles
CREATE POLICY "Users can view their own saved articles" ON "public"."saved_articles"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved articles" ON "public"."saved_articles"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved articles" ON "public"."saved_articles"
  FOR DELETE USING (auth.uid() = user_id);

-- Create a view for users to see their saved articles with details
CREATE VIEW "public"."user_saved_articles" AS
  SELECT 
    sa.id as saved_id,
    sa.user_id,
    sa.created_at as saved_at,
    na.*
  FROM public.saved_articles sa
  JOIN public.news_articles na ON sa.article_id = na.id;

-- Enable RLS on the view
ALTER VIEW "public"."user_saved_articles" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for the view
CREATE POLICY "Users can view their own saved articles with details" ON "public"."user_saved_articles"
  FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create user preferences when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- N8N workflow results table to store processed news data
CREATE TABLE "public"."n8n_workflow_results" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "workflow_id" text NOT NULL,
  "execution_id" text NOT NULL,
  "data" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Enable RLS on n8n_workflow_results
ALTER TABLE "public"."n8n_workflow_results" ENABLE ROW LEVEL SECURITY;

-- RLS Policy for n8n_workflow_results - only admins can access directly
CREATE POLICY "Only admins can access n8n workflow results" ON "public"."n8n_workflow_results"
  FOR ALL USING (auth.role() = 'admin');

-- Comments Table for user interaction with articles
CREATE TABLE "public"."article_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "article_id" uuid NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Enable RLS on article_comments
ALTER TABLE "public"."article_comments" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for article_comments
CREATE POLICY "Users can view all comments" ON "public"."article_comments"
  FOR SELECT USING (auth.role() = 'user');

CREATE POLICY "Users can insert their own comments" ON "public"."article_comments"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON "public"."article_comments"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON "public"."article_comments"
  FOR DELETE USING (auth.uid() = user_id);

-- Function to check if email is verified (to be used in Actions)
CREATE OR REPLACE FUNCTION public.is_email_verified(user_id uuid)
RETURNS boolean AS $$
DECLARE
  is_verified boolean;
BEGIN
  SELECT email_verified INTO is_verified FROM auth.users WHERE id = user_id;
  RETURN is_verified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 