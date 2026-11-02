import { Badge } from "@/components/ui";

const MAP = {
  requested: { tone: "eureka", label: "Requested" },
  accepted: { tone: "daintree", label: "Confirmed" },
  declined: { tone: "neutral", label: "Declined" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  completed: { tone: "cosmos", label: "Returned" },
} as const;

export type BookingStatus = keyof typeof MAP;

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = MAP[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
