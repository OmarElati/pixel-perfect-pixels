import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Building2,
  FileText,
  ListChecks,
  CalendarClock,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/lib/firm";
import { FirmSetup } from "@/components/firm-setup";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

const nav = [
  { to: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Building2 },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/taches", label: "Tâches", icon: ListChecks },
  { to: "/echeances", label: "Échéances", icon: CalendarClock },
] as const;

function Shell() {
  const { user } = Route.useRouteContext();
  const { data: firm, isLoading } = useFirm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b border-sidebar-border px-4 py-4">
          <div className="font-semibold tracking-tight text-sidebar-accent-foreground">
            Cabinet<span className="text-sidebar-primary">Flow</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-sidebar-foreground/70">
            {firm?.firms?.name ?? "—"}
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&.active]:bg-sidebar-accent [&.active]:font-medium [&.active]:text-sidebar-accent-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="truncate text-xs text-sidebar-foreground/70">{user.email}</div>
          <button
            onClick={signOut}
            className="mt-2 flex items-center gap-2 text-sm text-sidebar-foreground/85 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" /> Se déconnecter
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm whitespace-nowrap text-muted-foreground [&.active]:font-medium [&.active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="min-w-0 flex-1 p-4 md:p-6">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Chargement…</div>
          ) : firm ? (
            <Outlet />
          ) : (
            <FirmSetup />
          )}
        </main>
      </div>
    </div>
  );
}
