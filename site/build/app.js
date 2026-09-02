const TOTAL_BREEDS = 73;
const STORAGE_KEY = 'catdex.sightings.v1';
const REGIONS = ['Central', 'East', 'North', 'North-East', 'West', 'Southern Islands'];

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
  els.confidence.textContent = 'Add a photo to get a visual suggestion.';
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
  els.status.textContent = 'Pixelising photo…';
  const image = await createImageBitmap(file);
  const canvas = els.canvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const side = Math.min(image.width, image.height);
  const sx = (image.width - side) / 2;
  const sy = (image.height - side) / 2;
  const mini = document.createElement('canvas');
  mini.width = 40; mini.height = 40;
  const miniCtx = mini.getContext('2d', { willReadFrequently: true });
  miniCtx.drawImage(image, sx, sy, side, side, 0, 0, 40, 40);
  quantize(miniCtx, 40, 40);
  ctx.clearRect(0, 0, 320, 320);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(mini, 0, 0, 320, 320);
  processedPhoto = canvas.toDataURL('image/webp', .76);
  const suggestion = suggestBreed(miniCtx.getImageData(0, 0, 40, 40).data);
  els.breed.value = suggestion.breed;
  suggestionConfidence = suggestion.confidence;
  els.confidence.textContent = `${suggestion.confidence}% visual match · please review before stashing.`;
  els.uploadZone.hidden = true;
  els.canvasWrap.hidden = false;
  els.stashButton.disabled = false;
  els.status.textContent = 'Pixel portrait ready.';
  playTone(720, .08);
  image.close?.();
}

function quantize(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / 32) * 32;
    data[i + 1] = Math.round(data[i + 1] / 32) * 32;
    data[i + 2] = Math.round(data[i + 2] / 32) * 32;
  }
  ctx.putImageData(imageData, 0, 0);
}

function suggestBreed(data) {
  let r = 0, g = 0, b = 0, count = 0, dark = 0, light = 0, warm = 0;
  for (let i = 0; i < data.length; i += 16) {
    r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    const value = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (value < 70) dark++; if (value > 205) light++; if (data[i] > data[i + 2] * 1.28) warm++;
  }
  r /= count; g /= count; b /= count;
  let breed = 'Domestic Shorthair';
  if (dark / count > .48) breed = 'Bombay';
  else if (light / count > .55 && b > r * .9) breed = 'Turkish Angora';
  else if (b > r * 1.05 && Math.abs(g - b) < 30) breed = 'Russian Blue';
  else if (warm / count > .55 && r > 125) breed = 'Abyssinian';
  else if (Math.max(r,g,b) - Math.min(r,g,b) < 24 && r < 155) breed = 'American Shorthair';
  const confidence = 61 + Math.abs(Math.round((r - b) / 14)) % 17;
  return { breed, confidence };
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
  els.breed.innerHTML = Object.keys(BREEDS).sort().map(name => `<option>${escapeHtml(name)}</option>`).join('');
  els.region.innerHTML = REGIONS.map(region => `<option>${escapeHtml(region)}</option>`).join('');
  els.regionFilter.insertAdjacentHTML('beforeend', REGIONS.map(region => `<option>${escapeHtml(region)}</option>`).join(''));
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

const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
}), { rootMargin: '-35% 0px -55%' });
sections.forEach(section => observer.observe(section));

populateSelects();
renderAll();
registerWebMCP();
