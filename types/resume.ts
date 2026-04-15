import { z } from "zod";

const EvidenceIdSchema = z.string().min(1);

export const ContactInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(z.string()).default([]),
});

export const ResumeBulletSchema = z.object({
  id: EvidenceIdSchema,
  text: z.string().min(1),
});

export const ResumeExperienceSchema = z.object({
  id: EvidenceIdSchema,
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(ResumeBulletSchema),
});

export const ParsedResumeSchema = z.object({
  contact: ContactInfoSchema,
  summary: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(ResumeExperienceSchema),
  education: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  sourceText: z.string().min(1),
});

export const ParsedJobDescriptionSchema = z.object({
  title: z.string().min(1),
  company: z.string().optional(),
  location: z.string().optional(),
  responsibilities: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()).default([]),
  keywords: z.array(z.string()),
  sourceText: z.string().min(1),
});

export const SupportedKeywordSchema = z.object({
  keyword: z.string().min(1),
  evidenceIds: z.array(EvidenceIdSchema),
});

export const GapAnalysisSchema = z.object({
  supportedKeywords: z.array(SupportedKeywordSchema),
  missingKeywords: z.array(z.string()),
  unsupportedKeywords: z.array(z.string()),
  recommendedFocus: z.array(z.string()),
  notes: z.array(z.string()).default([]),
});

export const TailoredResumeBulletSchema = z.object({
  text: z.string().min(1),
  evidenceIds: z.array(EvidenceIdSchema),
});

export const TailoredResumeExperienceSchema = z.object({
  sourceExperienceId: EvidenceIdSchema,
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  dates: z.string().optional(),
  bullets: z.array(TailoredResumeBulletSchema),
});

export const TailoredResumeSchema = z.object({
  contact: ContactInfoSchema,
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(TailoredResumeExperienceSchema),
  education: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
});

export const ChangeLogEntrySchema = z.object({
  section: z.enum([
    "summary",
    "skills",
    "experience",
    "education",
    "projects",
    "certifications",
  ]),
  originalText: z.string().optional(),
  tailoredText: z.string().min(1),
  reason: z.string().min(1),
  evidenceIds: z.array(EvidenceIdSchema),
});

export const ChangeLogSchema = z.object({
  changes: z.array(ChangeLogEntrySchema),
});

export const ATSSectionScoreSchema = z.object({
  section: z.string().min(1),
  score: z.number().int().min(0).max(100),
  notes: z.string().optional(),
});

export const ATSScoreSchema = z.object({
  overall: z.number().int().min(0).max(100),
  sectionScores: z.array(ATSSectionScoreSchema),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type ResumeBullet = z.infer<typeof ResumeBulletSchema>;
export type ResumeExperience = z.infer<typeof ResumeExperienceSchema>;
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
export type ParsedJobDescription = z.infer<typeof ParsedJobDescriptionSchema>;
export type SupportedKeyword = z.infer<typeof SupportedKeywordSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;
export type TailoredResumeBullet = z.infer<typeof TailoredResumeBulletSchema>;
export type TailoredResumeExperience = z.infer<
  typeof TailoredResumeExperienceSchema
>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
export type ChangeLogEntry = z.infer<typeof ChangeLogEntrySchema>;
export type ChangeLog = z.infer<typeof ChangeLogSchema>;
export type ATSSectionScore = z.infer<typeof ATSSectionScoreSchema>;
export type ATSScore = z.infer<typeof ATSScoreSchema>;
