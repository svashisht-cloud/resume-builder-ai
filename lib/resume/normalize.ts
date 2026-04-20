export function normalizeJD(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, ' ').trim();
}

export async function hashJD(raw: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizeJD(raw));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function extractJobMeta(jd: string): { jobTitle: string | null; companyName: string | null } {
  const lines = jd.split('\n');
  let jobTitle: string | null = null;
  let companyName: string | null = null;

  const titleRe = /^(?:job\s+title|position|role|title)\s*[:–\-]\s*(.+)/i;
  const companyRe = /^(?:company|organization|employer|hiring\s+company)\s*[:–\-]\s*(.+)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!jobTitle) {
      const m = titleRe.exec(trimmed);
      if (m) { jobTitle = m[1].trim(); continue; }
    }
    if (!companyName) {
      const m = companyRe.exec(trimmed);
      if (m) { companyName = m[1].trim(); continue; }
    }
    if (jobTitle && companyName) break;
  }

  // Fall back: first non-empty line as job title if nothing matched
  if (!jobTitle) {
    jobTitle = lines.find((l) => l.trim().length > 0)?.trim() ?? null;
    // Clamp overly long first lines (probably a paragraph, not a title)
    if (jobTitle && jobTitle.length > 120) jobTitle = null;
  }

  return { jobTitle, companyName };
}
