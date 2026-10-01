CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.lead_status AS ENUM ('new','diagnostic_scheduled','roadmap_delivered');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- First authenticated user to call this becomes admin; afterwards it does nothing.
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN public.has_role(auth.uid(), 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  current_area text NOT NULL,
  transition_fear text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  status public.lead_status NOT NULL DEFAULT 'new',
  notes text,
  diagnostic_scheduled_at timestamptz,
  roadmap_delivered_at timestamptz,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit new leads" ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND notes IS NULL AND diagnostic_scheduled_at IS NULL AND roadmap_delivered_at IS NULL
    AND length(email) BETWEEN 3 AND 255 AND length(whatsapp) BETWEEN 10 AND 20
    AND length(current_area) BETWEEN 1 AND 120 AND length(transition_fear) BETWEEN 1 AND 500);
CREATE POLICY "Admins read leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update leads" ON public.leads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.leads_status_timestamps()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'diagnostic_scheduled' AND NEW.diagnostic_scheduled_at IS NULL THEN NEW.diagnostic_scheduled_at = now(); END IF;
    IF NEW.status = 'roadmap_delivered' AND NEW.roadmap_delivered_at IS NULL THEN NEW.roadmap_delivered_at = now(); END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER leads_status_ts BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.leads_status_timestamps();

INSERT INTO public.leads (current_area, transition_fear, email, whatsapp, status, diagnostic_scheduled_at, roadmap_delivered_at, source) VALUES
('Finanças','Estudar as coisas erradas','teste.financas@exemplo.com','5511900000001','new',NULL,NULL,'seed'),
('Administrativo','Não conseguir aproveitar minha experiência atual','teste.adm@exemplo.com','5511900000002','diagnostic_scheduled',now(),NULL,'seed'),
('Marketing','Não conseguir me posicionar para as vagas','teste.marketing@exemplo.com','5511900000003','roadmap_delivered',now() - interval '3 days',now(),'seed');