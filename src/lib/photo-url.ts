/** Accept only images we host: local seed/uploads, or our Vercel Blob store. */
export function isOwnPhotoUrl(u: string) {
  return (
    u.startsWith("/uploads/") ||
    u.startsWith("/seed/") ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(u)
  );
}
