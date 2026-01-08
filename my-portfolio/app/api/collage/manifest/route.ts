import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Initialize GCS client using Application Default Credentials
const storage = new Storage();

const BUCKET_NAME = process.env.GCS_BUCKET || 'rotating_image_collage_bucket';
const GCS_PREFIX = process.env.GCS_PREFIX || 'collage/';

interface CollageImage {
  key: string;
  orientation: 'landscape' | 'portrait';
  contentType?: string;
  size?: number;
  updated?: string;
}

/**
 * GET /api/collage/manifest
 * Returns a curated manifest of images available for the collage.
 * This is an allowlist - only images in this manifest can be accessed.
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`[Manifest] Fetching from bucket: ${BUCKET_NAME}, prefix: ${GCS_PREFIX}`);
    
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Check if bucket exists
    const [bucketExists] = await bucket.exists();
    if (!bucketExists) {
      console.error(`[Manifest] Bucket ${BUCKET_NAME} does not exist`);
      return NextResponse.json(
        { error: `Bucket ${BUCKET_NAME} does not exist` },
        { status: 404 }
      );
    }
    
    // List objects under the prefix
    const [files] = await bucket.getFiles({
      prefix: GCS_PREFIX,
      // Limit to reasonable number to avoid huge manifests
      maxResults: 1000,
    });

    console.log(`[Manifest] Found ${files.length} files with prefix ${GCS_PREFIX}`);

    const manifest: CollageImage[] = [];

    for (const file of files) {
      // Skip directories (files ending with /)
      if (file.name.endsWith('/')) {
        continue;
      }

      try {
        // Get metadata to determine orientation and other properties
        const [metadata] = await file.getMetadata();
      
      // Determine orientation from metadata or filename
      // You can store custom metadata with 'orientation' field, or derive from dimensions
      let orientation: 'landscape' | 'portrait' = 'landscape';
      
      // Check for explicit orientation in metadata
      if (metadata.metadata?.orientation) {
        orientation = metadata.metadata.orientation as 'landscape' | 'portrait';
      } else if (metadata.metadata?.width && metadata.metadata?.height) {
        // Derive from dimensions if available
        const width = typeof metadata.metadata.width === 'number'
          ? metadata.metadata.width
          : parseInt(String(metadata.metadata.width), 10);
        const height = typeof metadata.metadata.height === 'number'
          ? metadata.metadata.height
          : parseInt(String(metadata.metadata.height), 10);
        orientation = width > height ? 'landscape' : 'portrait';
      } else {
        // Fallback: check filename patterns
        const name = file.name.toLowerCase();
        if (name.includes('vert') || name.includes('portrait') || name.includes('port')) {
          orientation = 'portrait';
        }
      }

      // Extract key relative to prefix (for cleaner API)
      const key = file.name.startsWith(GCS_PREFIX)
        ? file.name.slice(GCS_PREFIX.length)
        : file.name;

        manifest.push({
          key,
          orientation,
          contentType: metadata.contentType,
          size: typeof metadata.size === 'number'
            ? metadata.size
            : parseInt(String(metadata.size || '0'), 10),
          updated: metadata.updated,
        });
      } catch (fileError) {
        console.error(`[Manifest] Error processing file ${file.name}:`, fileError);
        // Continue with next file instead of failing entirely
        continue;
      }
    }

    console.log(`[Manifest] Returning ${manifest.length} images in manifest`);

    // Cache the manifest for 5 minutes
    return NextResponse.json(manifest, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Manifest] Error fetching collage manifest:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      error: 'Failed to fetch collage manifest',
      message: errorMessage,
      bucket: BUCKET_NAME,
      prefix: GCS_PREFIX,
    };
    console.error('[Manifest] Error details:', errorDetails);
    return NextResponse.json(errorDetails, { status: 500 });
  }
}


