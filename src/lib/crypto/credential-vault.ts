const ENVELOPE_VERSION = "v1";

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const source = Buffer.from(value, "base64");
  const bytes = new Uint8Array(source.byteLength);
  bytes.set(source);
  return bytes;
}

function getKeyMaterial(explicit?: string): Uint8Array<ArrayBuffer> {
  const encoded = explicit ?? process.env.SECULLUM_ENCRYPTION_KEY;
  if (!encoded) throw new Error("SECULLUM_ENCRYPTION_KEY_MISSING");
  const key = fromBase64(encoded);
  if (key.byteLength !== 32) throw new Error("SECULLUM_ENCRYPTION_KEY_INVALID");
  return key;
}

async function importKey(explicit?: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    getKeyMaterial(explicit),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(plainText: string, explicitKeyBase64?: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importKey(explicitKeyBase64);
  const encoded = new TextEncoder().encode(plainText);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return `${ENVELOPE_VERSION}:${toBase64(iv)}:${toBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptSecret(envelope: string, explicitKeyBase64?: string): Promise<string> {
  const [version, ivEncoded, ciphertextEncoded, ...rest] = envelope.split(":");
  if (version !== ENVELOPE_VERSION || !ivEncoded || !ciphertextEncoded || rest.length) {
    throw new Error("SECULLUM_CREDENTIAL_ENVELOPE_INVALID");
  }

  try {
    const key = await importKey(explicitKeyBase64);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(ivEncoded) },
      key,
      fromBase64(ciphertextEncoded),
    );
    return new TextDecoder().decode(plaintext);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("SECULLUM_")) throw error;
    throw new Error("SECULLUM_CREDENTIAL_DECRYPT_FAILED");
  }
}
