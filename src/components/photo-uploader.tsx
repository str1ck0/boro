"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { uploadImage } from "@/lib/resize-image";
import { cn } from "@/lib/cn";

const MAX = 8;

export function PhotoUploader({ initial = [], error }: { initial?: string[]; error?: string }) {
  const [photos, setPhotos] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(undefined);
    const list = Array.from(files).slice(0, MAX - photos.length);
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const url = await uploadImage(file);
          setPhotos((p) => [...p, url].slice(0, MAX));
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
    if (input.current) input.current.value = "";
  }

  const makeCover = (i: number) => setPhotos((p) => [p[i], ...p.filter((_, j) => j !== i)]);
  const remove = (i: number) => setPhotos((p) => p.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((src, i) => (
          <div key={src} className={cn("group relative aspect-square overflow-hidden rounded-2xl bg-line", i === 0 && "col-span-2 row-span-2")}>
            <Image src={src} alt="" fill sizes="300px" className="object-cover" />
            <input type="hidden" name="photos" value={src} />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-bold">Cover photo</span>
            )}
            <div className="absolute right-2 top-2 flex gap-1.5">
              {i > 0 && (
                <button type="button" onClick={() => makeCover(i)} aria-label="Make cover photo" className="flex size-8 items-center justify-center rounded-full bg-surface/95 shadow-sm">
                  <Star className="size-4" />
                </button>
              )}
              <button type="button" onClick={() => remove(i)} aria-label="Remove photo" className="flex size-8 items-center justify-center rounded-full bg-surface/95 shadow-sm">
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`u${i}`} className="flex aspect-square items-center justify-center rounded-2xl bg-outback-50 text-outback-600">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ))}
        {photos.length + uploading < MAX && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-outback-600 transition hover:bg-outback-50",
              error ? "border-outback-600" : "border-outback/40",
              photos.length === 0 && "col-span-3 aspect-[3/1] sm:col-span-4 sm:aspect-[4/1]",
            )}
          >
            <ImagePlus className="size-7" />
            <span className="text-sm font-semibold">{photos.length ? "Add more" : "Add photos"}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <p className={cn("text-sm", error || uploadError ? "text-outback-700" : "text-muted")}>
        {uploadError ?? error ?? `${photos.length}/${MAX} photos — show the item's condition. The first one is the cover.`}
      </p>
    </div>
  );
}
