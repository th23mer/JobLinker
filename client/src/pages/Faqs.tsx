import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Comment creer un compte sur JobLinker ?",
    answer: "Cliquez sur S'inscrire, choisissez votre profil (candidat ou recruteur) et completez les champs demandes.",
  },
  {
    question: "J'ai oublie mon mot de passe, que faire ?",
    answer: "Sur la page de connexion, cliquez sur Mot de passe oublie et suivez le lien recu par email.",
  },
  {
    question: "Comment postuler a une offre ?",
    answer: "Connectez-vous en tant que candidat, ouvrez une offre puis cliquez sur Postuler.",
  },
  {
    question: "Comment contacter le support ?",
    answer: "Ecrivez-nous a contact@joblinker.tn. Nous vous repondrons dans les meilleurs delais.",
  },
];

export default function Faqs() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted/30 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary/10">
              <HelpCircle className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-extrabold">FAQ</h1>
              <p className="text-sm text-muted-foreground">Questions frequentes et assistance rapide.</p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Retour
          </Link>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <article key={item.question} className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-foreground">{item.question}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
