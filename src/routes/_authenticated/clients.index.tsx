import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useFirm } from "@/lib/firm";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  const { data: firm } = useFirm();
  const firmId = firm?.firm_id;
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    enabled: !!firmId,
    queryKey: ["clients", firmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("firm_id", firmId!)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createClient = useMutation({
    mutationFn: async (form: Record<string, string>) => {
      const { error } = await supabase.from("clients").insert({
        firm_id: firmId!,
        name: form.name,
        legal_form: form.legal_form || null,
        tax_id: form.tax_id || null,
        cnss_id: form.cnss_id || null,
        email: form.email || null,
        phone: form.phone || null,
        sector: form.sector || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client créé");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["clients", firmId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (clients ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        subtitle={`${clients?.length ?? 0} dossier(s) au cabinet`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Nouveau client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  createClient.mutate(Object.fromEntries(fd) as Record<string, string>);
                }}
              >
                {[
                  ["name", "Raison sociale", true],
                  ["legal_form", "Forme juridique", false],
                  ["tax_id", "Matricule fiscal", false],
                  ["cnss_id", "Identifiant CNSS", false],
                  ["email", "E-mail", false],
                  ["phone", "Téléphone", false],
                  ["sector", "Secteur", false],
                ].map(([key, label, required]) => (
                  <div key={key as string} className="space-y-1.5">
                    <Label htmlFor={key as string}>{label as string}</Label>
                    <Input id={key as string} name={key as string} required={required as boolean} />
                  </div>
                ))}
                <Button type="submit" className="w-full" disabled={createClient.isPending}>
                  Enregistrer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Input
        placeholder="Rechercher un client…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun client" hint="Créez votre premier dossier client." />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Raison sociale</th>
                <th className="px-4 py-2 font-medium">Forme</th>
                <th className="px-4 py-2 font-medium">Matricule fiscal</th>
                <th className="px-4 py-2 font-medium">CNSS</th>
                <th className="px-4 py-2 font-medium">Secteur</th>
                <th className="px-4 py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2">
                    <Link
                      to="/clients/$clientId"
                      params={{ clientId: c.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{c.legal_form ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{c.tax_id ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{c.cnss_id ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.sector ?? "—"}</td>
                  <td className="px-4 py-2">
                    <StatusBadge value={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
