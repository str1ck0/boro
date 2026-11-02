import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Lend & borrow guidelines" };

const SECTIONS = [
  {
    title: "For everyone",
    points: [
      "Be friendly, be on time, and keep communication in Boro chat so there's a record.",
      "Meet somewhere you're comfortable. Only share your address once you've agreed a booking.",
      "Inspect the item together at pick-up and return. Snap a photo or two — it avoids disagreements later.",
      "Reviews should be honest and about the borrow, not the person.",
    ],
  },
  {
    title: "Borrowers",
    points: [
      "Treat it better than you'd treat your own. Return it clean, charged and on time.",
      "If something breaks, tell the lender straight away and offer to make it right.",
      "Running late? Message before the return date, not after.",
    ],
  },
  {
    title: "Lenders",
    points: [
      "Describe the item honestly, including wear and tear and anything missing.",
      "Include what's needed to use it — paddles, batteries, chargers, safety gear.",
      "Return bonds promptly once the item is back in the condition it left.",
    ],
  },
  {
    title: "Not allowed on Boro",
    points: [
      "Weapons, drugs, alcohol, vehicles requiring registration, or anything illegal to hire out.",
      "Items you don't own or don't have permission to lend.",
      "Listings that are really ads for a business or a sale.",
    ],
  },
];

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Lend & borrow guidelines" subtitle="A few simple rules that keep Boro friendly and fair." />
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-card bg-surface p-6 shadow-card">
            <h2 className="mb-3 text-xl font-bold">{s.title}</h2>
            <ul className="list-disc space-y-2 pl-5 text-ink/80 marker:text-outback">
              {s.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
