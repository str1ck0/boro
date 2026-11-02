import type { Metadata } from "next";
import { CalendarCheck, Handshake, MessageCircle, Search, Star, Upload } from "lucide-react";
import { ButtonLink, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "How Boro works" };

const BORROW = [
  { icon: Search, title: "Find it", body: "Search or browse for what you need near you. Check photos, reviews and the lender's profile." },
  { icon: CalendarCheck, title: "Request your dates", body: "Pick your dates and say hi. You're not charged anything — the lender confirms first." },
  { icon: MessageCircle, title: "Sort the details", body: "Once accepted, chat to arrange pick-up, payment and the bond. Your exact address is only shared when you choose." },
  { icon: Star, title: "Bring it back & review", body: "Return it as you found it. The lender marks it returned, then you both leave a review." },
];
const LEND = [
  { icon: Upload, title: "List it in two minutes", body: "Snap a few photos, set a daily price, a bond if you want one, and a minimum hire." },
  { icon: Handshake, title: "You choose who borrows", body: "Every borrow starts as a request. Check their profile and reviews, then accept or decline." },
  { icon: Star, title: "Build your reputation", body: "Great lenders get great reviews, and great reviews get more requests." },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-14">
      <PageHeader title="How Boro works" subtitle="Buy less, share more. Here's the whole thing in a minute." />
      <Steps title="Borrowing" steps={BORROW} accent="bg-outback-50 text-outback-700" />
      <Steps title="Lending" steps={LEND} accent="bg-daintree-50 text-daintree-700" />
      <section className="rounded-card bg-eureka-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold">What about payments?</h2>
        <p className="mt-2 max-w-2xl text-ink/80">
          Right now Boro is free to use and payments are arranged directly between members — cash, EFT or
          SnapScan at pick-up all work well. In-app payments and bond holding are on the way.
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/explore" size="lg">Start exploring</ButtonLink>
        <ButtonLink href="/lend" size="lg" variant="outline">Lend an item</ButtonLink>
      </div>
    </div>
  );
}

function Steps({ title, steps, accent }: { title: string; steps: typeof BORROW; accent: string }) {
  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold">{title}</h2>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-card bg-mist p-5">
            <div className={`mb-4 flex size-11 items-center justify-center rounded-2xl ${accent}`}>
              <s.icon className="size-5" />
            </div>
            <p className="text-sm font-semibold text-muted">Step {i + 1}</p>
            <h3 className="text-lg font-bold">{s.title}</h3>
            <p className="mt-1 text-[15px] text-ink/75">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
