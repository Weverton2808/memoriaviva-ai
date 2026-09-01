DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_select_public_authors" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_articles a
    WHERE a.user_id = profiles.id AND a.is_public = true
  )
);