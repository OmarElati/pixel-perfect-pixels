import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/lib/firm";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/_authenticated/tableau-de-bord")({
  component: Dashboard,
});

function useDashboard(firmId: string | undefined) {
  return useQuery({
    enabled: !!firmId,
    queryKey: ["dashboard", firmId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [clients, docs, requests, tasks, deadlines, activity] = await Promise.all([
        supabase.from("clients").select("id, status").eq("firm_id", firmId!),
        supabase.from("documents").select("id, status").eq("firm_id", firmId!),
        supabase.from("document_requests").select("id, status").eq("firm_id", firmId!),
        supabase.from("tasks").select("id, status, due_date, title, client_id").eq("firm_id", firmId!),
        supabase
          .from("deadlines")
          .select("id, title, due_date, kind, done, clients(name)")
          .eq("firm_id", firmId!)
          .eq("done", false)
          .order("due_date"),
        supabase
          .from("activity_log")
          .select("id, action, detail, created_at, clients(name)")
          .eq("firm_id", firmId!)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      const t = tasks.data ?? [];
      return {
        activeClients: (clients.data ?? []).filter((c) => c.status === "ACTIF").length,
        prospects: (clients.data ?? []).filter((c) => c.status === "PROSPECT").length,
        docsReview: (docs.data ?? []).filter((d) => d.status === "EN_REVUE").length,
        docsRequested: (requests.data ?? []).filter((r) => r.status === "DEMANDE").length,
        tasksToday: t.filter((x) => x.due_date === today && x.status !== "TERMINE").length,
        tasksLate: t.filter(
          (x) => x.due_date && x.due_date < today && x.status !== "TERMINE",
        ).length,
        deadlines: deadlines.data ?? [],
        activity: activity.data ?? [],
      };
    },
  });
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "alert" }) {
  return (
    <div className="bg-card p-4">
      <p className="data-label">{label}</p>
      <p
        className={`mt-1 font-mono text-2xl ${tone === "alert" && value > 0 ? "text-destructive" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function Dashboard() {
  const { data: firm } = useFirm();
  const { data, isLoading } = useDashboard(firm?.firm_id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={firm?.firms?.name ? `Cabinet ${firm.firms.name}` : undefined}
      />

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <>
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
            <Metric label="Clients actifs" value={data.activeClients} />
            <Metric label="Prospects" value={data.prospects} />
            <Metric label="Pièces demandées" value={data.docsRequested} />
            <Metric label="Docs à contrôler" value={data.docsReview} />
            <Metric label="Tâches du jour" value={data.tasksToday} />
            <Metric label="Tâches en retard" value={data.tasksLate} tone="alert" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="panel">
              <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Prochaines échéances</h2>
                <Link to="/echeances" className="text-xs text-primary hover:underline">
                  Tout voir
                </Link>
              </header>
              {data.deadlines.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Aucune échéance en cours.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.deadlines.slice(0, 6).map((d) => {
                    const late = d.due_date < new Date().toISOString().slice(0, 10);
                    return (
                      <li key={d.id} className="flex items-center justify-between px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm">{d.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {d.clients?.name ?? "—"} · {d.kind ?? "Autre"}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-xs ${late ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {d.due_date}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="panel">
              <header className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Activité récente</h2>
              </header>
              {data.activity.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Aucune activité enregistrée.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.activity.map((a) => (
                    <li key={a.id} className="px-4 py-2.5">
                      <p className="text-sm">
                        {a.action}
                        {a.detail ? ` — ${a.detail}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.clients?.name ?? "—"} ·{" "}
                        {new Date(a.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {data.activeClients === 0 && (
            <EmptyState
              title="Aucun client actif"
              hint="Ajoutez votre premier client depuis la page Clients."
            />
          )}
          <p className="text-xs text-muted-foreground">
            <StatusBadge value="PROSPECT" className="mr-2" />
            Les données marquées comme démonstration sont fictives.
          </p>
        </>
      )}
    </div>
  );
}
