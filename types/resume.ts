import { z } from "zod";

const EvidenceIdSchema = z.string().min(1);

export const SectionKeySchema = z.enum([
  "summary",
  "education",
  "skills",
  "experience",
  "projects",
  "certifications",
]);

export const ContactInfoSchema = z.object({
  name: z.string().nullish(),
  roleSubtitle: z.string().nullish(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  location: z.string().nullish(),
  links: z.array(z.string()),
});

export const TailoredResumeBulletSchema = z.object({
  text: z.string().min(1),
  evidenceIds: z.array(EvidenceIdSchema),
});

export const TailoredResumeExperienceSchema = z.object({
  sourceExperienceId: EvidenceIdSchema,
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().nullish(),
  dates: z.string().nullish(),
  bullets: z.array(TailoredResumeBulletSchema),
});

export const SkillGroupSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string().min(1)),
});

export const ResumeProjectSchema = z.object({
  name: z.string().min(1),
  techStack: z.string().nullish(),
  date: z.string().nullish(),
  url: z.string().nullish(),
  bullets: z.array(z.string().min(1)),
});

export const ResumeEducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  location: z.string().nullish(),
  date: z.string().nullish(),
  gpa: z.string().nullish(),
});

export const TailoredResumeSchema = z.object({
  contact: ContactInfoSchema,
  summary: z.string(),
  skills: z.array(SkillGroupSchema),
  experience: z.array(TailoredResumeExperienceSchema),
  education: z.array(ResumeEducationSchema),
  projects: z.array(ResumeProjectSchema),
  certifications: z.array(z.string()),
  sectionOrder: z.array(SectionKeySchema).nullable(),
});

export const ChangeLogEntrySchema = z.object({
  section: SectionKeySchema,
  originalText: z.string().nullable(),
  tailoredText: z.string().min(1),
  reason: z.string().min(1),
  evidenceIds: z.array(EvidenceIdSchema),
});

export const ChangeLogSchema = z.object({
  changes: z.array(ChangeLogEntrySchema),
});

export const ResumeEvaluationRubricSchema = z.object({
  skillsAlignment: z.number().int().min(0).max(100),
  experienceAlignment: z.number().int().min(0).max(100),
  projectAlignment: z.number().int().min(0).max(100),
  clarity: z.number().int().min(0).max(100),
  atsReadability: z.number().int().min(0).max(100),
});

export const ResumeEvaluationSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  matchedAreas: z.array(z.string()),
  missingAreas: z.array(z.string()),
  rubric: ResumeEvaluationRubricSchema,
});

export const ScoreComparisonSchema = z.object({
  before: z.number().int().min(0).max(100),
  after: z.number().int().min(0).max(100),
  delta: z.number().int(),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type ResumeProject = z.infer<typeof ResumeProjectSchema>;
export type ResumeEducation = z.infer<typeof ResumeEducationSchema>;
export type TailoredResumeBullet = z.infer<typeof TailoredResumeBulletSchema>;
export type TailoredResumeExperience = z.infer<
  typeof TailoredResumeExperienceSchema
>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
export type SectionKey = z.infer<typeof SectionKeySchema>;
export type ChangeLogEntry = z.infer<typeof ChangeLogEntrySchema>;
export type ChangeLog = z.infer<typeof ChangeLogSchema>;
export type ResumeEvaluationRubric = z.infer<
  typeof ResumeEvaluationRubricSchema
>;
export type ResumeEvaluation = z.infer<typeof ResumeEvaluationSchema>;
export type ScoreComparison = z.infer<typeof ScoreComparisonSchema>;
