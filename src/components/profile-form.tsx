"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/account";
import { Avatar, Button, Field, Input, Textarea } from "@/components/ui";
import type { FormState } from "@/lib/form";
import { uploadImage } from "@/lib/resize-image";
import { SUBURBS } from "@/lib/suburbs";

type Props = { name: string; suburb: string; bio: string; image: string | null; email: string };

export function ProfileForm(initial: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const [image, setImage] = useState(initial.image);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const file = useRef<HTMLInputElement>(null);
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-6">
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar src={image} name={initial.name} size={88} />
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white">
              <Loader2 className="size-6 animate-spin" />
            </span>
          )}
        </div>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => file.current?.click()}>
            <Camera className="size-4" /> {image ? "Change photo" : "Add a photo"}
          </Button>
          <p className="mt-1 text-sm text-muted">{uploadError ?? "A friendly face gets more yeses."}</p>
        </div>
        <input type="hidden" name="image" value={image ?? ""} />
        <input
          ref={file}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={async (ev) => {
            const f = ev.target.files?.[0];
            if (!f) return;
            setUploading(true);
            setUploadError(undefined);
            try {
              setImage(await uploadImage(f, "avatars"));
            } catch (err) {
              setUploadError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setUploading(false);
            }
          }}
        />
      </div>

      <Field label="Name" htmlFor="name" error={e.name}>
        <Input id="name" name="name" defaultValue={state.values?.name ?? initial.name} autoComplete="name" required />
      </Field>
      <Field label="Email" htmlFor="email" hint="Your email is never shown to other members.">
        <Input id="email" value={initial.email} disabled className="bg-canvas text-muted" />
      </Field>
      <Field label="Suburb" htmlFor="suburb" error={e.suburb} hint="Shown on your profile and used as your default pick-up spot.">
        <Input id="suburb" name="suburb" list="suburb-list" defaultValue={state.values?.suburb ?? initial.suburb} />
        <datalist id="suburb-list">{SUBURBS.map((s) => <option key={s} value={s} />)}</datalist>
      </Field>
      <Field label="About you" htmlFor="bio" error={e.bio} hint="What do you get up to? What gear do you have?">
        <Textarea id="bio" name="bio" defaultValue={state.values?.bio ?? initial.bio} maxLength={600} rows={5} />
      </Field>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending || uploading}>{pending ? "Saving…" : "Save profile"}</Button>
        {state.ok && !pending && (
          <span className="inline-flex items-center gap-1 font-semibold text-daintree-700"><Check className="size-4" /> Saved</span>
        )}
      </div>
    </form>
  );
}
