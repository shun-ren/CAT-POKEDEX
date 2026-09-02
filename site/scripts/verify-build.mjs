import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const required = [
  'build/index.html',
  'build/styles.css',
  'build/app.js',
  'build/assets/cat-sprite-atlas.png',
  'build/assets/singapore-regions.png',
  'build/assets/og.png'
];

await Promise.all(required.map(path => access(path, constants.R_OK)));
const [html, script] = await Promise.all([
  readFile('build/index.html', 'utf8'),
  readFile('build/app.js', 'utf8')
]);

for (const marker of ['data-open-capture', 'id="catalog"', 'id="map"', './styles.css', './app.js']) {
  if (!html.includes(marker)) throw new Error(`Missing required app marker: ${marker}`);
}
if (!script.includes('processImage') || !script.includes('registerWebMCP')) {
  throw new Error('Capture or WebMCP surface is missing.');
}

console.log('CATDEX static build is complete and internally consistent.');
