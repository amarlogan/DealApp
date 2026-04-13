CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $BODY$
BEGIN
  RETURN (
        SELECT role = 'admin'
            FROM public.profiles    WHERE id = (SELECT auth.uid())
  );
  END;
  $BODY$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

  DROP POLICY IF EXISTS read_all_categories ON public.categories;
  DROP POLICY IF EXISTS rls_categories_admin ON public.categories;
  DROP POLICY IF EXISTS rls_categories_select ON public.categories;
  DROP POLICY IF EXISTS rls_categories_insert ON public.categories;
  DROP POLICY IF EXISTS rls_categories_update ON public.categories;
  DROP POLICY IF EXISTS rls_categories_delete ON public.categories;
  CREATE POLICY rls_categories_select ON public.categories FOR SELECT USING (true);
  CREATE POLICY rls_categories_insert ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  CREATE POLICY rls_categories_update ON public.categories FOR UPDATE TO authenticated USING (public.is_admin());
  CREATE POLICY rls_categories_delete ON public.categories FOR DELETE TO authenticated USING (public.is_admin());

  DROP POLICY IF EXISTS read_all_deals ON public.deals;
  DROP POLICY IF EXISTS rls_deals_read ON public.deals;
  DROP POLICY IF EXISTS rls_deals_admin ON public.deals;
  DROP POLICY IF EXISTS rls_deals_select ON public.deals;
  DROP POLICY IF EXISTS rls_deals_insert ON public.deals;
  DROP POLICY IF EXISTS rls_deals_update ON public.deals;
  DROP POLICY IF EXISTS rls_deals_delete ON public.deals;
  CREATE POLICY rls_deals_select ON public.deals FOR SELECT USING (status = 'active' OR public.is_admin());
  CREATE POLICY rls_deals_insert ON public.deals FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  CREATE POLICY rls_deals_update ON public.deals FOR UPDATE TO authenticated USING (public.is_admin());
  CREATE POLICY rls_deals_delete ON public.deals FOR DELETE TO authenticated USING (public.is_admin());

  DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
  DROP POLICY IF EXISTS rls_notifications_select ON public.notifications;
  DROP POLICY IF EXISTS rls_notifications_update ON public.notifications;
  DROP POLICY IF EXISTS rls_notifications_insert ON public.notifications;
  DROP POLICY IF EXISTS rls_notifications_delete ON public.notifications;
  CREATE POLICY rls_notifications_select ON public.notifications FOR SELECT USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  CREATE POLICY rls_notifications_update ON public.notifications FOR UPDATE USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  CREATE POLICY rls_notifications_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  CREATE POLICY rls_notifications_delete ON public.notifications FOR DELETE TO authenticated USING (public.is_admin());

  DROP POLICY IF EXISTS rls_profiles ON public.profiles;
  DROP POLICY IF EXISTS rls_profiles_self ON public.profiles;
  DROP POLICY IF EXISTS rls_profiles_admin_all ON public.profiles;
  DROP POLICY IF EXISTS rls_profiles_admin_update ON public.profiles;
  DROP POLICY IF EXISTS rls_profiles_admin ON public.profiles;
  DROP POLICY IF EXISTS rls_profiles_select ON public.profiles;
  DROP POLICY IF EXISTS rls_profiles_update ON public.profiles;
  CREATE POLICY rls_profiles_select ON public.profiles FOR SELECT USING ((SELECT auth.uid()) = id OR public.is_admin());
  CREATE POLICY rls_profiles_update ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id OR public.is_admin());

  DROP POLICY IF EXISTS rls_hero_public_read ON public.hero_slides;
  DROP POLICY IF EXISTS rls_hero_admin_all ON public.hero_slides;
  DROP POLICY IF EXISTS rls_hero_select ON public.hero_slides;
  DROP POLICY IF EXISTS rls_hero_insert ON public.hero_slides;
  DROP POLICY IF EXISTS rls_hero_update ON public.hero_slides;
  DROP POLICY IF EXISTS rls_hero_delete ON public.hero_slides;
  CREATE POLICY rls_hero_select ON public.hero_slides FOR SELECT USING (is_active = true OR public.is_admin());
  CREATE POLICY rls_hero_insert ON public.hero_slides FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  CREATE POLICY rls_hero_update ON public.hero_slides FOR UPDATE TO authenticated USING (public.is_admin());
  CREATE POLICY rls_hero_delete ON public.hero_slides FOR DELETE TO authenticated USING (public.is_admin());

  DROP POLICY IF EXISTS read_all_landing ON public.landing_sections;
  DROP POLICY IF EXISTS rls_landing_sections_admin ON public.landing_sections;
  DROP POLICY IF EXISTS rls_landing_sections_select ON public.landing_sections;
  DROP POLICY IF EXISTS rls_landing_sections_insert ON public.landing_sections;
  DROP POLICY IF EXISTS rls_landing_sections_update ON public.landing_sections;
  DROP POLICY IF EXISTS rls_landing_sections_delete ON public.landing_sections;
  CREATE POLICY rls_landing_sections_select ON public.landing_sections FOR SELECT USING (is_visible = true OR public.is_admin());
  CREATE POLICY rls_landing_sections_insert ON public.landing_sections FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  CREATE POLICY rls_landing_sections_update ON public.landing_sections FOR UPDATE TO authenticated USING (public.is_admin());
  CREATE POLICY rls_landing_sections_delete ON public.landing_sections FOR DELETE TO authenticated USING (public.is_admin());

  DROP POLICY IF EXISTS rls_seasons_read ON public.seasons;
  DROP POLICY IF EXISTS rls_seasons_admin ON public.seasons;
  DROP POLICY IF EXISTS rls_seasons_select ON public.seasons;
  DROP POLICY IF EXISTS rls_seasons_insert ON public.seasons;
  DROP POLICY IF EXISTS rls_seasons_update ON public.seasons;
  DROP POLICY IF EXISTS rls_seasons_delete ON public.seasons;
  CREATE POLICY rls_seasons_select ON public.seasons FOR SELECT USING (true);
  CREATE POLICY rls_seasons_insert ON public.seasons FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  CREATE POLICY rls_seasons_update ON public.seasons FOR UPDATE TO authenticated USING (public.is_admin());
  CREATE POLICY rls_seasons_delete ON public.seasons FOR DELETE TO authenticated USING (public.is_admin());

  DROP POLICY IF EXISTS rls_favorites ON public.favorites;
  DROP POLICY IF EXISTS user_favorites_isolation ON public.favorites;
  CREATE POLICY rls_favorites ON public.favorites FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

  DROP POLICY IF EXISTS rls_alerts ON public.price_alerts;
  DROP POLICY IF EXISTS user_price_alerts_isolation ON public.price_alerts;
  CREATE POLICY rls_alerts ON public.price_alerts FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

  