"use client";

import { useActionState } from "react";
import { PhotoUploader } from "@/components/photo-uploader";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { CATEGORIES } from "@/lib/categories";
import type { FormState } from "@/lib/form";
import { SUBURBS } from "@/lib/suburbs";

export type ItemFormValues = {
  title: string;
  description: string;
  category: string;
  suburb: string;
  pricePerDay: string;
  bond: string;
  minDays: string;
  photos: string[];
};

export function ItemForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  initial: ItemFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const v = { ...initial, ...state.values };
  const e = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Photos</h2>
        <PhotoUploader initial={initial.photos} error={e.photos} />
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-bold">The basics</h2>
        <Field label="Title" htmlFor="title" error={e.title} hint="e.g. “Two-person sea kayak with paddles”">
          <Input id="title" name="title" defaultValue={v.title} maxLength={80} required aria-invalid={!!e.title} />
        </Field>
        <Field label="Description" htmlFor="description" error={e.description} hint="Condition, what's included, any tips for using it.">
          <Textarea id="description" name="description" defaultValue={v.description} maxLength={2000} rows={6} required aria-invalid={!!e.description} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="category" error={e.category}>
            <Select id="category" name="category" defaultValue={v.category} required aria-invalid={!!e.category}>
              <option value="" disabled>Choose one</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Pick-up suburb" htmlFor="suburb" error={e.suburb} hint="Only your suburb is shown — never your address.">
            <Input id="suburb" name="suburb" list="suburbs" defaultValue={v.suburb} autoComplete="address-level2" required aria-invalid={!!e.suburb} />
            <datalist id="suburbs">
              {SUBURBS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </Field>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-bold">Price &amp; terms</h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <Field label="Price per day" htmlFor="pricePerDay" error={e.pricePerDay}>
            <MoneyInput id="pricePerDay" name="pricePerDay" defaultValue={v.pricePerDay} invalid={!!e.pricePerDay} />
          </Field>
          <Field label="Bond" htmlFor="bond" error={e.bond} hint="Refundable. R0 for none.">
            <MoneyInput id="bond" name="bond" defaultValue={v.bond} invalid={!!e.bond} />
          </Field>
          <Field label="Minimum days" htmlFor="minDays" error={e.minDays}>
            <Input id="minDays" name="minDays" type="number" inputMode="numeric" min={1} max={60} defaultValue={v.minDays} />
          </Field>
        </div>
      </section>

      {state.error && <p className="rounded-2xl bg-outback-50 p-4 font-medium text-outback">{state.error}</p>}
      {Object.keys(e).length > 0 && (
        <p className="font-medium text-outback" role="alert">A few things need fixing — see above.</p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function MoneyInput({ invalid, ...props }: { id: string; name: string; defaultValue: string; invalid: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">R</span>
      <Input {...props} type="number" inputMode="decimal" min={0} step="1" className="pl-8" aria-invalid={invalid} />
    </div>
  );
}
