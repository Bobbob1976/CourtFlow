import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="admin-layout">
          <nav className="admin-sidebar">{/* Admin navigation */}</nav>
          <main className="admin-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
