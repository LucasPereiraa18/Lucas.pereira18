import { SecullumHttpClient } from "./http-client";

export async function getPendingRequests(client: SecullumHttpClient): Promise<unknown[]> {
  return client.request<unknown[]>("/Pendencias");
}
