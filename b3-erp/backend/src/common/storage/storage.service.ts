import { Injectable, Logger } from '@nestjs/common';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
} from 'fs';
import { resolve } from 'path';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** Provider a stored object physically lives on. */
export type StorageProvider = 's3' | 'local';

/** Result of a successful {@link StorageService.put}. */
export interface PutResult {
  /** Provider-prefixed key persisted on the owning row, e.g. `s3:<k>`. */
  storageKey: string;
  /** Where the bytes actually landed (may differ from the intent on fallback). */
  provider: StorageProvider;
}

/**
 * Local-disk storage directory (relative to the backend process cwd). Kept
 * identical to the historical AttachmentsService constant so pre-existing files
 * keep resolving byte-for-byte.
 */
const LOCAL_DIR = 'uploads';

/** Key prefixes used to route reads/deletes back to the right backend. */
const S3_PREFIX = 's3:';
const LOCAL_PREFIX = 'local:';

/**
 * StorageService — pluggable object storage with automatic local-disk fallback.
 *
 * S3 is used when configured (S3_BUCKET + S3_ACCESS_KEY_ID + S3_SECRET_ACCESS_KEY
 * all present) and reachable. On ANY S3 write error the service transparently
 * falls back to local disk so uploads never fail because the object store is
 * down. Stored keys are provider-prefixed (`s3:` / `local:`) so subsequent
 * reads/deletes route to wherever the bytes actually landed. Un-prefixed keys
 * (legacy rows written before this service) are treated as local.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  /** True when valid S3 credentials/bucket were found in the environment. */
  readonly isS3Enabled: boolean;

  private readonly bucket: string | undefined;
  private readonly region: string;
  private readonly endpoint: string | undefined;
  private readonly s3?: S3Client;

  constructor() {
    this.bucket = process.env.S3_BUCKET;
    this.region = process.env.S3_REGION || 'us-east-1';
    this.endpoint = process.env.S3_ENDPOINT || undefined;

    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

    this.isS3Enabled = Boolean(
      this.bucket && accessKeyId && secretAccessKey,
    );

    if (this.isS3Enabled) {
      this.s3 = new S3Client({
        region: this.region,
        // Custom endpoint enables Cloudflare R2 / MinIO / other S3-compatible
        // stores; path-style addressing is required for most of them.
        ...(this.endpoint
          ? { endpoint: this.endpoint, forcePathStyle: true }
          : {}),
        credentials: {
          accessKeyId: accessKeyId as string,
          secretAccessKey: secretAccessKey as string,
        },
      });
      this.logger.log(
        `S3 storage enabled (bucket="${this.bucket}", region="${this.region}"` +
          (this.endpoint ? `, endpoint="${this.endpoint}"` : '') +
          ').',
      );
    } else {
      this.logger.log(
        'S3 not configured — using local-disk storage under "uploads/".',
      );
    }
    this.ensureLocalDir();
  }

  private ensureLocalDir(): void {
    const abs = resolve(process.cwd(), LOCAL_DIR);
    if (!existsSync(abs)) {
      mkdirSync(abs, { recursive: true });
    }
  }

  /**
   * Split a provider-prefixed storage key into its provider + raw object key.
   * Un-prefixed keys are treated as local for backward compatibility with rows
   * written before provider tagging existed.
   */
  private parseKey(storageKey: string): {
    provider: StorageProvider;
    key: string;
  } {
    if (storageKey.startsWith(S3_PREFIX)) {
      return { provider: 's3', key: storageKey.slice(S3_PREFIX.length) };
    }
    if (storageKey.startsWith(LOCAL_PREFIX)) {
      return { provider: 'local', key: storageKey.slice(LOCAL_PREFIX.length) };
    }
    // Legacy un-prefixed key (e.g. "uploads/<uuid>.jpg") — local.
    return { provider: 'local', key: storageKey };
  }

  /**
   * Persist bytes under `key`. When S3 is enabled the write is attempted there
   * first; on any error it falls back to local disk. Returns the
   * provider-prefixed key to store on the owning row.
   *
   * @param key       raw object key (relative path, e.g. "uploads/<uuid>.jpg")
   * @param body      file contents
   * @param mimeType  optional content-type recorded on the S3 object
   */
  async put(
    key: string,
    body: Buffer,
    mimeType?: string,
  ): Promise<PutResult> {
    if (this.isS3Enabled && this.s3) {
      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: mimeType || 'application/octet-stream',
          }),
        );
        return { storageKey: `${S3_PREFIX}${key}`, provider: 's3' };
      } catch (err) {
        this.logger.warn(
          `S3 put failed for "${key}" (${(err as Error).message}); ` +
            'falling back to local disk.',
        );
        // fall through to local write below
      }
    }
    this.writeLocal(key, body);
    return { storageKey: `${LOCAL_PREFIX}${key}`, provider: 'local' };
  }

  /** Read bytes for a (possibly legacy) provider-prefixed storage key. */
  async get(storageKey: string): Promise<Buffer> {
    const { provider, key } = this.parseKey(storageKey);
    if (provider === 's3' && this.s3) {
      const out = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return this.streamToBuffer(out.Body);
    }
    return readFileSync(resolve(process.cwd(), key));
  }

  /** Delete the object for a provider-prefixed storage key (best-effort). */
  async delete(storageKey: string): Promise<void> {
    const { provider, key } = this.parseKey(storageKey);
    if (provider === 's3' && this.s3) {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return;
    }
    const abs = resolve(process.cwd(), key);
    if (existsSync(abs)) unlinkSync(abs);
  }

  /**
   * Presigned GET URL for S3-backed objects; `null` for local files (which are
   * streamed by the caller instead). Default expiry is 15 minutes.
   */
  async getDownloadUrl(
    storageKey: string,
    expiresInSeconds = 900,
  ): Promise<string | null> {
    const { provider, key } = this.parseKey(storageKey);
    if (provider === 's3' && this.s3) {
      return getSignedUrl(
        this.s3,
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        { expiresIn: expiresInSeconds },
      );
    }
    return null;
  }

  /** Resolve a stored key to its absolute on-disk path (local files only). */
  localAbsolutePath(storageKey: string): string {
    const { key } = this.parseKey(storageKey);
    return resolve(process.cwd(), key);
  }

  /** Whether the given stored key points at S3. */
  isS3Key(storageKey: string): boolean {
    return this.parseKey(storageKey).provider === 's3';
  }

  private writeLocal(key: string, body: Buffer): void {
    this.ensureLocalDir();
    writeFileSync(resolve(process.cwd(), key), body);
  }

  private async streamToBuffer(body: unknown): Promise<Buffer> {
    // AWS SDK v3 returns a Node Readable stream in Node runtimes.
    if (body && typeof (body as any)[Symbol.asyncIterator] === 'function') {
      const chunks: Buffer[] = [];
      for await (const chunk of body as AsyncIterable<Uint8Array>) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }
    // Fallbacks for byte-array-ish bodies.
    if (body instanceof Uint8Array) return Buffer.from(body);
    return Buffer.alloc(0);
  }
}
