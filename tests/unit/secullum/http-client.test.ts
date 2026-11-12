import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAllCachedTokens } from "@/src/services/secullum/auth-token-cache";
import { SecullumHttpClient } from "@/src/services/secullum/http-client";

const config = { username: "user", password: "secret", databaseId: "db-1" };

beforeEach(() => clearAllCachedTokens());

describe("SecullumHttpClient", () => {
  it("authenticates with the required form fields and database header", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token-1", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ Id: 1 }]), { status: 200 }));
    const client = new SecullumHttpClient(config, fetchMock as typeof fetch);

    await client.request("/Funcionarios");

    const authInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(String(authInit.body)).toContain("grant_type=password");
    expect(String(authInit.body)).toContain("client_id=3");
    const apiInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(apiInit.headers).toMatchObject({
      Authorization: "Bearer token-1",
      "Accept-Language": "pt-BR",
      secullumidbancoselecionado: "db-1",
    });
  });

  it("reauthenticates once after a 401", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "old", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response("expired", { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "new", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));
    const client = new SecullumHttpClient(config, fetchMock as typeof fetch);
    await expect(client.request("/Funcionarios")).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("does not loop on a second 401", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "old", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response("expired", { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "new", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response("still unauthorized", { status: 401 }));
    const client = new SecullumHttpClient(config, fetchMock as typeof fetch);
    await expect(client.request("/Funcionarios")).rejects.toMatchObject({ status: 401, body: "still unauthorized" });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
