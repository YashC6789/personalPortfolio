/**
 * Tests for collage API validation logic
 * Run with: npm test (if test runner is configured)
 */

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

  // Only allow alphanumeric, dashes, underscores, dots, and slashes
  if (!/^[a-zA-Z0-9._/-]+$/.test(key)) {
    return false;
  }

  return true;
}

/**
 * Builds a column queue following 3:1 landscape-to-portrait pattern
 */
function buildColumnQueue(
  landscapes: Array<{ key: string; orientation: 'landscape' }>,
  portraits: Array<{ key: string; orientation: 'portrait' }>,
  columnIndex: number
): Array<{ key: string; orientation: 'landscape' | 'portrait' }> {
  const PATTERN = ['landscape', 'landscape', 'landscape', 'portrait'] as const;
  
  function seededShuffle<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let random = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const j = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const seededLandscapes = seededShuffle(landscapes, columnIndex * 1000);
  const seededPortraits = seededShuffle(portraits, columnIndex * 2000);

  const queue: Array<{ key: string; orientation: 'landscape' | 'portrait' }> = [];
  let landscapeIdx = 0;
  let portraitIdx = 0;

  // Build queue following 3:1 pattern
  for (let i = 0; i < 20; i++) {
    const requiredOrientation = PATTERN[i % PATTERN.length];

    if (requiredOrientation === 'landscape') {
      if (seededLandscapes.length > 0) {
        queue.push(seededLandscapes[landscapeIdx % seededLandscapes.length]);
        landscapeIdx++;
      } else {
        break;
      }
    } else {
      if (seededPortraits.length > 0) {
        queue.push(seededPortraits[portraitIdx % seededPortraits.length]);
        portraitIdx++;
      } else {
        break;
      }
    }
  }

  return queue;
}

// Test cases
if (require.main === module) {
  console.log('Running validation tests...\n');

  // Test validateKey
  const keyTests = [
    { key: 'image.jpg', expected: true },
    { key: 'landscape/img1.jpg', expected: true },
    { key: '../etc/passwd', expected: false },
    { key: '..\\windows\\system32', expected: false },
    { key: '/absolute/path', expected: false },
    { key: 'image with spaces.jpg', expected: false },
    { key: 'image<script>.jpg', expected: false },
    { key: '', expected: false },
    { key: null as any, expected: false },
  ];

  let keyTestsPassed = 0;
  for (const test of keyTests) {
    const result = validateKey(test.key);
    if (result === test.expected) {
      keyTestsPassed++;
      console.log(`✓ validateKey("${test.key}") = ${result}`);
    } else {
      console.error(`✗ validateKey("${test.key}") = ${result}, expected ${test.expected}`);
    }
  }
  console.log(`\nKey validation: ${keyTestsPassed}/${keyTests.length} passed\n`);

  // Test 3:1 ratio
  const landscapes = Array.from({ length: 12 }, (_, i) => ({
    key: `landscape${i}.jpg`,
    orientation: 'landscape' as const,
  }));
  const portraits = Array.from({ length: 4 }, (_, i) => ({
    key: `portrait${i}.jpg`,
    orientation: 'portrait' as const,
  }));

  const queue = buildColumnQueue(landscapes, portraits, 0);
  
  // Verify pattern: first 12 should be 3L, 1P, 3L, 1P, 3L, 1P
  const expectedPattern = [
    'landscape', 'landscape', 'landscape', 'portrait',
    'landscape', 'landscape', 'landscape', 'portrait',
    'landscape', 'landscape', 'landscape', 'portrait',
  ];

  let ratioTestsPassed = 0;
  for (let i = 0; i < Math.min(queue.length, expectedPattern.length); i++) {
    const actual = queue[i].orientation;
    const expected = expectedPattern[i];
    if (actual === expected) {
      ratioTestsPassed++;
    } else {
      console.error(`✗ Position ${i}: expected ${expected}, got ${actual}`);
    }
  }

  console.log(`3:1 Ratio test: ${ratioTestsPassed}/${expectedPattern.length} positions correct`);
  console.log(`\nTotal queue length: ${queue.length}`);
  console.log(`Queue preview: ${queue.slice(0, 8).map(img => img.orientation).join(', ')}...`);

  if (keyTestsPassed === keyTests.length && ratioTestsPassed === expectedPattern.length) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

export { validateKey, buildColumnQueue };

