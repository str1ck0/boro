import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser } from "@/lib/session";
import { countPendingRequests, countUnreadConversations } from "@/lib/queries";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const [unread, pending] = user
    ? await Promise.all([countUnreadConversations(user.id), countPendingRequests(user.id)])
    : [0, 0];
  const nav = { signedIn: !!user, unread, pending, image: user?.image ?? null, name: user?.name ?? "" };

  return (
    <>
      <SiteHeader {...nav} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 md:pb-16 md:pt-8">{children}</main>
      <SiteFooter />
      <BottomNav {...nav} />
    </>
  );
}
