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
  }
};

const sampleSightings = [
  { id: 'sg-001', nickname: 'Kopi', breed: 'Domestic Shorthair', region: 'West', capturedAt: '2026-08-29T07:42:00+08:00', note: 'Sunny stairwell supervisor. Slow blink champion.', sprite: 0 },
  { id: 'sg-002', nickname: 'Nori', breed: 'Domestic Shorthair', region: 'Central', capturedAt: '2026-08-30T18:15:00+08:00', note: 'Tuxedo coat and a very serious little moustache.', sprite: 1 },
  { id: 'sg-003', nickname: 'Patches', breed: 'Domestic Shorthair', region: 'West', capturedAt: '2026-08-31T12:08:00+08:00', note: 'Calico coat. Watched the world from a safe distance.', sprite: 2 },
  { id: 'sg-004', nickname: 'Mochi', breed: 'American Shorthair', region: 'East', capturedAt: '2026-09-01T09:21:00+08:00', note: 'A calm silver tabby lookalike with bright green eyes.', sprite: 3 },
  { id: 'sg-005', nickname: 'Kaya', breed: 'Siamese', region: 'North', capturedAt: '2026-09-01T17:56:00+08:00', note: 'Blue-eyed and chatty. Breed is a visual estimate.', sprite: 4 },
  { id: 'sg-006', nickname: 'Charcoal', breed: 'Bombay', region: 'Central', capturedAt: '2026-09-02T06:33:00+08:00', note: 'Sleek black coat. Breed is a visual estimate.', sprite: 5 }
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
  return cat.photo
    ? `background-image:url(${JSON.stringify(cat.photo)});`
    : `background-position:${spritePosition(cat.sprite ?? 0)};`;
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
    const matchesText = `${cat.nickname} ${cat.breed}`.toLowerCase().includes(query);
    return matchesText && (region === 'all' || cat.region === region);
  });

  const cards = filtered.map((cat, index) => `
    <button class="cat-card" type="button" data-cat-id="${escapeHtml(cat.id)}" aria-label="View ${escapeHtml(cat.nickname || cat.breed)} details">
      <div class="cat-card-image ${cat.photo ? 'is-photo' : 'is-sprite'}" style="${imageStyle(cat)}">
        <span class="cat-number">#${String(sightings.indexOf(cat) + 1).padStart(3, '0')}</span>
        <span class="cat-region">${escapeHtml(cat.region.toUpperCase())}</span>
      </div>
      <div class="cat-card-body"><h3>${escapeHtml(cat.nickname || 'Unnamed cat')}</h3><p>${escapeHtml(cat.breed)}</p><p>STASHED ${formatDate(cat.capturedAt).toUpperCase()}</p></div>
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
      <div class="detail-image ${cat.photo ? 'photo' : ''}" style="${imageStyle(cat)}"></div>
      <div class="detail-copy">
        <p class="eyebrow">FIELD ENTRY // ${escapeHtml(cat.id.toUpperCase())}</p>
        <h2>${escapeHtml(cat.nickname || 'Unnamed cat')}</h2>
        <p class="breed-name">${escapeHtml(cat.breed)} <small>· visual estimate</small></p>
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
  els.form.reset();
  processedPhoto = '';
  suggestionConfidence = 0;
  els.uploadZone.hidden = false;
  els.canvasWrap.hidden = true;
  els.stashButton.disabled = true;
  els.breed.value = 'Domestic Shorthair';
  els.breedResult.textContent = 'Waiting for a photo';
  els.confidenceBadge.textContent = '—';
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

async function processImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    els.status.textContent = 'Please choose an image file.';
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    els.status.textContent = 'That photo is over 15 MB. Try a smaller image.';
    return;
  }
  els.status.textContent = 'Drawing your CATDEX cartoon…';
  const image = await createImageBitmap(file);
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
  const suggestion = suggestBreed(sourcePixels.data, work.width, work.height);
  cartoonise(workCtx, work.width, work.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(work, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#123b2a';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  processedPhoto = canvas.toDataURL('image/webp', .88);
  els.breed.value = suggestion.breed;
  suggestionConfidence = suggestion.confidence;
  els.breedResult.textContent = suggestion.breed;
  els.confidenceBadge.textContent = `${suggestion.confidence}%`;
  els.confidence.textContent = suggestion.reason;
  els.candidateList.innerHTML = suggestion.candidates.map(item => `<span>${escapeHtml(item.name)} · ${item.score}%</span>`).join('');
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

function suggestBreed(data, width, height) {
  let r = 0, g = 0, b = 0, count = 0, dark = 0, light = 0, warm = 0, grey = 0, colourful = 0;
  let centreDark = 0, centreCount = 0, edgeLight = 0, edgeCount = 0;
  for (let i = 0; i < data.length; i += 16) {
    const pixel = i / 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    const value = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const spread = Math.max(data[i], data[i+1], data[i+2]) - Math.min(data[i], data[i+1], data[i+2]);
    if (value < 72) dark++;
    if (value > 200) light++;
    if (data[i] > data[i + 2] * 1.28 && data[i] > data[i+1] * 1.05) warm++;
    if (spread < 22) grey++;
    if (spread > 70) colourful++;
    const inCentre = x > width*.25 && x < width*.75 && y > height*.18 && y < height*.72;
    if (inCentre) { centreCount++; if (value < 88) centreDark++; }
    else { edgeCount++; if (value > 175) edgeLight++; }
  }
  r /= count; g /= count; b /= count;
  let breed = 'Domestic Shorthair';
  let confidence = 76;
  let reason = 'Most non-pedigree and community cats are mixed-ancestry domestic cats, so CATDEX uses that safer match unless the photo shows a strong distinctive pattern.';
  let candidates = [{ name: 'Mixed ancestry', score: 71 }, { name: 'American Shorthair lookalike', score: 34 }];
  const ratios = { dark: dark/count, light: light/count, warm: warm/count, grey: grey/count, colourful: colourful/count, centreDark: centreDark/Math.max(1,centreCount), edgeLight: edgeLight/Math.max(1,edgeCount) };
  if (ratios.centreDark > .30 && ratios.edgeLight > .42 && ratios.light > .23) {
    breed = 'Siamese'; confidence = 68;
    reason = 'Colour-point contrast suggests a Siamese-type cat. This is an appearance estimate, not proof of pedigree.';
    candidates = [{ name: 'Domestic colourpoint', score: 64 }, { name: 'Ragdoll lookalike', score: 43 }];
  } else if (ratios.grey > .58 && ratios.dark > .10 && r < 165 && Math.abs(r-g) < 18) {
    confidence = 79;
    reason = 'The coat appears blue-grey, but that colour occurs commonly in mixed cats. Russian Blue is kept as a lower-ranked lookalike.';
    candidates = [{ name: 'Russian Blue lookalike', score: 48 }, { name: 'British Shorthair lookalike', score: 35 }];
  } else if (ratios.dark > .53) {
    confidence = 82;
    reason = 'The coat appears mostly black. Black colouring alone does not make a cat a Bombay, so CATDEX favours the common mixed type.';
    candidates = [{ name: 'Mixed ancestry', score: 77 }, { name: 'Bombay lookalike', score: 39 }];
  } else if (ratios.warm > .38 && ratios.colourful > .44) {
    confidence = 77;
    reason = 'A warm ginger, tortoiseshell, or tabby coat is visible. These are coat patterns rather than breeds, so the domestic type is the reliable estimate.';
    candidates = [{ name: 'Abyssinian lookalike', score: 35 }, { name: 'Bengal lookalike', score: 28 }];
  }
  return { breed, confidence, reason, candidates };
}

function submitCapture(event) {
  event.preventDefault();
  if (!processedPhoto) return;
  const now = new Date();
  const cat = {
    id: `sg-${Date.now().toString(36)}`,
    nickname: els.nickname.value.trim() || 'Mystery cat',
    breed: els.breed.value,
    region: els.region.value,
    capturedAt: now.toISOString(),
    note: els.note.value.trim(),
    photo: processedPhoto,
    confidence: suggestionConfidence,
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
  if (/slow blink|blink/.test(q)) return 'A slow blink usually means the cat feels calm and non-threatening. You can return it gently: soften your gaze, blink slowly, then look a little away.';
  if (/stray|community|feral|outside cat/.test(q)) return 'Approach slowly and let the cat choose distance. Offer water, observe from a safe spot, and contact a local community-cat caregiver or rescue if it is injured. Avoid sharing an exact location publicly.';
  if (/breed|pedigree|what type/.test(q)) return 'Looks can suggest a type, but they cannot prove pedigree. Most cats without papers are mixed-ancestry domestic shorthairs or longhairs. Calico, tabby, and tuxedo describe coat patterns, not breeds.';
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
els.photo.addEventListener('change', event => processImage(event.target.files[0]).catch(() => { els.status.textContent = 'We could not read that image. Try another photo.'; }));
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
