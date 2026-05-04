"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export type AppRole = "student" | "admin";

export interface AuthState {
  user: User | null;
  role: AppRole | null;
  studentId: string | null;
  defaultAddress: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function hydrateUser(accessToken: string, fallbackUser: User | null) {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          setRole("student");
          setStudentId(null);
          return;
        }

        const payload = await response.json();
        const roleFromApi = payload?.user?.role as AppRole | undefined;
        const studentIdFromApi = payload?.user?.profile?.student_id as
          | string
          | null
          | undefined;
        const defaultAddressFromApi = payload?.user?.profile?.default_address as
          | string
          | null
          | undefined;

        setRole(roleFromApi ?? "student");
        setStudentId(studentIdFromApi ?? null);
        setDefaultAddress(defaultAddressFromApi ?? null);
      } catch {
        setRole("student");
        setStudentId(null);
        setDefaultAddress(null);
      } finally {
        setUser(fallbackUser);
        setIsLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (currentUser && session?.access_token) {
        void hydrateUser(session.access_token, currentUser);
      } else {
        setUser(currentUser);
        setRole(null);
        setStudentId(null);
        setDefaultAddress(null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      if (currentUser && session?.access_token) {
        setIsLoading(true);
        void hydrateUser(session.access_token, currentUser);
      } else {
        setUser(currentUser);
        setRole(null);
        setStudentId(null);
        setDefaultAddress(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return { user, role, studentId, defaultAddress, isLoading, signOut };
}
