// gta6-meme-x-01 entry (Node 22, standard library only): it copies POST.json
// from the repository root to /output/POST.json, where the gate reads it.
// The entry is the X post itself: a GTA 6 launch-week meme with make.fun's
// ghost mascot in the picture, posted on X with make.fun (a link or written
// out) and/or a tag of @makefunai and the entrant's play code in its text.
// POST.json names the post's address, and the house reads the post from X
// (its first picture and its text) and hands that to the judge.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const src = join(BOT_DIR, 'POST.json');
const post = JSON.parse(readFileSync(src, 'utf8')) as { url?: unknown };
if (
  typeof post.url !== 'string' ||
  !/^https:\/\/(x\.com|twitter\.com)\/\w+\/status\/\d+$/.test(post.url)
) {
  console.error(
    'POST.json must name an X post: {"url": "https://x.com/<handle>/status/<id>"}',
  );
  process.exit(1);
}

// Second validation layer: parse the URL and confirm the host and path
// shape, so a string that merely looks like a post address cannot slip
// through if the pattern above is ever loosened.
const parsed = new URL(post.url);
const segments = parsed.pathname.split('/').filter(Boolean);
if (
  (parsed.hostname !== 'x.com' && parsed.hostname !== 'twitter.com') ||
  segments.length !== 3 ||
  segments[1] !== 'status' ||
  !/^\d+$/.test(segments[2])
) {
  console.error('POST.json URL failed structural validation.');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(src, join(OUTPUT_DIR, 'POST.json'));
