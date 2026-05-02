"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Compass,
  Navigation,
  CalendarDays,
  University,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Map Dashboard", href: "/map", icon: Map },
  { label: "Event Explorer", href: "/events", icon: Compass },
  { label: "Routing & Nav", href: "/mapRouting", icon: Navigation },
  { label: "My Schedule", href: "/eventSchedule", icon: CalendarDays },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full w-sidebar-width bg-slate-50 border-r border-slate-200 shadow-xl overflow-y-auto shrink-0",
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
              University Central
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-bold">
              Campus Navigation
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

      {/* Register CTA */}
      <div className="mt-auto px-4 pb-6">
        <Link
          href="/eventCreator"
          className="flex items-center justify-center gap-2 w-full bg-secondary text-on-secondary py-3 px-4 rounded-lg text-label-md font-bold hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          Register Event
        </Link>
      </div>
    </aside>
  );
}
