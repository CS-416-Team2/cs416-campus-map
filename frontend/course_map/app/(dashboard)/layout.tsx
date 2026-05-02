import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />

      {/* Main column: top nav + content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        {/* Content area — fills remaining space below the fixed navbar */}
        <main
          className="flex-1 overflow-hidden relative mt-navbar-height"
          id="main-content"
        >
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
