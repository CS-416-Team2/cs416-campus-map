"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Info, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RegistrationSchema,
  type RegistrationFormValues,
} from "@/lib/validators";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useEvents } from "@/hooks/use-events";

export default function EventCreatorPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(RegistrationSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/eventCreator");
    }
  }, [authLoading, user, router]);

  const onSubmit = async (data: RegistrationFormValues) => {
    setApiError(null);

    const studentId = user?.user_metadata?.student_id as string | undefined;
    if (!studentId) {
      setApiError(
        "Your account must have a student ID to register for events.",
      );
      return;
    }

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: data.firstName.trim(),
          middle_name: data.middleName?.trim() || null,
          last_name: data.lastName.trim(),
          student_id: studentId,
          event_id: data.eventId,
          status: "registered",
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.message ||
            "Unable to submit registration. Please try again.",
        );
      }

      setSubmitted(true);
      reset();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  if (submitted) {
    return (
      <div className="h-full overflow-y-auto flex items-center justify-center p-container-margin">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <Send className="w-8 h-8 text-secondary" aria-hidden="true" />
          </div>
          <h2 className="text-headline-md text-primary">
            Registration Submitted!
          </h2>
          <p className="text-body-md text-on-surface-variant">
            A confirmation will be sent to your student email once processed.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              reset();
            }}
          >
            Register for Another Event
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="pt-8 pb-20 px-6 min-h-full flex flex-col items-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Registration form ──────────────────────────────── */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden border border-outline-variant">
            <div className="p-8 border-b border-surface-container-highest bg-surface-container-low">
              <h1 className="text-display-lg text-primary mb-2">
                Event Registration
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Complete the form below to secure your spot at upcoming campus
                events. Please ensure all details match your university record.
              </p>
            </div>

            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mx-8 mt-6">
                {apiError}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-8 space-y-6"
              aria-label="Event registration form"
              noValidate
            >
              {/* Name fields */}
              <fieldset>
                <legend className="sr-only">Name</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      aria-invalid={!!errors.firstName}
                      aria-describedby={
                        errors.firstName ? "firstName-error" : undefined
                      }
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p
                        id="firstName-error"
                        className="text-label-sm text-error flex items-center gap-1"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3" aria-hidden="true" />
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="middleName">
                      Middle Name{" "}
                      <span className="text-on-surface-variant font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="middleName"
                      placeholder="Quincy"
                      {...register("middleName")}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      aria-invalid={!!errors.lastName}
                      aria-describedby={
                        errors.lastName ? "lastName-error" : undefined
                      }
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p
                        id="lastName-error"
                        className="text-label-sm text-error flex items-center gap-1"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3" aria-hidden="true" />
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Student ID + Event select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="8-digit ID"
                    maxLength={8}
                    aria-invalid={!!errors.studentId}
                    aria-describedby={
                      errors.studentId ? "studentId-error" : undefined
                    }
                    {...register("studentId")}
                  />
                  {errors.studentId && (
                    <p
                      id="studentId-error"
                      className="text-label-sm text-error flex items-center gap-1"
                      role="alert"
                    >
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />
                      {errors.studentId.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="eventId">Selected Event</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("eventId", val, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger
                      id="eventId"
                      aria-invalid={!!errors.eventId}
                      aria-describedby={
                        errors.eventId ? "eventId-error" : undefined
                      }
                    >
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading events...
                        </SelectItem>
                      ) : events.length > 0 ? (
                        events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title} — {event.date}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-events" disabled>
                          No events available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.eventId && (
                    <p
                      id="eventId-error"
                      className="text-label-sm text-error flex items-center gap-1"
                      role="alert"
                    >
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />
                      {errors.eventId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Info banner */}
              <div
                className="bg-secondary-container/10 border border-secondary-container p-4 rounded-lg flex gap-3 items-start"
                role="note"
              >
                <Info
                  className="w-5 h-5 text-secondary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-body-sm text-on-secondary-container">
                  By registering, you agree to our campus event attendance
                  policy. A confirmation email will be sent to your student
                  address once processed.
                </p>
              </div>

              {/* Form actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="reset"
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary-container/20"
                  onClick={() => reset()}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || eventsLoading || events.length === 0
                  }
                  className="gap-2"
                >
                  {isSubmitting
                    ? "Submitting…"
                    : eventsLoading
                      ? "Loading events…"
                      : events.length === 0
                        ? "No events available"
                        : "Submit Registration"}
                  {!isSubmitting && !eventsLoading && events.length > 0 && (
                    <Send className="w-4 h-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* ── Sidebar ────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Registration status */}
            <Card>
              <CardHeader>
                <CardDescription className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
                  Your Status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border-l-4 border-error">
                  <div className="flex items-center gap-3">
                    <AlertCircle
                      className="w-5 h-5 text-error"
                      aria-hidden="true"
                    />
                    <span className="text-body-md font-medium">
                      Not Registered
                    </span>
                  </div>
                  <Badge variant="error">ID: —</Badge>
                </div>
                <div className="border-t border-surface-container-highest pt-4">
                  <p className="text-body-sm text-on-surface-variant italic">
                    &ldquo;Success is the result of preparation meeting
                    opportunity.&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help card */}
            <div className="bg-gradient-to-br from-secondary to-primary-container p-8 rounded-xl text-white shadow-xl">
              <h3 className="text-headline-sm mb-2">Need help?</h3>
              <p className="text-body-sm opacity-80 mb-6">
                Our support team is available 24/7 to assist with campus
                navigation and event registration.
              </p>
              <button className="w-full py-3 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm text-label-md hover:bg-white/20 transition-all">
                Contact Registrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
