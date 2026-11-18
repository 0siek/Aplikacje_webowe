import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { parseEnv } from '@neon/env';
import neonConfig from '../neon';

const bucket = 'assets';
const maxImageSize = 8 * 1024 * 1024;
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

let s3Client: S3Client | undefined;

function getS3Client() {
  if (s3Client) return s3Client;
  const env = parseEnv(neonConfig, [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_ENDPOINT_URL_S3',
    'AWS_REGION',
  ]);
  s3Client = new S3Client({
    endpoint: env.storage.endpoint,
    region: env.storage.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.storage.accessKeyId,
      secretAccessKey: env.storage.secretAccessKey,
    },
  });
  return s3Client;
}

function validateKey(key: string) {
  if (!key || key.startsWith('/') || key.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('Invalid object key.');
  }
}

/** Upload a private image; store the returned key, not its bytes, in Postgres. */
export async function uploadImage(bytes: Uint8Array, contentType: string) {
  if (!imageTypes.has(contentType)) throw new Error('Allowed formats: JPG, PNG, WebP, and HEIC.');
  if (bytes.byteLength === 0 || bytes.byteLength > maxImageSize) throw new Error('Image must be no larger than 8 MB.');
  const extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
  const key = `uploads/${randomUUID()}.${extension}`;
  await getS3Client().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: contentType }));
  return key;
}

/** Create a 15-minute URL for reading an image from the private bucket. */
export async function getImageUrl(key: string) {
  validateKey(key);
  return getSignedUrl(getS3Client(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 900 });
}

export async function deleteStoredImage(key: string) {
  validateKey(key);
  await getS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Smoke-check Neon Object Storage with a temporary upload, download, and delete. */
export async function verifyObjectStorage() {
  const key = `_health/${randomUUID()}.txt`;
  const expected = `neon-storage-ok:${randomUUID()}`;
  const client = getS3Client();
  try {
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: expected, ContentType: 'text/plain' }));
    const signedUrl = await getImageUrl(key);
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error(`Signed object read failed with HTTP ${response.status}.`);
    const actual = await response.text();
    if (actual !== expected) throw new Error('Neon Object Storage returned unexpected data.');
  } finally {
    await deleteStoredImage(key).catch(() => undefined);
  }
}
