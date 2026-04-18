import type { SectionKey } from "@/types";

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "summary",
  "education",
  "skills",
  "experience",
  "projects",
  "certifications",
];

const SECTION_PATTERNS: Array<{ key: SectionKey; patterns: RegExp[] }> = [
  {
    key: "summary",
    patterns: [
      /^(summary|objective|profile|about me?|professional summary|career summary|executive summary)$/i,
    ],
  },
  {
    key: "experience",
    patterns: [
      /^(experience|work experience|professional experience|employment|work history|career history|employment history|relevant experience|technical experience)$/i,
    ],
  },
  {
    key: "education",
    patterns: [/^(education|academic background|academics?|degrees?)$/i],
  },
  {
    key: "skills",
    patterns: [
      /^(skills|technical skills|technologies|core competencies|competencies|expertise|technical expertise|core skills|key skills|languages? (and|&) frameworks?)$/i,
    ],
  },
  {
    key: "projects",
    patterns: [
      /^(projects?|personal projects?|side projects?|portfolio|notable projects?|selected projects?)$/i,
    ],
  },
  {
    key: "certifications",
    patterns: [
      /^(certifications?|credentials?|professional certifications?|licenses? (and|&) certifications?|licenses?)$/i,
    ],
  },
];

/**
 * Scans raw resume text for section headers and returns their keys in the
 * order they appear. Any keys not detected are appended at the end using the
 * default order, so the returned array always contains all 6 known keys.
 */
export function detectSectionOrder(resumeText: string): SectionKey[] {
  const lines = resumeText.split("\n");
  const detected: SectionKey[] = [];
  const detectedSet = new Set<SectionKey>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    // Skip empty lines and lines too long to be section headers
    if (!line || line.length > 80) continue;

    // Strip common heading decorators (dashes, equals, hashes, asterisks, colons)
    const normalized = line.replace(/^[=\-#*_\s]+|[=\-#*_:\s]+$/g, "").trim();
    if (!normalized) continue;

    for (const { key, patterns } of SECTION_PATTERNS) {
      if (detectedSet.has(key)) continue;
      if (patterns.some((p) => p.test(normalized))) {
        detected.push(key);
        detectedSet.add(key);
        break;
      }
    }

    if (detectedSet.size === SECTION_PATTERNS.length) break;
  }

  // Append any keys not found in the source (unknown order → end)
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!detectedSet.has(key)) {
      detected.push(key);
    }
  }

  return detected;
}
