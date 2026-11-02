import Link from "next/link";
import { MessageCircle, Plus, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";
import { UserMenu } from "@/components/user-menu";

type Props = { signedIn: boolean; unread: number; pending: number; image: string | null; name: string };

export function SiteHeader({ signedIn, unread, pending, image, name }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Boro home">
          <Logo className="h-7" />
        </Link>

        <form action="/explore" className="relative ml-4 hidden max-w-md flex-1 md:block" role="search">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            type="search"
            placeholder="Looking for something?"
            aria-label="Search Boro"
            className="h-11 w-full rounded-full border border-transparent bg-mist focus:bg-surface pl-11 pr-4 text-[15px] placeholder:text-muted/80 focus:border-cosmos focus:outline-none focus:ring-4 focus:ring-cosmos/10"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1" aria-label="Main">
          <Link href="/explore" className="hidden rounded-full px-4 py-2 text-[15px] font-semibold hover:bg-ink/5 md:block">
            Explore
          </Link>
          {signedIn ? (
            <>
              <Link
                href="/my-boro"
                className="relative hidden rounded-full px-4 py-2 text-[15px] font-semibold hover:bg-ink/5 md:block"
              >
                My Boro
                {pending > 0 && (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-outback" aria-label={`${pending} pending requests`} />
                )}
              </Link>
              <Link
                href="/messages"
                aria-label={unread ? `Messages, ${unread} unread` : "Messages"}
                className="relative hidden size-11 items-center justify-center rounded-full hover:bg-ink/5 md:flex"
              >
                <MessageCircle className="size-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-outback px-1 text-[11px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <ButtonLink href="/lend" size="sm" className="ml-2 max-md:hidden">
                <Plus className="size-4" /> Lend an item
              </ButtonLink>
              <div className="ml-2">
                <UserMenu image={image} name={name} />
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-full px-4 py-2 text-[15px] font-semibold hover:bg-ink/5">
                Log in
              </Link>
              <ButtonLink href="/sign-up" size="sm" variant="secondary">
                Join Boro
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

