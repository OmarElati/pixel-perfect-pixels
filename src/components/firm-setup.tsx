import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function FirmSetup() {
  const [name, setName] = useState("");
  const [demo, setDemo] = useState(true);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("create_firm", { _name: name });
      if (error) throw error;
      if (demo && data) {
        const { error: seedError } = await supabase.rpc("seed_demo_data", { _firm_id: data });
        if (seedError) throw seedError;
      }
      await queryClient.invalidateQueries();
      toast.success("Cabinet créé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-xl font-semibold">Créer votre cabinet</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Votre espace est privé : aucun autre cabinet n'y a accès.
      </p>
      <form onSubmit={create} className="panel mt-6 space-y-4 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="firm">Nom du cabinet</Label>
          <Input
            id="firm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cabinet Ben Salah & Associés"
            required
          />
        </div>
        <label className="flex items-start gap-2.5 text-sm">
          <Checkbox checked={demo} onCheckedChange={(v) => setDemo(v === true)} className="mt-0.5" />
          <span className="text-muted-foreground">
            Charger un jeu de données de démonstration (clients, documents, tâches et échéances
            fictifs, supprimables à tout moment).
          </span>
        </label>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Création…" : "Créer le cabinet"}
        </Button>
      </form>
    </div>
  );
}
