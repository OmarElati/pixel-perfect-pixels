import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/_authenticated/clients/$clientId")({
  component: ClientDetail,
});

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="data-label">{label}</p>
      <p className="mt-0.5 text-sm">{value || "—"}</p>
    </div>
  );
}

function ClientDetail() {
  const { clientId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const [client, docs, requests, tasks, deadlines, activity] = await Promise.all([
        supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
        supabase.from("documents").select("*").eq("client_id", clientId).order("created_at", {
          ascending: false,
        }),
        supabase.from("document_requests").select("*").eq("client_id", clientId).order("due_date"),
        supabase.from("tasks").select("*").eq("client_id", clientId).order("due_date"),
        supabase.from("deadlines").select("*").eq("client_id", clientId).order("due_date"),
        supabase
          .from("activity_log")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }),
      ]);
      return {
        client: client.data,
        docs: docs.data ?? [],
        requests: requests.data ?? [],
        tasks: tasks.data ?? [],
        deadlines: deadlines.data ?? [],
        activity: activity.data ?? [],
      };
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!data?.client) return <p className="text-sm text-muted-foreground">Client introuvable.</p>;

  const c = data.client;

  return (
    <div className="space-y-6">
      <Link to="/clients" className="text-xs text-primary hover:underline">
        ← Retour aux clients
      </Link>
      <PageHeader
        title={c.name}
        subtitle={[c.legal_form, c.sector].filter(Boolean).join(" · ")}
        actions={<StatusBadge value={c.status} />}
      />

      <section className="panel grid gap-4 p-4 sm:grid-cols-3">
        <Field label="Matricule fiscal" value={c.tax_id} />
        <Field label="Identifiant CNSS" value={c.cnss_id} />
        <Field label="E-mail" value={c.email} />
        <Field label="Téléphone" value={c.phone} />
        <Field label="Adresse" value={c.address} />
        <Field label="Notes internes" value={c.notes} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">
            Pièces demandées
          </header>
          <ul className="divide-y divide-border">
            {data.requests.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Aucune demande en cours.
              </li>
            )}
            {data.requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{r.label}</span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {r.due_date ?? "—"}
                  </span>
                  <StatusBadge value={r.status} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">
            Documents
          </header>
          <ul className="divide-y divide-border">
            {data.docs.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Aucun document.
              </li>
            )}
            {data.docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="min-w-0 truncate">
                  {d.name}
                  <span className="ml-2 text-xs text-muted-foreground">{d.category ?? "—"}</span>
                </span>
                <StatusBadge value={d.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">Tâches</header>
          <ul className="divide-y divide-border">
            {data.tasks.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">Aucune tâche.</li>
            )}
            {data.tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="min-w-0 truncate">{t.title}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {t.due_date ?? "—"}
                  </span>
                  <StatusBadge value={t.status} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">
            Historique
          </header>
          <ul className="divide-y divide-border">
            {data.activity.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Aucune activité.
              </li>
            )}
            {data.activity.map((a) => (
              <li key={a.id} className="px-4 py-2.5 text-sm">
                <p>
                  {a.action}
                  {a.detail ? ` — ${a.detail}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
