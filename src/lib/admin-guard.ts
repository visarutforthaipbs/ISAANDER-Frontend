import { getSession } from "@/lib/auth";

/** Admin emails — only these dashboard users can manage writer metadata */
const ADMIN_EMAILS = new Set(["visarutsankham@gmail.com"]);

/**
 * Verify the current request is from an admin.
 * Returns the session on success, null on failure.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (!ADMIN_EMAILS.has(session.email)) return null;
  return session;
}
