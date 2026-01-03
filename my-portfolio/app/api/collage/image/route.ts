import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Initialize GCS client using Application Default Credentials
const storage = new Storage();

const BUCKET_NAME = process.env.GCS_BUCKET || 'rotating_image_collage_bucket';
const GCS_PREFIX = process.env.GCS_PREFIX || 'collage/';

// Cache of allowed keys from bucket listing (refreshed periodically)
let manifestCache: Set<string> | null = null;
let manifestCacheTime = 0;
const MANIFEST_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Validates object key against security requirements
 */
function validateKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  // Reject path traversal attempts
  if (key.includes('..') || key.includes('//') || key.startsWith('/')) {
    return false;
  }

  // Reject encoded traversal patterns
  try {
    const decoded = decodeURIComponent(key);
    if (decoded.includes('..') || decoded.includes('//')) {
      return false;
    }
  } catch {
    // Invalid encoding
    return false;
  }

  // Only allow alphanumeric, dashes, underscores, dots, and slashes (for subdirectories)
  if (!/^[a-zA-Z0-9._/-]+$/.test(key)) {
    return false;
  }

  return true;
}

/**
 * Builds manifest cache by listing bucket contents
 */
async function refreshManifestCache(): Promise<Set<string>> {
  const bucket = storage.bucket(BUCKET_NAME);
  const [files] = await bucket.getFiles({
    prefix: GCS_PREFIX,
    maxResults: 1000,
  });

  const keys = new Set<string>();
  for (const file of files) {
    if (file.name.endsWith('/')) continue; // Skip directories
    
    const key = file.name.startsWith(GCS_PREFIX)
      ? file.name.slice(GCS_PREFIX.length)
      : file.name;
    
    if (validateKey(key)) {
      keys.add(key);
    }
  }

  return keys;
}

/**
 * Validates key against bucket allowlist
 */
async function validateKeyAgainstManifest(key: string): Promise<boolean> {
  const now = Date.now();
  
  // Refresh cache if expired
  if (!manifestCache || now - manifestCacheTime > MANIFEST_CACHE_TTL) {
    try {
      manifestCache = await refreshManifestCache();
      manifestCacheTime = now;
    } catch (error) {
      console.error('Error refreshing manifest cache:', error);
      // If cache refresh fails, still validate format but log warning
      return validateKey(key);
    }
  }

  return manifestCache?.has(key) ?? false;
}

/**
 * GET /api/collage/image?key=OBJECT_KEY
 * Streams image bytes from GCS to the browser.
 * Validates key against manifest allowlist and security requirements.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    // Validate key format
    if (!validateKey(key)) {
      return NextResponse.json(
        { error: 'Invalid key format' },
        { status: 400 }
      );
    }

    // Validate against manifest allowlist
    const isValid = await validateKeyAgainstManifest(key);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Key not found in manifest' },
        { status: 403 }
      );
    }

    // Construct full GCS path
    const gcsPath = `${GCS_PREFIX}${key}`;
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(gcsPath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Get file metadata for headers
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'application/octet-stream';
    const contentLength = metadata.size;
    const etag = metadata.etag;
    const lastModified = metadata.updated;

    // Handle Range requests for partial content
    const range = request.headers.get('range');
    let start = 0;
    let end: number | undefined = undefined;

    if (range) {
      const matches = range.match(/bytes=(\d+)-(\d*)/);
      if (matches) {
        start = parseInt(matches[1], 10);
        end = matches[2] ? parseInt(matches[2], 10) : undefined;
      }
    }

    // Create read stream
    const stream = file.createReadStream({ start, end });

    // Convert Node stream to ReadableStream for Next.js
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          try {
            controller.enqueue(new Uint8Array(chunk));
          } catch (error) {
            stream.destroy();
            controller.error(error);
          }
        });
        stream.on('end', () => {
          controller.close();
        });
        stream.on('error', (error: Error) => {
          controller.error(error);
        });
      },
      cancel() {
        stream.destroy();
      },
    });

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) {
      headers.set('Content-Length', contentLength.toString());
    }
    if (etag) {
      headers.set('ETag', etag);
    }
    if (lastModified) {
      headers.set('Last-Modified', new Date(lastModified).toUTCString());
    }

    // Cache images for 1 hour, allow stale-while-revalidate
    headers.set(
      'Cache-Control',
      'public, max-age=3600, stale-while-revalidate=7200'
    );

    // Handle Range requests
    if (range && end !== undefined) {
      const totalLength = typeof contentLength === 'number' 
        ? contentLength 
        : parseInt(String(contentLength || '0'), 10);
      headers.set('Content-Range', `bytes ${start}-${end}/${totalLength}`);
      headers.set('Accept-Ranges', 'bytes');
      return new NextResponse(readableStream, {
        status: 206,
        headers,
      });
    }

    return new NextResponse(readableStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error streaming image:', error);
    return NextResponse.json(
      { error: 'Failed to stream image' },
      { status: 500 }
    );
  }
}

