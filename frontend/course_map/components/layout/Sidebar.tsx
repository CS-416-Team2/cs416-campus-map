"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Map,
  Compass,
  Navigation,
  CalendarDays,
  University,
  PlusCircle,
  ShieldCheck,
  LogIn,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const baseNavItems = [
  { label: "Map Dashboard", href: "/map", icon: Map },
  { label: "Event Explorer", href: "/events", icon: Compass },
  { label: "Navigation", href: "/mapRouting", icon: Navigation },
  { label: "My Schedule", href: "/eventSchedule", icon: CalendarDays },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isLoading, signOut } = useAuth();

  const navItems = [
    ...baseNavItems,
    ...(role === "admin"
      ? [{ label: "Admin Dashboard", href: "/admin", icon: ShieldCheck }]
      : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full w-sidebar-width bg-slate-50 border-r border-outline-variant shadow-xl overflow-y-auto shrink-0",
        className,
      )}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shrink-0">
            <University className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-body-md font-bold text-secondary leading-none">
              Purdue University Northwest
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-bold">
              PNW Event Map
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 px-2" aria-label="App pages">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm transition-all select-none",
                isActive
                  ? "bg-teal-50 text-secondary border-l-4 border-secondary font-bold rounded-l-none"
                  : "text-on-surface-variant hover:bg-slate-100 hover:text-on-surface",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-4 pb-6 space-y-3">
        {/* Register Event CTA — students only */}
        {!isLoading && role === "student" && (
          <Link
            href="/eventCreator"
            className="flex items-center justify-center gap-2 w-full bg-secondary text-on-secondary py-3 px-4 rounded-lg text-label-md font-bold hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            Register Event
          </Link>
        )}

        {/* Auth actions */}
        {!isLoading && (
          <>
            {user ? (
              <div className="border-t border-outline-variant pt-3 space-y-1">
                <p className="px-2 text-[11px] text-on-surface-variant truncate">
                  {user.user_metadata?.first_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ""}`
                    : user.email}
                </p>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-body-sm text-on-surface-variant hover:bg-slate-100 hover:text-error transition-colors"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="border-t border-outline-variant pt-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full border border-secondary text-secondary py-2.5 px-4 rounded-lg text-label-md font-semibold hover:bg-teal-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  Sign In
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
