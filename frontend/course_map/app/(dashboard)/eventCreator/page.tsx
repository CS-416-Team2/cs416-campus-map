"use client";

import { Suspense, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Info, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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

function EventCreatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, studentId, isLoading: authLoading } = useAuth();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      eventId: "",
    },
  });

  const queryEventId = searchParams.get("eventId") ?? "";
  const selectedEventId = useWatch({ control, name: "eventId" });
  const effectiveEventId = selectedEventId || queryEventId;
  const selectedEvent = events.find((e) => e.id === effectiveEventId);

  useEffect(() => {
    if (!authLoading && !user) {
      const nextPath = queryEventId
        ? `/eventCreator?eventId=${encodeURIComponent(queryEventId)}`
        : "/eventCreator";
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [authLoading, user, router, queryEventId]);

  useEffect(() => {
    if (!queryEventId) return;
    if (effectiveEventId && effectiveEventId !== queryEventId) return;

    setValue("eventId", queryEventId, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [queryEventId, effectiveEventId, setValue]);

  const onSubmit = async (data: RegistrationFormValues) => {
    setApiError(null);

    if (role === "admin") {
      setApiError("Admin accounts do not need a student ID and cannot submit student registrations.");
      return;
    }

    if (!studentId) {
      setApiError("Your profile must include a student ID to register for events.");
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
          payload?.error ||
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
      <div className="w-full min-h-full flex items-center justify-center px-6 py-10 min-w-0">
        <div className="shrink-0 w-[min(560px,92vw)] min-w-[320px] rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <Send className="w-8 h-8 text-secondary" aria-hidden="true" />
          </div>
          <h2 className="text-headline-md text-primary">
            Registration Submitted!
          </h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            A confirmation will be sent to your student email once processed.
          </p>
          <Button
            className="w-full cursor-pointer whitespace-nowrap"
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
          {/* â”€â”€ Registration form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                  <Label htmlFor="studentId">Student ID (from profile)</Label>
                  <Input
                    id="studentId"
                    value={studentId ?? ""}
                    readOnly
                    placeholder={
                      role === "admin"
                        ? "Not required for admins"
                        : "No student ID on profile"
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="eventId">Selected Event</Label>
                  <Controller
                    control={control}
                    name="eventId"
                    render={({ field }) => (
                      <Select
                        value={String(field.value || queryEventId || "")}
                        onValueChange={(val) => field.onChange(val)}
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
                              <SelectItem key={event.id} value={String(event.id)}>
                                {event.title} - {event.date}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-events" disabled>
                              No events available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
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

                  {selectedEvent && selectedEvent.parking.length > 0 && (
                    <div className="mt-2 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                      <p className="text-label-sm font-semibold text-on-surface mb-2">
                        Parking lot suggestions
                      </p>
                      <div className="space-y-2">
                        {selectedEvent.parking.slice(0, 3).map((spot) => (
                          <div
                            key={spot.id}
                            className="flex items-center justify-between gap-3 text-body-sm"
                          >
                            <div>
                              <p className="text-on-surface font-medium">{spot.name}</p>
                              <p className="text-on-surface-variant">{spot.distance}</p>
                            </div>
                            <div className="text-right text-on-surface-variant">
                              <p>{spot.spotsLeft} spots</p>
                              <p>{spot.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
                    ? "Submitting..."
                    : eventsLoading
                      ? "Loading events..."
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

          {/* â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                  <Badge variant="error">ID: -</Badge>
                </div>
                <div className="border-t border-surface-container-highest pt-4">
                  <p className="text-body-sm text-on-surface-variant italic">
                    &ldquo;Success is the result of preparation meeting
                    opportunity.&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}
export default function EventCreatorPage() {
  return (
    <Suspense fallback={<div className="h-full" />}>
      <EventCreatorContent />
    </Suspense>
  );
}














