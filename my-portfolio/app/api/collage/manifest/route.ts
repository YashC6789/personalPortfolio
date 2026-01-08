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
        // Extract key relative to prefix (for cleaner API)
        // Preserve folder structure (landscape/vertical) in the key
        const key = file.name.startsWith(GCS_PREFIX)
          ? file.name.slice(GCS_PREFIX.length)
          : file.name;
        
        // Ensure key doesn't start with / (clean up any leading slashes)
        const cleanKey = key.startsWith('/') ? key.slice(1) : key;
        
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
          // Fallback: check folder structure and filename patterns
          const name = file.name.toLowerCase();
          const cleanKeyLower = cleanKey.toLowerCase();
          
          // Check folder structure first (most reliable)
          if (cleanKeyLower.includes('/vertical/') || cleanKeyLower.includes('/vert/') || cleanKeyLower.startsWith('vertical/')) {
            orientation = 'portrait';
          } else if (cleanKeyLower.includes('/landscape/') || cleanKeyLower.includes('/land/') || cleanKeyLower.startsWith('landscape/')) {
            orientation = 'landscape';
          } else if (name.includes('vert') || name.includes('portrait') || name.includes('port')) {
            orientation = 'portrait';
          } else if (name.includes('land') || name.startsWith('land')) {
            orientation = 'landscape';
          }
          // Default is already 'landscape' set above
        }

        manifest.push({
          key: cleanKey,
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
    
    // Check if it's a credentials error (common in local development)
    const isCredentialsError = errorMessage.includes('Could not load the default credentials') ||
                               errorMessage.includes('authentication') ||
                               errorMessage.includes('credentials');
    
    const errorDetails: any = {
      error: 'Failed to fetch collage manifest',
      message: errorMessage,
      bucket: BUCKET_NAME,
      prefix: GCS_PREFIX,
    };
    
    // Add helpful message for local development
    if (isCredentialsError && process.env.NODE_ENV !== 'production') {
      errorDetails.localDevHelp = 'For local development, run: gcloud auth application-default login';
      errorDetails.docs = 'See docs/IMAGE_SETUP.md for setup instructions';
    }
    
    console.error('[Manifest] Error details:', errorDetails);
    return NextResponse.json(errorDetails, { status: 500 });
  }
}


