import type { AppUser } from "@/src/domain/auth/types";
import { logout } from "@/app/login/actions";
import { AutoRefresh } from "@/components/auto-refresh";
import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ user, children }: { user: AppUser; children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar no-print">
        <div className="brand">
          <span className="brand-mark small">L</span>
          <div className="brand-copy"><strong>Ponto Líder</strong><small>Bar Líder</small></div>
        </div>
        <SidebarNav showConfig={user.role === "admin"} />
        <div className="sidebar-footer">
          <div className="user-summary"><strong>{user.name ?? user.email}</strong><small>{user.role === "admin" ? "Administrador" : "Gestor"}</small></div>
          <form action={logout}><button className="link-button logout-button" type="submit">Sair</button></form>
        </div>
      </aside>
      <main className="content">
        <AutoRefresh />
        {children}
      </main>
    </div>
  );
}
