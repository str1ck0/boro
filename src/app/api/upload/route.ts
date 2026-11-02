import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isAllowedImage, MAX_UPLOAD_BYTES, storeImage } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const folder = form.get("folder") === "avatars" ? "avatars" : "items";

  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!isAllowedImage(file.type)) {
    return NextResponse.json({ error: "Photos must be JPG, PNG, WebP or AVIF." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "That photo is too large (max 4MB)." }, { status: 413 });
  }

  const url = await storeImage(file, folder);
  return NextResponse.json({ url });
}
