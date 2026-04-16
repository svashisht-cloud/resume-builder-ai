import type { TailoredResume } from "@/types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildResumePdfFilename({
  resume,
  role,
}: {
  resume: TailoredResume;
  role?: string | null;
}) {
  const date = new Date().toISOString().slice(0, 10);
  const parts = [
    resume.contact.name ? slugify(resume.contact.name) : "",
    role ? slugify(role) : "",
    date,
    "tailored-resume",
  ].filter(Boolean);

  return `${parts.join("-") || "tailored-resume"}.pdf`;
}
