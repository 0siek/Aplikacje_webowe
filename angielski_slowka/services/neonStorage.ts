import { randomUUID } from 'node:crypto';
import { parseEnv } from '@neon/env';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';
import neonConfig from '../neon';

const bucket = 'assets';
const maxImageSize = 8 * 1024 * 1024;
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

let filesClient: Files | undefined;

function getFilesClient() {
  if (filesClient) return filesClient;
  const env = parseEnv(neonConfig, [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_ENDPOINT_URL_S3',
    'AWS_REGION',
  ]);
  filesClient = new Files({
    adapter: neon({
      bucket,
      endpoint: env.storage.endpoint,
      region: env.storage.region,
      accessKeyId: env.storage.accessKeyId,
      secretAccessKey: env.storage.secretAccessKey,
    }),
  });
  return filesClient;
}

function validateKey(key: string) {
  if (!key || key.startsWith('/') || key.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('Nieprawidłowy klucz obiektu.');
  }
}

/** Uploads a private image and returns its storage key (store the key, not file bytes, in Postgres). */
export async function uploadImage(bytes: Uint8Array, contentType: string) {
  if (!imageTypes.has(contentType)) throw new Error('Dozwolone formaty: JPG, PNG, WebP i HEIC.');
  if (bytes.byteLength === 0 || bytes.byteLength > maxImageSize) throw new Error('Zdjęcie musi mieć maksymalnie 8 MB.');
  const extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
  const key = `uploads/${randomUUID()}.${extension}`;
  await getFilesClient().upload(key, bytes, { contentType });
  return key;
}

/** Returns a short-lived URL for reading an image from the private bucket. */
export async function getImageUrl(key: string) {
  validateKey(key);
  return getFilesClient().url(key, { expiresIn: 900 });
}

export async function deleteStoredImage(key: string) {
  validateKey(key);
  await getFilesClient().delete(key);
}

/** Smoke-checks Neon Object Storage by uploading, reading, and deleting a temporary object. */
export async function verifyObjectStorage() {
  const key = `_health/${randomUUID()}.txt`;
  const expected = `neon-storage-ok:${randomUUID()}`;
  const client = getFilesClient();
  try {
    await client.upload(key, expected, { contentType: 'text/plain' });
    const stored = await client.download(key);
    const actual = await stored.text();
    if (actual !== expected) throw new Error('Odczyt z Neon Object Storage zwrócił niezgodne dane.');
  } finally {
    await client.delete(key).catch(() => undefined);
  }
}
