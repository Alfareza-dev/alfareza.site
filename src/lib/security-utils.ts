export function formatSafeIP(rawIP: string | null): string {
  if (!rawIP) return "Unknown IP";
  let ip = String(rawIP); // Explicit cast to secure against unhandled edge properties
  // If list, take first
  if (ip.includes(",")) {
    ip = ip.split(",")[0];
  }
  // Trim spaces and recursive trailing dots
  ip = ip.replace(/[.\s]+$/, "").trim();
  // Strip IPv6 headers
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  return ip || "Unknown IP";
}
