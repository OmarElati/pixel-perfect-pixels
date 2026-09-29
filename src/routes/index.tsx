import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CabinetFlow — Le poste de pilotage du cabinet comptable" },
      {
        name: "description",
        content:
          "Clients, documents, demandes de pièces, tâches et échéances : tout le travail du cabinet dans un espace unique et cloisonné.",
      },
      { property: "og:title", content: "CabinetFlow — Pilotage de cabinet comptable" },
      {
        property: "og:description",
        content: "Organisez clients, documents, tâches et échéances de votre cabinet comptable.",
      },
    ],
  }),
  component: Landing,
});

const points = [
  ["Clients", "Fiche complète : identifiants fiscaux, CNSS, contacts, statut, comptable assigné."],
  ["Documents", "Dépôt, catégories, statuts de validation et recherche transversale."],
  ["Demandes de pièces", "Listes de pièces à réclamer, suivies jusqu'à réception."],
  ["Tâches", "Priorités, responsables, échéances, retards visibles immédiatement."],
  ["Échéances", "Calendrier fiscal et CNSS par client, alertes sur les dates proches."],
  ["Cloisonnement", "Chaque cabinet dispose d'un espace strictement isolé."],
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-semibold tracking-tight">
            Cabinet<span className="text-primary">Flow</span>
          </span>
          <Button asChild size="sm">
            <Link to="/auth">Accéder au cabinet</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="data-label">Logiciel de cabinet comptable</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight">
          Tout le travail du cabinet, organisé au même endroit.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          CabinetFlow réunit vos dossiers clients, les pièces reçues, les tâches de l'équipe et les
          échéances fiscales et CNSS dans une interface pensée pour un usage quotidien.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link to="/auth">Créer mon espace cabinet</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {points.map(([title, text]) => (
            <div key={title} className="bg-card p-5">
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
