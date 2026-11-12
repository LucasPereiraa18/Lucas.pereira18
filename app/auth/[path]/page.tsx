import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">L</div>
        <h1>Ponto Líder</h1>
        <p>Acesso interno do Bar Líder</p>
        <AuthView path={path} />
      </section>
    </main>
  );
}
