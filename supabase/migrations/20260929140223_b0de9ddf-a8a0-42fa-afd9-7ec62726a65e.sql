
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_firm_member(_firm_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.firm_members m WHERE m.firm_id = _firm_id AND m.user_id = auth.uid());
$$;
CREATE OR REPLACE FUNCTION private.has_firm_role(_firm_id uuid, _role public.firm_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.firm_members m WHERE m.firm_id = _firm_id AND m.user_id = auth.uid() AND m.role = _role);
$$;
REVOKE EXECUTE ON FUNCTION private.is_firm_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.has_firm_role(uuid, public.firm_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_firm_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_firm_role(uuid, public.firm_role) TO authenticated, service_role;

DROP POLICY "firm scope" ON public.clients;
DROP POLICY "firm scope" ON public.documents;
DROP POLICY "firm scope" ON public.document_requests;
DROP POLICY "firm scope" ON public.tasks;
DROP POLICY "firm scope" ON public.deadlines;
DROP POLICY "firm scope" ON public.activity_log;
DROP POLICY "members read firm" ON public.firms;
DROP POLICY "admin update firm" ON public.firms;
DROP POLICY "members read members" ON public.firm_members;
DROP POLICY "self join own firm" ON public.firm_members;
DROP POLICY "admin manage members" ON public.firm_members;
DROP POLICY "admin delete members" ON public.firm_members;

CREATE POLICY "firm scope" ON public.clients FOR ALL TO authenticated USING (private.is_firm_member(firm_id)) WITH CHECK (private.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.documents FOR ALL TO authenticated USING (private.is_firm_member(firm_id)) WITH CHECK (private.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.document_requests FOR ALL TO authenticated USING (private.is_firm_member(firm_id)) WITH CHECK (private.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.tasks FOR ALL TO authenticated USING (private.is_firm_member(firm_id)) WITH CHECK (private.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.deadlines FOR ALL TO authenticated USING (private.is_firm_member(firm_id)) WITH CHECK (private.is_firm_member(firm_id));
CREATE POLICY "firm scope" ON public.activity_log FOR ALL TO authenticated USING (private.is_firm_member(firm_id)) WITH CHECK (private.is_firm_member(firm_id));
CREATE POLICY "members read firm" ON public.firms FOR SELECT TO authenticated USING (private.is_firm_member(id));
CREATE POLICY "admin update firm" ON public.firms FOR UPDATE TO authenticated USING (private.has_firm_role(id,'admin')) WITH CHECK (private.has_firm_role(id,'admin'));
CREATE POLICY "members read members" ON public.firm_members FOR SELECT TO authenticated USING (private.is_firm_member(firm_id));
CREATE POLICY "self join own firm" ON public.firm_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR private.has_firm_role(firm_id,'admin'));
CREATE POLICY "admin manage members" ON public.firm_members FOR UPDATE TO authenticated USING (private.has_firm_role(firm_id,'admin')) WITH CHECK (private.has_firm_role(firm_id,'admin'));
CREATE POLICY "admin delete members" ON public.firm_members FOR DELETE TO authenticated USING (private.has_firm_role(firm_id,'admin'));

CREATE OR REPLACE FUNCTION public.seed_demo_data(_firm_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c1 uuid; c2 uuid; c3 uuid; c4 uuid; c5 uuid; uid uuid := auth.uid();
BEGIN
  IF NOT private.is_firm_member(_firm_id) THEN RAISE EXCEPTION 'accès refusé'; END IF;
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

DROP FUNCTION IF EXISTS public.is_firm_member(uuid);
DROP FUNCTION IF EXISTS public.has_firm_role(uuid, public.firm_role);
REVOKE EXECUTE ON FUNCTION public.create_firm(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.seed_demo_data(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_firm(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_demo_data(uuid) TO authenticated;
