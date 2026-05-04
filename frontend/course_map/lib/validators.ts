import { z } from "zod";

// â”€â”€â”€ Pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  orderBy: z.string().optional(),
  direction: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationParams = z.infer<typeof PaginationSchema>;

// â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const AuthCredentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;

export const AuthSignupSchema = AuthCredentialsSchema.extend({
  firstName: z.string().trim().max(100).optional().default(""),
  lastName: z.string().trim().max(100).optional().default(""),
  studentId: z
    .string()
    .regex(/^\d{8}$/, "Student ID must be exactly 8 digits")
    .optional()
    .nullable(),
  defaultAddress: z.string().trim().max(250).optional().nullable(),
  defaultCity: z.string().trim().max(120).optional().nullable(),
  isAdmin: z.boolean().optional().default(false),
}).superRefine((val, ctx) => {
  if (!val.isAdmin && !val.studentId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Student ID is required for student accounts",
      path: ["studentId"],
    });
  }
});
export type AuthSignupValues = z.infer<typeof AuthSignupSchema>;

// â”€â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const EventInsertSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().min(1, "Description is required"),
  start_at: z.string().datetime({ offset: true }).optional().nullable(),
  end_at: z.string().datetime({ offset: true }).optional().nullable(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  image_url: z.string().url("Must be a valid URL"),
  coordinates: z.array(z.number()).min(2).max(2),
  cost_usd: z.number().min(0).optional().nullable(),
  capacity: z.number().int().min(0),
  registered: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  source_url: z.string().url().optional().nullable(),
  external_event_id: z.string().optional().nullable(),
});
export type EventInsertValues = z.infer<typeof EventInsertSchema>;

export const EventUpdateSchema = EventInsertSchema.partial();
export type EventUpdateValues = z.infer<typeof EventUpdateSchema>;

export const EventFilterSchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().max(200).optional(),
});

// â”€â”€â”€ Registrations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const RegistrationInsertSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional().nullable(),
  last_name: z.string().min(1, "Last name is required"),
  student_id: z
    .string()
    .regex(/^\d{8}$/, "Student ID must be exactly 8 digits"),
  event_id: z.string().uuid("Invalid event ID"),
  status: z.string().default("registered"),
});
export type RegistrationInsertValues = z.infer<typeof RegistrationInsertSchema>;

export const RegistrationUpdateSchema = RegistrationInsertSchema.partial();
export type RegistrationUpdateValues = z.infer<typeof RegistrationUpdateSchema>;

// Keep legacy form schema for frontend compatibility
export const RegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  eventId: z.string().min(1, "Please select an event"),
});
export type RegistrationFormValues = z.infer<typeof RegistrationSchema>;

// â”€â”€â”€ Parking Lots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const ParkingLotInsertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  campus: z.string().min(1, "Campus is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  lat_2: z.number().min(-90).max(90).optional().nullable(),
  lng_2: z.number().min(-180).max(180).optional().nullable(),
  total_spots: z.number().int().min(0).optional().nullable(),
  available_spots: z.number().int().min(0).optional().nullable(),
  hourly_rate_usd: z.number().min(0).optional().nullable(),
});
export type ParkingLotInsertValues = z.infer<typeof ParkingLotInsertSchema>;

export const ParkingLotUpdateSchema = ParkingLotInsertSchema.partial();
export type ParkingLotUpdateValues = z.infer<typeof ParkingLotUpdateSchema>;

// â”€â”€â”€ Event Parking Suggestions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const EventParkingSuggestionInsertSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  parking_lot_id: z.string().uuid("Invalid parking lot ID"),
  distance_miles: z.number().min(0).optional().nullable(),
  estimated_walk_minutes: z.number().int().min(0).optional().nullable(),
});
export type EventParkingSuggestionInsertValues = z.infer<
  typeof EventParkingSuggestionInsertSchema
>;

// â”€â”€â”€ Route Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const RouteQueryInsertSchema = z.object({
  origin_address: z.string().min(1, "Origin address is required"),
  destination_address: z.string().min(1, "Destination address is required"),
  event_id: z.string().uuid().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  distance_miles: z.number().min(0).optional().nullable(),
  duration_minutes: z.number().int().min(0).optional().nullable(),
  toll_fee_usd: z.number().min(0).optional().nullable(),
  provider: z.string().default("google_maps"),
  raw_response: z.any().optional().nullable(),
});
export type RouteQueryInsertValues = z.infer<typeof RouteQueryInsertSchema>;

// â”€â”€â”€ User Address Inputs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const UserAddressInputInsertSchema = z.object({
  input_address: z.string().min(1, "Address is required"),
  input_type: z.string().min(1, "Input type is required"),
  user_id: z.string().uuid().optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
});
export type UserAddressInputInsertValues = z.infer<
  typeof UserAddressInputInsertSchema
>;

// â”€â”€â”€ User Profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const UserProfileInsertSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  student_id: z
    .string()
    .regex(/^\d{8}$/, "Student ID must be exactly 8 digits")
    .optional()
    .nullable(),
  default_address: z.string().optional().nullable(),
  default_city: z.string().optional().nullable(),
});
export type UserProfileInsertValues = z.infer<typeof UserProfileInsertSchema>;

export const UserProfileUpdateSchema = UserProfileInsertSchema.omit({
  user_id: true,
}).partial();
export type UserProfileUpdateValues = z.infer<typeof UserProfileUpdateSchema>;

// â”€â”€â”€ User Roles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const UserRoleUpdateSchema = z.object({
  role: z.enum(["student", "admin"]),
  invited_by: z.string().uuid().optional().nullable(),
});
export type UserRoleUpdateValues = z.infer<typeof UserRoleUpdateSchema>;

// â”€â”€â”€ Event Search (legacy, kept for frontend) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const EventSearchSchema = z.object({
  query: z.string().max(200),
  category: z
    .enum(["all", "academic", "athletics", "social", "workshops"])
    .default("all"),
});
export type EventSearchValues = z.infer<typeof EventSearchSchema>;

// â”€â”€â”€ UUID param validator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const UuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});


