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
    const bucket = storage.bucket(BUCKET_NAME);
    
    // List objects under the prefix
    const [files] = await bucket.getFiles({
      prefix: GCS_PREFIX,
      // Limit to reasonable number to avoid huge manifests
      maxResults: 1000,
    });

    const manifest: CollageImage[] = [];

    for (const file of files) {
      // Skip directories (files ending with /)
      if (file.name.endsWith('/')) {
        continue;
      }

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
        const width = parseInt(metadata.metadata.width, 10);
        const height = parseInt(metadata.metadata.height, 10);
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
        size: parseInt(metadata.size || '0', 10),
        updated: metadata.updated,
      });
    }

    // Cache the manifest for 5 minutes
    return NextResponse.json(manifest, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching collage manifest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collage manifest' },
      { status: 500 }
    );
  }
}

