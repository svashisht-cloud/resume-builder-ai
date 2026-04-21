import { z } from "zod";

export const ResumeStyleSchema = z.object({
  fontFamily: z.enum(["times", "helvetica"]).default("times"),
  nameSize: z.enum(["small", "medium", "large"]).default("medium"),
  headerSize: z.enum(["small", "medium", "large"]).default("medium"),
  bodySize: z.enum(["small", "medium", "large"]).default("medium"),
  bulletSpacing: z.enum(["compact", "normal", "relaxed"]).default("normal"),
  sectionSpacing: z.enum(["compact", "normal", "relaxed"]).default("normal"),
});

export type ResumeStyle = z.infer<typeof ResumeStyleSchema>;

export const DEFAULT_RESUME_STYLE: ResumeStyle = {
  fontFamily: "times",
  nameSize: "medium",
  headerSize: "medium",
  bodySize: "medium",
  bulletSpacing: "normal",
  sectionSpacing: "normal",
};
