import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";

const root = resolve(import.meta.dirname, "..");
const required = [
  "README.md",
  "docs/OPERACAO.md",
  "docs/FECHAMENTO.md",
  "docs/SEGURANCA.md",
  "supabase/migrations/20261027_0001_initial_schema.sql",
  "app/api/cartao-ponto/route.ts",
  "app/api/export/marcacoes/route.ts",
  "app/api/export/fechamento/route.ts",
];
for (const file of required) {
  if (!existsSync(resolve(root, file))) throw new Error(`Arquivo obrigatório ausente: ${file}`);
}

const migration = readFileSync(resolve(root, "supabase/migrations/20261027_0001_initial_schema.sql"), "utf8").toLowerCase();
for (const table of ["profiles", "secullum_config", "manual_labels", "schedule_exceptions", "closed_days", "hidden_employees", "sync_logs", "audit_logs"]) {
  if (!migration.includes(`alter table public.${table} enable row level security`)) throw new Error(`RLS ausente: ${table}`);
}
if (!migration.includes("revoke all on table public.secullum_config from anon, authenticated")) throw new Error("secullum_config não está bloqueada para browser");

const docs = ["README.md", "docs/OPERACAO.md", "docs/FECHAMENTO.md", "docs/SEGURANCA.md"].map((p) => readFileSync(resolve(root,p),"utf8")).join("\n").toLowerCase();
for (const term of ["rep", "fechamento", "secullum_encryption_key", "somente leitura", "não vira falta automaticamente"]) {
  if (!docs.includes(term)) throw new Error(`Documentação incompleta: ${term}`);
}

function walk(dir) {
  const out=[];
  for (const name of readdirSync(dir)) {
    if ([".git","node_modules",".next"].includes(name)) continue;
    const p=resolve(dir,name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|mjs)$/.test(name)) out.push(p);
  }
  return out;
}
const sources=walk(root);
for (const file of sources) {
  const text=readFileSync(file,"utf8");
  if (/onClick=\{undefined\}/.test(text)) throw new Error(`Handler inválido: ${relative(root,file)}`);
  if (/NEXT_PUBLIC_(?:SUPABASE_SECRET|SECULLUM)/.test(text)) throw new Error(`Segredo potencialmente público: ${relative(root,file)}`);
}
console.log(`check-project: OK (${required.length} artefatos obrigatórios, ${sources.length} arquivos de código inspecionados)`);
