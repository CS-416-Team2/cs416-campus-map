"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, Navigation, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Map", href: "/map", icon: Map },
  { label: "Events", href: "/events", icon: Compass },
  { label: "Nav", href: "/mapRouting", icon: Navigation },
  { label: "Schedule", href: "/eventSchedule", icon: CalendarDays },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant flex lg:hidden h-16 z-50"
      aria-label="Mobile navigation"
    >
      {mobileNavItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
              isActive ? "text-secondary" : "text-on-surface-variant",
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
