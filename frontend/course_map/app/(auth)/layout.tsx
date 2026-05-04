import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-surface p-4">
      <div className="w-full flex justify-center">{children}</div>
    </main>
  );
}
