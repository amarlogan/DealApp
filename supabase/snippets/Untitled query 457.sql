CREATE TABLE IF NOT EXISTS public.contact_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMPTZ DEFAULT now(),
              name TEXT NOT NULL,
                  email TEXT NOT NULL,
                      subject TEXT NOT NULL,
                          message TEXT NOT NULL,
                              status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed'))
                              );

                              ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

                              DROP POLICY IF EXISTS "Anyone can submit a contact form" ON public.contact_submissions;
                              CREATE POLICY "Anyone can submit a contact form"
                                  ON public.contact_submissions
                                      FOR insert    WITH CHECK (true);

                                      DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
                                      CREATE POLICY "Admins can manage contact submissions"
                                          ON public.contact_submissions
                                              FOR all    USING (
                                                        EXISTS (
                                                                      SELECT 1 FROM public.profiles _await_response            WHERE profiles.id = auth.uid() _await_response            AND profiles.role = 'admin'
                                                        )
                                              );

                                              -- Ensure admin seeded
                                              UPDATE public.profiles SET role = 'admin' WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@test.com');
                                              
                                                        )
                                              )
)