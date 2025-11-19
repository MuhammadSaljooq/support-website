// Simple encryption utility for API keys
// In production, use AWS KMS, HashiCorp Vault, or similar service
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

function getEncryptionKey(): string {
  // In production, get this from environment variable or secure key management service
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Please add ENCRYPTION_KEY to your .env.local file.\n" +
      "Generate one with: openssl rand -base64 32"
    );
  }
  
  if (key.length < 32) {
    throw new Error(
      `ENCRYPTION_KEY must be at least 32 characters (current: ${key.length}).\n` +
      "Generate one with: openssl rand -base64 32"
    );
  }
  
  return key.substring(0, 32);
}

function getKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(getEncryptionKey(), salt, 100000, 32, "sha512");
}

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = getKey(salt);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const data = Buffer.from(encryptedData, "base64");
    
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = data.subarray(ENCRYPTED_POSITION);
    
    const key = getKey(salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

