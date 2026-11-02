import Link from "next/link";
import { Avatar, Stars } from "@/components/ui";
import { ago } from "@/lib/format";

export type ReviewData = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorImage: string | null;
};

export function ReviewList({ reviews, empty }: { reviews: ReviewData[]; empty: string }) {
  if (!reviews.length) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {reviews.map((r) => (
        <li key={r.id} className="flex gap-4 py-5 first:pt-0">
          <Link href={`/u/${r.authorId}`} className="shrink-0">
            <Avatar src={r.authorImage} name={r.authorName} size={44} />
          </Link>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="font-bold">{r.title || r.authorName}</p>
              <Stars rating={r.rating} />
            </div>
            <p className="text-sm text-muted">
              {r.title && <>{r.authorName} · </>}
              {ago(r.createdAt)}
            </p>
            <p className="pt-1 leading-relaxed text-ink/85">{r.comment}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
