"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { University, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface AuthWindowTab {
  label: string;
  href: string;
  active: boolean;
}

interface AuthWindowProps {
  title: string;
  description: string;
  tabs: AuthWindowTab[];
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthWindow({
  title,
  description,
  tabs,
  children,
  footer,
}: AuthWindowProps) {
  const router = useRouter();

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 relative">
      <Card className="w-full max-w-3xl overflow-hidden relative">
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 p-2 rounded-full bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="bg-surface-container-low px-6 py-6 border-b border-outline-variant pt-20 sm:pt-6">
          <div className="flex items-center gap-3 ml-0 sm:ml-12">
            <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-on-secondary">
              <University className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-label-md font-semibold text-secondary">
                Purdue University Northwest
              </p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-on-surface-variant font-bold">
                Campus Navigation
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h1 className="text-display-lg text-primary">{title}</h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              {description}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-full border border-outline-variant bg-surface p-1">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-center text-body-sm font-semibold transition",
                  tab.active
                    ? "bg-secondary text-on-secondary"
                    : "text-on-surface hover:bg-surface-container",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <CardContent className="p-6 pt-7">{children}</CardContent>

        <CardFooter className="flex-col gap-4 px-6 pb-6 pt-0">
          {footer}
        </CardFooter>
      </Card>
    </div>
  );
}
