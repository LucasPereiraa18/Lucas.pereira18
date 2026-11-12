import { getSecretConfig } from "./config-service";
import { SecullumHttpClient } from "./http-client";

export async function createSecullumClient(): Promise<SecullumHttpClient> {
  const config = await getSecretConfig();
  return new SecullumHttpClient({
    username: config.username,
    password: config.password,
    databaseId: config.databaseId,
  });
}
