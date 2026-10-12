CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE,
  owner_name text NOT NULL,
  phone text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  shop_name text NOT NULL,
  category text NOT NULL,
  zone text NOT NULL,
  landmark text,
  description text,
  offers_delivery boolean NOT NULL DEFAULT true,
  accepts_mpesa boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shops_language_chk CHECK (language IN ('en','sw')),
  CONSTRAINT shops_status_chk CHECK (status IN ('pending','approved','rejected'))
);
GRANT SELECT, INSERT, UPDATE ON public.shops TO authenticated;
GRANT ALL ON public.shops TO service_role;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own shop" ON public.shops FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners create own shop" ON public.shops FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND status = 'pending');
CREATE POLICY "Owners update own shop" ON public.shops FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- owners may not approve themselves
CREATE OR REPLACE FUNCTION public.shops_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND current_user = 'authenticated' THEN
    NEW.status := OLD.status;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER shops_guard BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.shops_guard();