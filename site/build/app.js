const TOTAL_BREEDS = 73;
const STORAGE_KEY = 'catdex.sightings.v1';
const REGIONS = ['Central', 'East', 'North', 'North-East', 'West', 'Southern Islands'];
const CAT_FACTS = [
  'Cats use their whiskers to sense nearby objects and openings, even in low light. Whiskers are sensitive tools, so they should never be trimmed.',
  'A slow blink is often a relaxed, friendly signal. Try softly closing your eyes and looking slightly away instead of staring.',
  'A cat’s nose print has a unique pattern of tiny ridges, much like a human fingerprint.',
  'Cats can rotate each ear independently, helping them pinpoint the source of very quiet sounds.',
  'Purring is not only a sign of happiness. Cats may also purr when stressed, frightened, or in pain, so context matters.',
  'Most adult cats are lactose intolerant. Fresh water is a much safer everyday drink than cow’s milk.',
  'A cat’s tail helps with balance, but it is also a mood signal. A gently upright tail often means a friendly greeting.',
  'Cats are crepuscular: many naturally become most active around dawn and dusk rather than in the middle of the night.',
  'Kneading is a kittenhood behaviour that many cats keep as adults when they feel comfortable and secure.',
  'Cats have an extra scent-detecting organ in the roof of the mouth. The funny open-mouth “flehmen” face helps them use it.'
];
const COAT_KNOWLEDGE = {
  tuxedo: 'Tuxedo describes a black-and-white bicolour coat, often with a dark back and white chest, belly, or paws. It is a coat pattern, not a breed, and can appear in many breeds and mixed cats.',
  tabby: 'Tabby is a family of striped, spotted, ticked, or marbled patterns, usually with an M-shaped forehead marking. It is not a breed.',
  calico: 'Calico cats have distinct white, ginger, and black patches. Calico is a coat pattern rather than a breed, and most calicos are female because of how coat-colour genes are inherited.',
  tortoiseshell: 'Tortoiseshell coats mix ginger and black with little or no white. A tortoiseshell with obvious tabby striping is often called a torbie.',
  ginger: 'Ginger describes orange or red fur. Many ginger cats also show tabby markings, even when the stripes are subtle.',
  'colour-point': 'Colour-point cats have a lighter body with darker ears, face, paws, and tail. The pattern occurs in Siamese, Ragdoll, Birman, and other cats.',
  black: 'Solid black is a coat colour found in many mixed cats and several breeds. A black coat alone does not establish that a cat is a Bombay.',
  grey: 'Grey is often called blue in cat terminology. It occurs in mixed cats and breeds such as the Russian Blue and British Shorthair.'
};

const BREEDS = {
  'Domestic Shorthair': {
    origin: 'Worldwide', rarity: 'Common',
    traits: ['Adaptable', 'Individual', 'Resilient'],
    fact: 'Domestic Shorthair is a broad mixed-ancestry type rather than a single pedigree breed. Their looks and personalities can vary wonderfully.'
  },
  'Siamese': {
    origin: 'Thailand', rarity: 'Uncommon',
    traits: ['Vocal', 'Social', 'Clever'],
    fact: 'Siamese cats are known for colour-point coats, bright blue eyes and a strong tendency to “talk” with their people.'
  },
  'Bombay': {
    origin: 'United States', rarity: 'Rare',
    traits: ['Affectionate', 'Playful', 'Confident'],
    fact: 'The Bombay was developed for its sleek black coat and copper-toned eyes. Many black community cats are mixed-breed lookalikes.'
  },
  'American Shorthair': {
    origin: 'United States', rarity: 'Uncommon',
    traits: ['Easygoing', 'Observant', 'Athletic'],
    fact: 'American Shorthairs are sturdy cats with dense coats. Silver tabby is their best-known pattern, though many colours occur.'
  },
  'British Shorthair': {
    origin: 'United Kingdom', rarity: 'Uncommon',
    traits: ['Calm', 'Independent', 'Gentle'],
    fact: 'British Shorthairs are recognised by their plush coat, round face and unhurried temperament.'
  },
  'Bengal': {
    origin: 'United States', rarity: 'Rare',
    traits: ['Energetic', 'Curious', 'Agile'],
    fact: 'Bengals often have bold rosettes or marbling and need plenty of physical and mental activity.'
  },
  'Ragdoll': {
    origin: 'United States', rarity: 'Rare',
    traits: ['Gentle', 'Relaxed', 'People-loving'],
    fact: 'Ragdolls are large, semi-longhaired colour-point cats known for their placid, companionable nature.'
  },
  'Maine Coon': {
    origin: 'United States', rarity: 'Rare',
    traits: ['Friendly', 'Large', 'Adaptable'],
    fact: 'Maine Coons are among the largest domestic breeds and have water-resistant coats suited to cold climates.'
  },
  'Persian': {
    origin: 'Iran', rarity: 'Uncommon',
    traits: ['Quiet', 'Sweet', 'Laid-back'],
    fact: 'Persians have long coats that need regular grooming. Their facial shape and calm presence are especially distinctive.'
  },
  'Russian Blue': {
    origin: 'Russia', rarity: 'Rare',
    traits: ['Reserved', 'Loyal', 'Graceful'],
    fact: 'Russian Blues have a dense blue-grey double coat with silver-tipped hairs and vivid green eyes.'
  },
  'Turkish Angora': {
    origin: 'Türkiye', rarity: 'Rare',
    traits: ['Playful', 'Graceful', 'Assertive'],
    fact: 'Turkish Angoras are fine-boned, silky-coated cats. White is famous, but the breed comes in many colours.'
  },
  'Abyssinian': {
    origin: 'Southeast Asia', rarity: 'Rare',
    traits: ['Active', 'Inquisitive', 'People-focused'],
    fact: 'Abyssinians have a warm ticked coat in which each hair carries alternating bands of colour.'
  },
  'Birman': {
    origin: 'France', rarity: 'Rare', traits: ['Gentle', 'Social', 'Quiet'],
    fact: 'Birmans are semi-longhaired colour-point cats known for deep blue eyes and white-gloved paws.'
  },
  'Egyptian Mau': {
    origin: 'Egypt', rarity: 'Rare', traits: ['Athletic', 'Alert', 'Devoted'],
    fact: 'Egyptian Maus are naturally spotted cats with expressive green eyes and an athletic build.'
  },
  'Sphynx': {
    origin: 'Canada', rarity: 'Rare', traits: ['Warm', 'Social', 'Energetic'],
    fact: 'Sphynx cats have very little visible coat and need regular skin care and protection from temperature extremes.'
  }
};

const PET_MODEL_LABELS = [
  'Abyssinian','Bengal','Birman','Bombay','British Shorthair','Egyptian Mau','Maine Coon','Persian','Ragdoll','Russian Blue','Siamese','Sphynx',
  'American Bulldog','American Pit Bull Terrier','Basset Hound','Beagle','Boxer','Chihuahua','English Cocker Spaniel','English Setter','German Shorthaired','Great Pyrenees','Havanese','Japanese Chin','Keeshond','Leonberger','Miniature Pinscher','Newfoundland','Pomeranian','Pug','Saint Bernard','Samoyed','Scottish Terrier','Shiba Inu','Staffordshire Bull Terrier','Wheaten Terrier','Yorkshire Terrier'
];
let breedModelBundlePromise;

const sampleSightings = [
  { id: 'sg-001', nickname: 'Kopi', breed: 'Domestic Shorthair', coat: 'Ginger tabby', region: 'West', capturedAt: '2026-08-29T07:42:00+08:00', note: 'Sunny stairwell supervisor. Slow blink champion.', sprite: 0 },
  { id: 'sg-002', nickname: 'Nori', breed: 'Domestic Shorthair', coat: 'Black tuxedo', region: 'Central', capturedAt: '2026-08-30T18:15:00+08:00', note: 'Tuxedo coat and a very serious little moustache.', sprite: 1 },
  { id: 'sg-003', nickname: 'Patches', breed: 'Domestic Shorthair', coat: 'Calico', region: 'West', capturedAt: '2026-08-31T12:08:00+08:00', note: 'Calico coat. Watched the world from a safe distance.', sprite: 2 },
  { id: 'sg-004', nickname: 'Mochi', breed: 'American Shorthair', coat: 'Silver tabby', region: 'East', capturedAt: '2026-09-01T09:21:00+08:00', note: 'A calm silver tabby lookalike with bright green eyes.', sprite: 3 },
  { id: 'sg-005', nickname: 'Kaya', breed: 'Siamese', coat: 'Seal colour-point', region: 'North', capturedAt: '2026-09-01T17:56:00+08:00', note: 'Blue-eyed and chatty. Breed is a visual estimate.', sprite: 4 },
  { id: 'sg-006', nickname: 'Charcoal', breed: 'Bombay', coat: 'Solid black', region: 'Central', capturedAt: '2026-09-02T06:33:00+08:00', note: 'Sleek black coat. Breed is a visual estimate.', sprite: 5 }
];

const els = {
  modal: document.querySelector('#captureModal'), detail: document.querySelector('#detailModal'),
  form: document.querySelector('#captureForm'), photo: document.querySelector('#photoInput'),
  uploadZone: document.querySelector('#uploadZone'), canvasWrap: document.querySelector('#canvasWrap'),
  canvas: document.querySelector('#pixelCanvas'), nickname: document.querySelector('#nicknameInput'),
  breed: document.querySelector('#breedSelect'), region: document.querySelector('#regionSelect'),
  note: document.querySelector('#noteInput'), confidence: document.querySelector('#confidenceText'),
  status: document.querySelector('#formStatus'), stashButton: document.querySelector('#stashButton'),
  grid: document.querySelector('#catGrid'), search: document.querySelector('#searchInput'),
  regionFilter: document.querySelector('#regionFilter'), empty: document.querySelector('#emptyState'),
  toast: document.querySelector('#toast'), detailContent: document.querySelector('#detailContent'),
  sound: document.querySelector('#soundButton')
};
Object.assign(els, {
  breedResult: document.querySelector('#breedResult'),
  coat: document.querySelector('#coatSelect'),
  coatResult: document.querySelector('#coatResult'),
  coatConfidenceBadge: document.querySelector('#coatConfidenceBadge'),
  combinedResult: document.querySelector('#combinedResult'),
  confidenceBadge: document.querySelector('#confidenceBadge'),
  candidateList: document.querySelector('#candidateList'),
  dailyFact: document.querySelector('#dailyFact'),
  expertChat: document.querySelector('#expertChat'),
  expertLauncher: document.querySelector('#expertLauncher'),
  chatMessages: document.querySelector('#chatMessages'),
  chatInput: document.querySelector('#chatInput')
});

let soundOn = true;
let processedPhoto = '';
let suggestionConfidence = 0;
let coatConfidence = 0;
let analysisSequence = 0;
let sightings = loadSightings();

function loadSightings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : sampleSightings;
  } catch { return sampleSightings; }
}

function saveSightings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sightings));
    return true;
  } catch {
    showToast('DEVICE STORAGE IS FULL — ENTRY KEPT FOR THIS SESSION');
    return false;
  }
}

function spritePosition(index) {
  const col = index % 4;
  const row = index > 3 ? 1 : 0;
  return `${col * 33.333}% ${row * 100}%`;
}

function imageStyle(cat) {
  return `background-position:${spritePosition(cat.sprite ?? 0)};`;
}

function uploadedPortrait(cat, className) {
  if (!cat.photo || typeof cat.photo !== 'string' || !cat.photo.startsWith('data:image/')) return '';
  return `<img class="${className}" src="${escapeHtml(cat.photo)}" alt="Cartoon portrait of ${escapeHtml(cat.nickname || 'a cat')}" />`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-SG', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
}

function renderCatalog() {
  const query = els.search.value.trim().toLowerCase();
  const region = els.regionFilter.value;
  const filtered = sightings.filter(cat => {
    const matchesText = `${cat.nickname} ${cat.coat || ''} ${cat.breed}`.toLowerCase().includes(query);
    return matchesText && (region === 'all' || cat.region === region);
  });

  const cards = filtered.map((cat, index) => `
    <button class="cat-card" type="button" data-cat-id="${escapeHtml(cat.id)}" aria-label="View ${escapeHtml(cat.nickname || cat.breed)} details">
      <div class="cat-card-image ${cat.photo ? 'is-photo' : 'is-sprite'}" style="${cat.photo ? '' : imageStyle(cat)}">
        ${uploadedPortrait(cat, 'uploaded-card-portrait')}
        <span class="cat-number">#${String(sightings.indexOf(cat) + 1).padStart(3, '0')}</span>
        <span class="cat-region">${escapeHtml(cat.region.toUpperCase())}</span>
      </div>
      <div class="cat-card-body"><h3>${escapeHtml(cat.nickname || 'Unnamed cat')}</h3><p>${escapeHtml(`${cat.coat ? `${cat.coat} · ` : ''}${cat.breed}`)}</p><p>STASHED ${formatDate(cat.capturedAt).toUpperCase()}</p></div>
    </button>`).join('');

  const locked = query || region !== 'all' ? '' : [1,2,3].map(offset => `
    <article class="cat-card locked-card" aria-label="Locked breed entry">
      <div class="cat-card-image locked-image">?</div>
      <div class="cat-card-body"><h3>#${String(sightings.length + offset).padStart(3,'0')} // LOCKED</h3><p>Keep exploring to discover this entry.</p></div>
    </article>`).join('');
  els.grid.innerHTML = cards + locked;
  els.empty.hidden = filtered.length > 0 || (!query && region === 'all');
  els.grid.querySelectorAll('[data-cat-id]').forEach(button => button.addEventListener('click', () => openDetail(button.dataset.catId)));
}

function renderStats() {
  const breeds = new Set(sightings.map(cat => cat.breed));
  const regions = new Set(sightings.map(cat => cat.region));
  const completion = Math.max(1, Math.round((breeds.size / TOTAL_BREEDS) * 100));
  document.querySelector('#breedCount').innerHTML = `${breeds.size} <small>/ ${TOTAL_BREEDS}</small>`;
  document.querySelector('#sightingCount').textContent = sightings.length;
  document.querySelector('#regionCount').innerHTML = `${regions.size} <small>/ ${REGIONS.length}</small>`;
  document.querySelector('#completionLabel').textContent = `${completion}%`;
  document.querySelector('#completionBar').style.width = `${completion}%`;
}

function renderMap() {
  document.querySelectorAll('.region-marker').forEach(marker => {
    const count = sightings.filter(cat => cat.region === marker.dataset.region).length;
    marker.classList.toggle('muted', count === 0);
    marker.querySelector('span').textContent = count ? `${count} ${count === 1 ? 'CAT' : 'CATS'}` : 'UNEXPLORED';
    marker.onclick = () => {
      els.regionFilter.value = marker.dataset.region;
      renderCatalog();
      document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth' });
    };
  });
}

function renderAll() { renderCatalog(); renderStats(); renderMap(); }

function openDetail(id) {
  const cat = sightings.find(item => item.id === id);
  if (!cat) return;
  const profile = BREEDS[cat.breed] || BREEDS['Domestic Shorthair'];
  els.detailContent.innerHTML = `
    <div class="detail-layout">
      <div class="detail-image ${cat.photo ? 'photo' : ''}" style="${cat.photo ? '' : imageStyle(cat)}">${uploadedPortrait(cat, 'uploaded-detail-portrait')}</div>
      <div class="detail-copy">
        <p class="eyebrow">FIELD ENTRY // ${escapeHtml(cat.id.toUpperCase())}</p>
        <h2>${escapeHtml(cat.nickname || 'Unnamed cat')}</h2>
        <p class="breed-name"><strong>${escapeHtml(cat.coat || 'Coat not recorded')}</strong> · ${escapeHtml(cat.breed)} <small>· visual estimate</small></p>
        <div class="detail-meta"><div><span>REGION</span><strong>${escapeHtml(cat.region)}</strong></div><div><span>CAPTURED</span><strong>${formatDate(cat.capturedAt)} · ${formatTime(cat.capturedAt)}</strong></div></div>
        <div class="trait-list">${profile.traits.map(trait => `<span>${escapeHtml(trait.toUpperCase())}</span>`).join('')}</div>
        <p class="detail-fact"><strong>${escapeHtml(profile.origin)} · ${escapeHtml(profile.rarity)}</strong><br />${escapeHtml(profile.fact)}</p>
        ${cat.note ? `<p class="field-note">“${escapeHtml(cat.note)}”</p>` : ''}
      </div>
    </div>`;
  els.detail.showModal();
  playTone(560, .05);
}

function resetCapture() {
  analysisSequence++;
  els.form.reset();
  processedPhoto = '';
  suggestionConfidence = 0;
  coatConfidence = 0;
  els.uploadZone.hidden = false;
  els.canvasWrap.hidden = true;
  els.stashButton.disabled = true;
  els.breed.value = 'Domestic Shorthair';
  els.coat.value = 'Unknown coat';
  els.coatResult.textContent = 'Waiting for a photo';
  els.coatConfidenceBadge.textContent = '—';
  els.breedResult.textContent = 'Waiting for a photo';
  els.confidenceBadge.textContent = '—';
  els.combinedResult.textContent = 'Add a clear cat photo to begin';
  els.candidateList.hidden = true;
  els.candidateList.innerHTML = '';
  els.confidence.textContent = 'No breed knowledge needed. CATDEX will analyse the photo and fill this in for you.';
  els.status.textContent = '';
  els.region.value = 'Central';
}

function openCapture() {
  resetCapture();
  els.modal.showModal();
  playTone(420, .05);
}

function closeCapture() { els.modal.close(); }

function getBreedModelBundle() {
  if (!breedModelBundlePromise) {
    if (!window.ort) return Promise.reject(new Error('ONNX Runtime is unavailable'));
    window.ort.env.wasm.wasmPaths = './vendor/';
    window.ort.env.wasm.numThreads = 1;
    window.ort.env.wasm.proxy = false;
    breedModelBundlePromise = Promise.all([
      window.ort.InferenceSession.create('./models/cat-breed-resnet18.onnx', { executionProviders: ['wasm'] }),
      fetch('./models/cat-breed-labels.json').then(response => response.ok ? response.json() : PET_MODEL_LABELS)
    ]).then(([session, labels]) => ({
      session,
      labels: Array.isArray(labels) && labels.length ? labels : PET_MODEL_LABELS
    }));
  }
  return breedModelBundlePromise;
}

async function classifyBreedWithModel(sourceCanvas) {
  const { session, labels } = await getBreedModelBundle();
  const inputCanvas = document.createElement('canvas');
  inputCanvas.width = 224; inputCanvas.height = 224;
  const inputCtx = inputCanvas.getContext('2d', { willReadFrequently: true });
  inputCtx.drawImage(sourceCanvas, 0, 0, 224, 224);
  const pixels = inputCtx.getImageData(0, 0, 224, 224).data;
  const planeSize = 224 * 224;
  const oneImage = new Float32Array(3 * planeSize);
  const mean = [.485, .456, .406], std = [.229, .224, .225];
  for (let p = 0; p < planeSize; p++) {
    oneImage[p] = (pixels[p*4] / 255 - mean[0]) / std[0];
    oneImage[planeSize+p] = (pixels[p*4+1] / 255 - mean[1]) / std[1];
    oneImage[planeSize*2+p] = (pixels[p*4+2] / 255 - mean[2]) / std[2];
  }
  const inputShape = session.inputMetadata[session.inputNames[0]].dimensions;
  const batchSize = Number.isInteger(inputShape[0]) && inputShape[0] > 0 ? inputShape[0] : 1;
  const batch = new Float32Array(oneImage.length * batchSize);
  for (let n = 0; n < batchSize; n++) batch.set(oneImage, n * oneImage.length);
  const tensor = new window.ort.Tensor('float32', batch, [batchSize,3,224,224]);
  const outputMap = await session.run({ [session.inputNames[0]]: tensor });
  const logits = Array.from(outputMap[session.outputNames[0]].data.slice(0, labels.length));
  const max = Math.max(...logits);
  const exp = logits.map(value => Math.exp(value-max));
  const total = exp.reduce((sum,value) => sum+value, 0);
  const rankedAll = exp.map((value,index) => ({ name:labels[index], probability:value/total })).sort((a,b) => b.probability-a.probability);
  const knownCats = new Set(labels.filter(label => Object.hasOwn(BREEDS, label)));
  const catMass = rankedAll.filter(item => knownCats.has(item.name)).reduce((sum,item) => sum+item.probability, 0);
  const cats = rankedAll.filter(item => knownCats.has(item.name)).map(item => ({ ...item, probability:item.probability/Math.max(.0001,catMass) }));
  if (!knownCats.has(rankedAll[0].name) || catMass < .35) throw new Error('The breed model could not confidently isolate a cat');
  return {
    name:cats[0].name,
    confidence:Math.max(1,Math.min(96,Math.round(cats[0].probability*100))),
    candidates:cats.slice(1,3).map(item => ({ name:item.name, score:Math.max(1,Math.round(item.probability*100)) })),
    model:'Oxford-IIIT Pet ResNet18'
  };
}

async function processImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    els.status.textContent = 'Please choose an image file.';
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    els.status.textContent = 'That photo is over 15 MB. Try a smaller image.';
    return;
  }
  const runId = ++analysisSequence;
  processedPhoto = '';
  els.stashButton.disabled = true;
  els.coatResult.textContent = 'Analysing new photo…';
  els.breedResult.textContent = 'Analysing new photo…';
  els.coatConfidenceBadge.textContent = '…';
  els.confidenceBadge.textContent = '…';
  els.combinedResult.textContent = 'Fresh analysis in progress';
  els.candidateList.hidden = true;
  els.status.textContent = 'Separating coat and breed clues…';
  const image = await createImageBitmap(file);
  if (runId !== analysisSequence) { image.close?.(); return; }
  const canvas = els.canvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const side = Math.min(image.width, image.height);
  const sx = (image.width - side) / 2;
  const sy = (image.height - side) / 2;
  const work = document.createElement('canvas');
  work.width = 192; work.height = 192;
  const workCtx = work.getContext('2d', { willReadFrequently: true });
  workCtx.imageSmoothingEnabled = true;
  workCtx.filter = 'saturate(1.16) contrast(1.08)';
  workCtx.drawImage(image, sx, sy, side, side, 0, 0, work.width, work.height);
  workCtx.filter = 'none';
  const sourcePixels = workCtx.getImageData(0, 0, work.width, work.height);
  const analysis = analyseCatAppearance(sourcePixels.data, work.width, work.height);
  els.status.textContent = 'Running the trained breed model locally…';
  try {
    analysis.breed = await classifyBreedWithModel(work);
    analysis.reason = `Coat and breed were analysed separately. The breed ranking comes from a local ResNet18 trained on the Oxford-IIIT Pet breeds; the coat label comes from CATDEX colour and pattern analysis. “${analysis.coat.name} ${analysis.breed.name}” is still a visual estimate, not proof of pedigree.`;
  } catch {
    analysis.reason += ' The trained breed model was unavailable for this photo, so CATDEX used its local appearance fallback.';
  }
  cartoonise(workCtx, work.width, work.height);
  if (runId !== analysisSequence) { image.close?.(); return; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(work, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#123b2a';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  processedPhoto = canvas.toDataURL('image/webp', .88);
  els.breed.value = analysis.breed.name;
  els.coat.value = analysis.coat.name;
  suggestionConfidence = analysis.breed.confidence;
  coatConfidence = analysis.coat.confidence;
  els.coatResult.textContent = analysis.coat.name;
  els.coatConfidenceBadge.textContent = `${analysis.coat.confidence}%`;
  els.breedResult.textContent = analysis.breed.name;
  els.confidenceBadge.textContent = `${analysis.breed.confidence}%`;
  els.combinedResult.textContent = `${analysis.coat.name} ${analysis.breed.name}`;
  els.confidence.textContent = analysis.reason;
  els.candidateList.innerHTML = `
    <div><small>COAT ALTERNATIVES</small>${analysis.coat.candidates.map(item => `<span>${escapeHtml(item.name)} · ${item.score}%</span>`).join('')}</div>
    <div><small>BREED ALTERNATIVES</small>${analysis.breed.candidates.map(item => `<span>${escapeHtml(item.name)} · ${item.score}%</span>`).join('')}</div>`;
  els.candidateList.hidden = false;
  els.uploadZone.hidden = true;
  els.canvasWrap.hidden = false;
  els.stashButton.disabled = false;
  els.status.textContent = 'Cartoon portrait and type analysis ready.';
  playTone(720, .08);
  image.close?.();
}

function cartoonise(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const grey = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    grey[p] = data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114;
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.round(data[i] / 40) * 40);
    data[i + 1] = Math.min(255, Math.round(data[i + 1] / 40) * 40);
    data[i + 2] = Math.min(255, Math.round(data[i + 2] / 40) * 40);
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gx = -grey[p-width-1] + grey[p-width+1] - 2*grey[p-1] + 2*grey[p+1] - grey[p+width-1] + grey[p+width+1];
      const gy = -grey[p-width-1] - 2*grey[p-width] - grey[p-width+1] + grey[p+width-1] + 2*grey[p+width] + grey[p+width+1];
      if (Math.hypot(gx, gy) > 150) {
        const i = p * 4;
        data[i] = Math.round(data[i] * .22 + 18 * .78);
        data[i + 1] = Math.round(data[i + 1] * .22 + 59 * .78);
        data[i + 2] = Math.round(data[i + 2] * .22 + 42 * .78);
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function extractAppearanceFeatures(data, width, height) {
  const corners = [[8,8],[width-9,8],[8,height-9],[width-9,height-9]];
  const background = corners.reduce((sum, [x,y]) => {
    const i = (y * width + x) * 4;
    sum[0] += data[i]; sum[1] += data[i+1]; sum[2] += data[i+2];
    return sum;
  }, [0,0,0]).map(value => value / corners.length);
  const totals = { weight:0, dark:0, light:0, warm:0, grey:0, colourful:0, texture:0, centreDark:0, centreWeight:0, outerLight:0, outerWeight:0, r:0, g:0, b:0 };
  for (let y = 2; y < height - 2; y += 2) {
    for (let x = 2; x < width - 2; x += 2) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      const value = (r + g + b) / 3;
      const spread = Math.max(r,g,b) - Math.min(r,g,b);
      const nx = (x - width/2) / (width/2), ny = (y - height/2) / (height/2);
      const centre = Math.max(.08, 1 - Math.sqrt(nx*nx + ny*ny));
      const bgDistance = Math.sqrt((r-background[0])**2 + (g-background[1])**2 + (b-background[2])**2);
      const weight = centre * (.45 + Math.min(1.4, bgDistance / 58));
      const neighbour = ((y * width + x + 2) * 4);
      const neighbourValue = (data[neighbour] + data[neighbour+1] + data[neighbour+2]) / 3;
      totals.weight += weight;
      totals.r += r*weight; totals.g += g*weight; totals.b += b*weight;
      if (value < 78) totals.dark += weight;
      if (value > 188) totals.light += weight;
      if (r > b*1.24 && r > g*1.06 && r > 105) totals.warm += weight;
      if (spread < 27 && value > 55 && value < 205) totals.grey += weight;
      if (spread > 66) totals.colourful += weight;
      if (Math.abs(value-neighbourValue) > 31) totals.texture += weight;
      if (centre > .55) { totals.centreWeight += weight; if (value < 92) totals.centreDark += weight; }
      else { totals.outerWeight += weight; if (value > 166) totals.outerLight += weight; }
    }
  }
  const ratio = key => totals[key] / Math.max(1, totals.weight);
  return {
    dark:ratio('dark'), light:ratio('light'), warm:ratio('warm'), grey:ratio('grey'),
    colourful:ratio('colourful'), texture:ratio('texture'),
    centreDark:totals.centreDark/Math.max(1,totals.centreWeight),
    outerLight:totals.outerLight/Math.max(1,totals.outerWeight),
    r:totals.r/totals.weight, g:totals.g/totals.weight, b:totals.b/totals.weight
  };
}

function classifyCoat(f) {
  if (f.light > .25 && f.centreDark > .36 && f.outerLight > .38) return { id:'colourpoint', name:'Seal colour-point', confidence:81, candidates:[{name:'Chocolate colour-point',score:54},{name:'Bicolour',score:37}] };
  if (f.warm > .16 && f.dark > .18 && f.light > .10) return { id:'calico', name:'Calico', confidence:84, candidates:[{name:'Tortoiseshell with white',score:62},{name:'Tricolour tabby',score:35}] };
  if (f.dark > .31 && f.light > .09) return { id:'tuxedo', name:'Black tuxedo', confidence:86, candidates:[{name:'Black-and-white bicolour',score:73},{name:'Solid black',score:31}] };
  if (f.warm > .22 && f.dark > .22 && f.light < .12) return { id:'tortoiseshell', name:'Tortoiseshell', confidence:78, candidates:[{name:'Torbie',score:55},{name:'Dark calico',score:36}] };
  if (f.warm > .31 && f.texture > .12) return { id:'gingerTabby', name:'Ginger tabby', confidence:83, candidates:[{name:'Ginger ticked tabby',score:57},{name:'Solid ginger',score:39}] };
  if (f.warm > .27) return { id:'ginger', name:'Solid ginger', confidence:76, candidates:[{name:'Ginger tabby',score:62},{name:'Cream',score:34}] };
  if (f.dark > .57) return { id:'black', name:'Solid black', confidence:88, candidates:[{name:'Black smoke',score:42},{name:'Dark chocolate',score:27}] };
  if (f.grey > .48 && f.texture > .10) return { id:'silverTabby', name:'Silver tabby', confidence:77, candidates:[{name:'Blue-grey tabby',score:59},{name:'Solid blue-grey',score:41}] };
  if (f.grey > .48) return { id:'grey', name:'Solid blue-grey', confidence:79, candidates:[{name:'Silver',score:58},{name:'Blue smoke',score:36}] };
  if (f.light > .58) return { id:'white', name:'Mostly white', confidence:82, candidates:[{name:'Cream-and-white',score:49},{name:'Pale bicolour',score:35}] };
  if (f.texture > .15) return { id:'tabby', name:'Brown tabby', confidence:72, candidates:[{name:'Mackerel tabby',score:61},{name:'Spotted tabby',score:48}] };
  return { id:'bicolour', name:'Bicolour', confidence:64, candidates:[{name:'Mixed coat pattern',score:57},{name:'Tabby with white',score:43}] };
}

function classifyBreed(f, coat) {
  if (coat.id === 'colourpoint') {
    const ragdoll = f.texture > .13;
    return ragdoll
      ? { name:'Ragdoll', confidence:74, candidates:[{name:'Siamese',score:67},{name:'Birman',score:53}] }
      : { name:'Siamese', confidence:78, candidates:[{name:'Ragdoll',score:61},{name:'Domestic colourpoint',score:55}] };
  }
  if (coat.id === 'black') return { name:'Bombay', confidence:71, candidates:[{name:'Domestic Shorthair',score:68},{name:'British Shorthair',score:32}] };
  if (coat.id === 'grey') return { name:'Russian Blue', confidence:72, candidates:[{name:'British Shorthair',score:63},{name:'Domestic Shorthair',score:57}] };
  if (coat.id === 'silverTabby') return { name:'American Shorthair', confidence:69, candidates:[{name:'British Shorthair',score:55},{name:'Egyptian Mau',score:38}] };
  if (coat.id === 'gingerTabby' && f.texture > .18) return { name:'Bengal', confidence:66, candidates:[{name:'Abyssinian',score:57},{name:'Domestic Shorthair',score:53}] };
  if (coat.id === 'white' && f.texture > .13) return { name:'Turkish Angora', confidence:65, candidates:[{name:'Persian',score:52},{name:'Domestic Shorthair',score:49}] };
  if ((coat.id === 'tabby' || coat.id === 'tortoiseshell') && f.texture > .21) return { name:'Maine Coon', confidence:61, candidates:[{name:'Domestic Shorthair',score:59},{name:'American Shorthair',score:46}] };
  return { name:'Domestic Shorthair', confidence:68, candidates:[{name:'American Shorthair',score:49},{name:'Mixed ancestry',score:46}] };
}

function analyseCatAppearance(data, width, height) {
  const features = extractAppearanceFeatures(data, width, height);
  const coat = classifyCoat(features);
  const breed = classifyBreed(features, coat);
  return {
    coat,
    breed,
    reason:`CATDEX analysed coat colour and pattern separately from breed shape cues. The combined label is “${coat.name} ${breed.name}”. Breed remains a visual estimate because ancestry cannot be proven from one photo.`
  };
}

function submitCapture(event) {
  event.preventDefault();
  if (!processedPhoto) return;
  const now = new Date();
  const cat = {
    id: `sg-${Date.now().toString(36)}`,
    nickname: els.nickname.value.trim() || 'Mystery cat',
    breed: els.breed.value,
    coat: els.coat.value,
    region: els.region.value,
    capturedAt: now.toISOString(),
    note: els.note.value.trim(),
    photo: processedPhoto,
    confidence: suggestionConfidence,
    coatConfidence,
    species: 'cat'
  };
  sightings.unshift(cat);
  saveSightings();
  renderAll();
  closeCapture();
  showToast(`${cat.nickname.toUpperCase()} ADDED TO YOUR CATDEX!`);
  document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth' });
  playTone(820, .12);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 2800);
}

function playTone(frequency, duration) {
  if (!soundOn) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'square'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
  } catch { /* audio is optional */ }
}

function populateSelects() {
  els.region.innerHTML = REGIONS.map(region => `<option>${escapeHtml(region)}</option>`).join('');
  els.regionFilter.insertAdjacentHTML('beforeend', REGIONS.map(region => `<option>${escapeHtml(region)}</option>`).join(''));
}

function showDailyFact(offset = 0) {
  const day = Math.floor(Date.now() / 86400000);
  els.dailyFact.textContent = CAT_FACTS[(day + offset) % CAT_FACTS.length];
}

function catExpertAnswer(question) {
  const q = question.toLowerCase();
  if (/not breathing|seizure|collapsed|bleeding|poison|hit by|emergency/.test(q)) return 'That may be an emergency. Keep the cat quiet and contact an emergency veterinarian now. Do not give human medicine, food, or water unless the vet tells you to.';
  if (/food|eat|toxic|unsafe|chocolate|onion|garlic|milk/.test(q)) return 'Keep chocolate, onions, garlic, grapes or raisins, alcohol, caffeine, xylitol, and cooked bones away from cats. Many adults cannot digest milk. A complete cat food and fresh water are the safest basics.';
  const breedMatches = Object.entries(BREEDS).filter(([name]) => q.includes(name.toLowerCase()));
  const coatMatches = Object.entries(COAT_KNOWLEDGE).filter(([name]) => q.includes(name));
  if (breedMatches.length || coatMatches.length) {
    const coatAnswer = coatMatches.map(([, answer]) => answer).join(' ');
    const breedAnswer = breedMatches.map(([name, profile]) => `${name} originated in ${profile.origin}. ${profile.fact}`).join(' ');
    return `${coatAnswer}${coatAnswer && breedAnswer ? ' ' : ''}${breedAnswer} A coat description and breed estimate can be combined, but one does not prove the other.`;
  }
  if (/slow blink|blink/.test(q)) return 'A slow blink usually means the cat feels calm and non-threatening. You can return it gently: soften your gaze, blink slowly, then look a little away.';
  if (/stray|community|feral|outside cat/.test(q)) return 'Approach slowly and let the cat choose distance. Offer water, observe from a safe spot, and contact a local community-cat caregiver or rescue if it is injured. Avoid sharing an exact location publicly.';
  if (/coat|pattern|colour|color/.test(q)) return 'Coat and breed are separate. I can explain tuxedo, tabby, calico, tortoiseshell, ginger, colour-point, black, and blue-grey coats—ask me about one by name.';
  if (/breed|pedigree|what type/.test(q)) return `I know ${Object.keys(BREEDS).join(', ')}. Ask me about one by name. Looks can suggest a breed, but they cannot prove pedigree.`;
  if (/purr|purring/.test(q)) return 'Cats often purr when content, but also when stressed, unwell, or self-soothing. Read the whole cat: posture, appetite, breathing, hiding, and recent behaviour changes matter.';
  if (/tail|ears|body language|angry|scared/.test(q)) return 'A loose body, neutral ears, and softly upright tail suggest comfort. Flattened ears, a lashing tail, crouching, growling, or very wide pupils mean “give me space.” Never force contact.';
  if (/litter|toilet|pee|urine/.test(q)) return 'Use one litter box per cat plus one extra, in quiet separate places, and scoop daily. Sudden straining or repeated trips with little urine can be urgent—especially in male cats—so contact a vet promptly.';
  if (/scratch|bit|bite/.test(q)) return 'Wash a bite or scratch well with soap and running water. Cat bites can infect quickly; seek medical advice for deep wounds, swelling, redness, fever, or bites to the hand or face.';
  if (/groom|brush|fur|hairball/.test(q)) return 'Brush gently in the direction of the coat and stop if the skin twitches or the tail lashes. Frequent vomiting, bald patches, skin-close mats, or excessive grooming deserve veterinary advice.';
  if (/kitten|baby cat/.test(q)) return 'Kittens need warmth, kitten-formulated food, vaccination and parasite guidance from a vet, and careful socialisation. Very young orphaned kittens need specialist feeding—never cow’s milk.';
  if (/hello|hi|hey|miso/.test(q)) return 'Mrow hello! Ask me about behaviour, feeding, grooming, breeds, kittens, litter boxes, or how to help a community cat.';
  return 'I can give general cat guidance, but I do not want to guess. Tell me the cat’s age, main sign or behaviour, how long it has been happening, and whether eating, drinking, breathing, and toileting are normal.';
}

function addChatMessage(text, who) {
  const message = document.createElement('div');
  message.className = `chat-message ${who}`;
  message.textContent = text;
  els.chatMessages.append(message);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function askMiso(question) {
  const clean = question.trim();
  if (!clean) return;
  addChatMessage(clean, 'user');
  window.setTimeout(() => addChatMessage(catExpertAnswer(clean), 'bot'), 260);
}

function openChat() {
  els.expertChat.classList.add('open');
  els.expertChat.setAttribute('aria-hidden', 'false');
  els.expertLauncher.setAttribute('aria-expanded', 'true');
  els.expertLauncher.hidden = true;
  window.setTimeout(() => els.chatInput.focus(), 180);
}

function closeChat() {
  els.expertChat.classList.remove('open');
  els.expertChat.setAttribute('aria-hidden', 'true');
  els.expertLauncher.hidden = false;
  els.expertLauncher.setAttribute('aria-expanded', 'false');
  els.expertLauncher.focus();
}

function registerWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  try {
    void Promise.resolve(context.registerTool({
      name: 'start_cat_capture', title: 'Start cat capture',
      description: 'Open the visible CATDEX capture flow so the user can choose a cat photo and review its breed estimate and broad Singapore region.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() { openCapture(); return { status: 'capture_opened' }; }
    }, { signal: lifecycle.signal })).catch(() => {});
    void Promise.resolve(context.registerTool({
      name: 'list_cat_sightings', title: 'List cat sightings',
      description: 'Read the cats currently visible in this device’s CATDEX collection without returning image bytes.',
      inputSchema: { type: 'object', properties: { region: { type: 'string', enum: REGIONS } }, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input = {}) {
        const rows = sightings.filter(cat => !input.region || cat.region === input.region).map(({id,nickname,breed,region,capturedAt}) => ({id,nickname,breed,region,capturedAt}));
        return { sightings: rows, count: rows.length };
      }
    }, { signal: lifecycle.signal })).catch(() => {});
  } catch { /* unsupported implementations should not affect the app */ }
}

document.querySelectorAll('[data-open-capture]').forEach(button => button.addEventListener('click', openCapture));
document.querySelector('[data-close-modal]').addEventListener('click', closeCapture);
document.querySelector('[data-close-detail]').addEventListener('click', () => els.detail.close());
els.modal.addEventListener('click', event => { if (event.target === els.modal) closeCapture(); });
els.detail.addEventListener('click', event => { if (event.target === els.detail) els.detail.close(); });
els.photo.addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  processImage(file).catch(() => {
    processedPhoto = '';
    els.stashButton.disabled = true;
    els.status.textContent = 'We could not read that image. Try another photo.';
  });
});
document.querySelector('#replacePhotoButton').addEventListener('click', () => {
  els.photo.value = '';
  els.photo.click();
});
els.form.addEventListener('submit', submitCapture);
els.search.addEventListener('input', renderCatalog);
els.regionFilter.addEventListener('change', renderCatalog);
els.sound.addEventListener('click', () => { soundOn = !soundOn; els.sound.textContent = soundOn ? 'SFX ON' : 'SFX OFF'; els.sound.setAttribute('aria-pressed', String(soundOn)); if (soundOn) playTone(500,.05); });
let factOffset = 0;
document.querySelector('#nextFactButton').addEventListener('click', () => showDailyFact(++factOffset));
els.expertLauncher.addEventListener('click', openChat);
document.querySelector('#closeChat').addEventListener('click', closeChat);
document.querySelector('#chatForm').addEventListener('submit', event => {
  event.preventDefault();
  askMiso(els.chatInput.value);
  els.chatInput.value = '';
});
document.querySelector('#chatSuggestions').addEventListener('click', event => {
  if (event.target.matches('button')) askMiso(event.target.textContent);
});

const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
}), { rootMargin: '-35% 0px -55%' });
sections.forEach(section => observer.observe(section));

populateSelects();
showDailyFact();
renderAll();
registerWebMCP();
