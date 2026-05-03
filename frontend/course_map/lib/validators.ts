import { z } from "zod";

export const RegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  studentId: z
    .string()
    .regex(/^\d{8}$/, "Student ID must be exactly 8 digits"),
  eventId: z.string().min(1, "Please select an event"),
});

export type RegistrationFormValues = z.infer<typeof RegistrationSchema>;

export const EventSearchSchema = z.object({
  query: z.string().max(200),
  category: z
    .enum(["all", "academic", "athletics", "social", "workshops"])
    .default("all"),
});

export type EventSearchValues = z.infer<typeof EventSearchSchema>;
