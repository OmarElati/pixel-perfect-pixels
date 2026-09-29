
CREATE TYPE public.firm_role AS ENUM ('admin','comptable','assistant');
CREATE TYPE public.client_status AS ENUM ('ACTIF','INACTIF','ARCHIVE','PROSPECT');
CREATE TYPE public.doc_status AS ENUM ('DEMANDE','DEPOSE','EN_REVUE','VALIDE','REJETE','ARCHIVE');
CREATE TYPE public.task_status AS ENUM ('A_FAIRE','EN_COURS','EN_VALIDATION','TERMINE');
CREATE TYPE public.task_priority AS ENUM ('BASSE','NORMALE','HAUTE','URGENTE');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE TABLE public.firms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.firms TO authenticated;
GRANT ALL ON public.firms TO service_role;
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.firm_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.firm_role NOT NULL DEFAULT 'comptable',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (firm_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.firm_members TO authenticated;
GRANT ALL ON public.firm_members TO service_role;
ALTER TABLE public.firm_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_firm_member(_firm_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.firm_members m WHERE m.firm_id = _firm_id AND m.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.has_firm_role(_firm_id uuid, _role public.firm_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.firm_members m WHERE m.firm_id = _firm_id AND m.user_id = auth.uid() AND m.role = _role);
$$;

CREATE POLICY "members read firm" ON public.firms FOR SELECT TO authenticated USING (public.is_firm_member(id));
CREATE POLICY "create firm" ON public.firms FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "admin update firm" ON public.firms FOR UPDATE TO authenticated USING (public.has_firm_role(id,'admin')) WITH CHECK (public.has_firm_role(id,'admin'));

CREATE POLICY "members read members" ON public.firm_members FOR SELECT TO authenticated USING (public.is_firm_member(firm_id));
CREATE POLICY "self join own firm" ON public.firm_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.has_firm_role(firm_id,'admin'));
CREATE POLICY "admin manage members" ON public.firm_members FOR UPDATE TO authenticated USING (public.has_firm_role(firm_id,'admin')) WITH CHECK (public.has_firm_role(firm_id,'admin'));
CREATE POLICY "admin delete members" ON public.firm_members FOR DELETE TO authenticated USING (public.has_firm_role(firm_id,'admin'));

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  name text NOT NULL,
  legal_form text,
  tax_id text,
  cnss_id text,
  address text,
  phone text,
  email text,
  sector text,
  status public.client_status NOT NULL DEFAULT 'ACTIF',
  assigned_to uuid,
  notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  year int,
  month int,
  status public.doc_status NOT NULL DEFAULT 'DEPOSE',
  storage_path text,
  uploaded_by uuid,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  label text NOT NULL,
  due_date date,
  status public.doc_status NOT NULL DEFAULT 'DEMANDE',
  created_by uuid,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assignee uuid,
  priority public.task_priority NOT NULL DEFAULT 'NORMALE',
  status public.task_status NOT NULL DEFAULT 'A_FAIRE',
  due_date date,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text,
  due_date date NOT NULL,
  done boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  actor uuid,
  action text NOT NULL,
  detail text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deadlines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_log TO authenticated;
GRANT ALL ON public.clients, public.documents, public.document_requests, public.tasks, public.deadlines, public.activity_log TO service_role;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "firm scope" ON public.clients FOR ALL TO authenticated USING (public.is_firm_member(firm_id)) WITH CHECK (public.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.documents FOR ALL TO authenticated USING (public.is_firm_member(firm_id)) WITH CHECK (public.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.document_requests FOR ALL TO authenticated USING (public.is_firm_member(firm_id)) WITH CHECK (public.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.tasks FOR ALL TO authenticated USING (public.is_firm_member(firm_id)) WITH CHECK (public.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.deadlines FOR ALL TO authenticated USING (public.is_firm_member(firm_id)) WITH CHECK (public.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.activity_log FOR ALL TO authenticated USING (public.is_firm_member(firm_id)) WITH CHECK (public.is_firm_member(firm_id));

CREATE INDEX ON public.clients (firm_id);
CREATE INDEX ON public.documents (firm_id, client_id);
CREATE INDEX ON public.tasks (firm_id, status);
CREATE INDEX ON public.deadlines (firm_id, due_date);
CREATE INDEX ON public.activity_log (firm_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Création d'un cabinet + rattachement de l'utilisateur comme admin
CREATE OR REPLACE FUNCTION public.create_firm(_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'non authentifié'; END IF;
  INSERT INTO public.firms (name, created_by) VALUES (_name, auth.uid()) RETURNING id INTO _id;
  INSERT INTO public.firm_members (firm_id, user_id, role) VALUES (_id, auth.uid(), 'admin');
  RETURN _id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_firm(text) TO authenticated;

-- Jeu de données de démonstration pour le cabinet courant
CREATE OR REPLACE FUNCTION public.seed_demo_data(_firm_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c1 uuid; c2 uuid; c3 uuid; c4 uuid; c5 uuid; uid uuid := auth.uid();
BEGIN
  IF NOT public.is_firm_member(_firm_id) THEN RAISE EXCEPTION 'accès refusé'; END IF;
  IF EXISTS (SELECT 1 FROM public.clients WHERE firm_id = _firm_id AND is_demo) THEN RETURN; END IF;

  INSERT INTO public.clients (firm_id,name,legal_form,tax_id,cnss_id,address,phone,email,sector,status,assigned_to,notes,is_demo) VALUES
   (_firm_id,'ABC SARL','SARL','1234567/A/M/000','10203040','12 rue de Carthage, Tunis','+216 71 000 111','contact@abc.tn','Commerce','ACTIF',uid,'Dossier mensuel CNSS + TVA',true) RETURNING id INTO c1;
  INSERT INTO public.clients (firm_id,name,legal_form,tax_id,cnss_id,address,phone,email,sector,status,assigned_to,is_demo) VALUES
   (_firm_id,'Medina Textile SA','SA','7654321/B/M/000','20304050','Zone industrielle, Sousse','+216 73 222 333','info@medinatextile.tn','Industrie','ACTIF',uid,true) RETURNING id INTO c2;
  INSERT INTO public.clients (firm_id,name,legal_form,tax_id,cnss_id,address,phone,email,sector,status,assigned_to,is_demo) VALUES
   (_firm_id,'Sahara Logistics SUARL','SUARL','1112223/C/M/000','30405060','Av. Habib Bourguiba, Sfax','+216 74 444 555','contact@saharalog.tn','Transport','ACTIF',uid,true) RETURNING id INTO c3;
  INSERT INTO public.clients (firm_id,name,legal_form,sector,status,is_demo) VALUES
   (_firm_id,'Cap Bon Agri','SARL','Agroalimentaire','PROSPECT',true) RETURNING id INTO c4;
  INSERT INTO public.clients (firm_id,name,legal_form,sector,status,is_demo) VALUES
   (_firm_id,'Nour Consulting','SUARL','Services','INACTIF',true) RETURNING id INTO c5;

  INSERT INTO public.tasks (firm_id,client_id,title,description,assignee,priority,status,due_date,is_demo) VALUES
   (_firm_id,c1,'Déclaration CNSS mensuelle','Préparer et déposer la déclaration du mois',uid,'HAUTE','EN_COURS',CURRENT_DATE,true),
   (_firm_id,c1,'Saisie factures achats',NULL,uid,'NORMALE','A_FAIRE',CURRENT_DATE + 3,true),
   (_firm_id,c2,'Rapprochement bancaire',NULL,uid,'NORMALE','EN_COURS',CURRENT_DATE - 2,true),
   (_firm_id,c2,'Déclaration TVA','Dépôt avant le 28',uid,'URGENTE','A_FAIRE',CURRENT_DATE + 1,true),
   (_firm_id,c3,'Bulletins de paie',NULL,uid,'HAUTE','A_FAIRE',CURRENT_DATE - 1,true),
   (_firm_id,c3,'Clôture annuelle',NULL,uid,'BASSE','EN_VALIDATION',CURRENT_DATE + 20,true),
   (_firm_id,c1,'Archivage pièces 2025',NULL,uid,'BASSE','TERMINE',CURRENT_DATE - 10,true);

  INSERT INTO public.document_requests (firm_id,client_id,label,due_date,status,created_by,is_demo) VALUES
   (_firm_id,c1,'Relevé bancaire',CURRENT_DATE + 5,'DEMANDE',uid,true),
   (_firm_id,c1,'Factures d''achat',CURRENT_DATE + 5,'DEMANDE',uid,true),
   (_firm_id,c1,'CIN du gérant',CURRENT_DATE + 2,'DEPOSE',uid,true),
   (_firm_id,c2,'Journal de paie',CURRENT_DATE + 7,'DEMANDE',uid,true),
   (_firm_id,c3,'Déclaration CNSS signée',CURRENT_DATE + 3,'DEMANDE',uid,true);

  INSERT INTO public.documents (firm_id,client_id,name,category,year,month,status,uploaded_by,is_demo) VALUES
   (_firm_id,c1,'Relevé bancaire - Août 2026.pdf','Bancaire',2026,8,'VALIDE',uid,true),
   (_firm_id,c1,'Déclaration CNSS - Août 2026.pdf','CNSS',2026,8,'EN_REVUE',uid,true),
   (_firm_id,c2,'Factures ventes - Septembre 2026.zip','Fiscal',2026,9,'DEPOSE',uid,true),
   (_firm_id,c3,'Contrat de bail.pdf','Contrats',2026,1,'VALIDE',uid,true),
   (_firm_id,c2,'CIN gérant.pdf','Administratif',2026,3,'REJETE',uid,true);

  INSERT INTO public.deadlines (firm_id,client_id,title,kind,due_date,done,is_demo) VALUES
   (_firm_id,c1,'Déclaration CNSS','CNSS',CURRENT_DATE + 4,false,true),
   (_firm_id,c2,'Déclaration TVA','Fiscal',CURRENT_DATE + 1,false,true),
   (_firm_id,c3,'Acompte provisionnel','Fiscal',CURRENT_DATE + 12,false,true),
   (_firm_id,c1,'Dépôt états financiers','Fiscal',CURRENT_DATE - 3,false,true);

  INSERT INTO public.activity_log (firm_id,client_id,actor,action,detail,is_demo,created_at) VALUES
   (_firm_id,c1,uid,'Document validé','Relevé bancaire - Août 2026',true,now() - interval '1 day'),
   (_firm_id,c1,uid,'Demande envoyée','Factures d''achat',true,now() - interval '2 day'),
   (_firm_id,c2,uid,'Document déposé','Factures ventes - Septembre 2026',true,now() - interval '3 day'),
   (_firm_id,c3,uid,'Tâche créée','Bulletins de paie',true,now() - interval '4 day');
END;
$$;
GRANT EXECUTE ON FUNCTION public.seed_demo_data(uuid) TO authenticated;
