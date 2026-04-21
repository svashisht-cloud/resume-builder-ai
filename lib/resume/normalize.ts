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

  // Pass 0: detect emoji-labeled sections (e.g. "💻 Role\nSoftware Engineer\n\n🏢 Company\nSnapchat")
  const emojiLineRe = /^[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}]/u;
  let lastEmojiLabel = '';
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { lastEmojiLabel = ''; continue; }
    if (emojiLineRe.test(t)) {
      lastEmojiLabel = t.replace(/^[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}\s]+/u, '').toLowerCase();
      continue;
    }
    if (lastEmojiLabel) {
      if (!jobTitle && /\b(role|position|title|job)\b/.test(lastEmojiLabel)) jobTitle = t;
      if (!companyName && /\b(company|organization|employer)\b/.test(lastEmojiLabel)) companyName = t;
      lastEmojiLabel = '';
    }
    if (jobTitle && companyName) break;
  }

  // Pass 1: labeled fields (e.g. "Job Title: Software Engineer", "Company: Snapchat")
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

  // Fallback: first non-empty, non-emoji-header line as job title
  if (!jobTitle) {
    jobTitle = lines.find((l) => {
      const t = l.trim();
      return t.length > 0 && t.length <= 120 && !emojiLineRe.test(t);
    })?.trim() ?? null;
  }

  return { jobTitle, companyName };
}
