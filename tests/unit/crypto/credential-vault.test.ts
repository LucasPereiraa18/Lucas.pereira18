import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "@/src/lib/crypto/credential-vault";

const key = Buffer.alloc(32, 7).toString("base64");

describe("Secullum credential vault", () => {
  it("encrypts and decrypts a password", async () => {
    const encrypted = await encryptSecret("senha-super-secreta", key);
    expect(await decryptSecret(encrypted, key)).toBe("senha-super-secreta");
  });

  it("uses a fresh IV for each encryption", async () => {
    const first = await encryptSecret("igual", key);
    const second = await encryptSecret("igual", key);
    expect(first).not.toBe(second);
  });

  it("rejects a tampered envelope", async () => {
    const encrypted = await encryptSecret("segredo", key);
    const tampered = `${encrypted.slice(0, -2)}AA`;
    await expect(decryptSecret(tampered, key)).rejects.toThrow("SECULLUM_CREDENTIAL_DECRYPT_FAILED");
  });
});
