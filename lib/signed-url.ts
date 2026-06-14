import { supabaseServer } from "@/lib/supabase-server";

const BUCKET = "kya-documents";
const EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Converts a stored value into a viewable signed URL.
 * Handles both new-format stored paths (e.g. "user_123/passport_123.png")
 * and legacy full public URLs (extracts the path, then signs).
 * Returns null if no value provided.
 */
export async function getSignedUrl(storedValue: string | null | undefined): Promise<string | null> {
  if (!storedValue) return null;

  let path = storedValue;

  // Legacy support: if an old full public URL was stored, extract the path after the bucket name.
  const marker = `/object/public/${BUCKET}/`;
  if (storedValue.includes(marker)) {
    path = storedValue.split(marker)[1];
  } else {
    // Also handle the sign format just in case
    const signMarker = `/object/sign/${BUCKET}/`;
    if (storedValue.includes(signMarker)) {
      path = storedValue.split(signMarker)[1].split("?")[0];
    }
  }

  const { data, error } = await supabaseServer.storage
    .from(BUCKET)
    .createSignedUrl(path, EXPIRY_SECONDS);

  if (error || !data) {
    console.error("Signed URL generation failed for path:", path, error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Generates signed URLs for an array of objects that each contain a file_url field.
 * Returns the same objects with file_url replaced by a signed URL.
 */
export async function signDocumentUrls<T extends { file_url?: string | null }>(
  docs: T[]
): Promise<T[]> {
  return Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      file_url: await getSignedUrl(doc.file_url),
    }))
  );
}