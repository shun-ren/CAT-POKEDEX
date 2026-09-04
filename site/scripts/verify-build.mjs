import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const required = [
  'build/index.html',
  'build/styles.css',
  'build/app.js',
  'build/assets/cat-sprite-atlas.png',
  'build/assets/miso-cat-expert.png',
  'build/assets/miso-animation-v2.png',
  'build/assets/cat-fact-lounge-v2.png',
  'build/assets/singapore-regions.png',
  'build/assets/cat-trails-singapore-map.png',
  'build/assets/og.png',
  'build/vendor/ort.min.js',
  'build/vendor/ort-wasm-simd-threaded.wasm',
  'build/models/cat-breed-resnet18.onnx',
  'build/models/cat-breed-labels.json'
];

await Promise.all(required.map(path => access(path, constants.R_OK)));
const [html, script] = await Promise.all([
  readFile('build/index.html', 'utf8'),
  readFile('build/app.js', 'utf8')
]);

for (const marker of ['data-open-capture', 'id="fact"', 'id="catalog"', 'id="map"', 'id="trail"', 'id="trailCatSelect"', './styles.css', './vendor/ort.min.js', './app.js']) {
  if (!html.includes(marker)) throw new Error(`Missing required app marker: ${marker}`);
}
if (!script.includes('processImage') || !script.includes('registerWebMCP') || !script.includes('walkTrailTo')) {
  throw new Error('Capture, CAT Trails, or WebMCP surface is missing.');
}

console.log('CATDEX static build is complete and internally consistent.');
