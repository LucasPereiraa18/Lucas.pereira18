const required = ["SECULLUM_USERNAME", "SECULLUM_PASSWORD", "SECULLUM_DATABASE_ID"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Smoke Secullum não executado: faltam ${missing.join(", ")}`);
  process.exit(2);
}
const body = new URLSearchParams({ grant_type: "password", username: process.env.SECULLUM_USERNAME, password: process.env.SECULLUM_PASSWORD, client_id: "3" });
const auth = await fetch("https://autenticador.secullum.com.br/Token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
if (!auth.ok) {
  console.error(`Autenticação Secullum falhou: HTTP ${auth.status}`);
  process.exit(1);
}
const token = await auth.json();
const response = await fetch("https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna/Funcionarios", { headers: { Authorization: `Bearer ${token.access_token}`, "Accept-Language": "pt-BR", "Content-Type": "application/json; charset=utf-8", secullumidbancoselecionado: process.env.SECULLUM_DATABASE_ID } });
if (!response.ok) {
  console.error(`Consulta Secullum falhou: HTTP ${response.status}`);
  process.exit(1);
}
const data = await response.json();
console.log(`Smoke Secullum OK: ${Array.isArray(data) ? data.length : "resposta"} funcionário(s)/item(ns) retornado(s).`);
