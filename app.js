const DB_KEY = 'council-db-v5';
const SECTORS = ['Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer'];
const MIN_REQUIRED_SECTIONS = 7;

const HUB_SLIDES = [
  {
    key: 'executive_summary',
    title: '1. Executive Summary',
    prompt: 'What is your overall recommendation and why?',
    helper: ['This is your quick pitch.', 'Imagine explaining your idea in 30 seconds.', 'Include BOTH positives and negatives.'],
    lookFor: ['Clear recommendation (Buy / Watch / Avoid).', '2–4 key points.', 'Balanced view (not just hype).', 'Should summarize everything that follows.'],
    shortcuts: ['None needed — this is YOUR synthesis.'],
    imageHint: 'Helpful visuals: company logo, mini stock chart, or one key stat image. Keep this slide light.',
    placeholder: 'Write 3–5 bullets.',
  },
  {
    key: 'company_overview',
    title: '2. Company Overview',
    prompt: 'Explain the company and how it operates.',
    helper: ['What does the company do?', 'How does it make money?', 'Who are its customers?', 'What makes it different?'],
    lookFor: ['Clear business model.', 'Revenue sources.', 'Competitive advantage (moat).', 'Key segments.', 'Basic management insight (optional for MVP).'],
    shortcuts: ['Company website → About', 'Yahoo Finance → Profile', 'Google: “how does [company] make money”'],
    imageHint: 'Helpful visuals: business model diagram, revenue breakdown chart, product/service image.',
    placeholder: 'Paragraph or bullet mix (4–8 sentences).',
  },
  {
    key: 'industry_overview',
    title: '3. Industry Overview',
    prompt: 'What industry does this company operate in and what is happening in it?',
    helper: ['How big is the industry?', 'Is it growing or shrinking?', 'What trends are shaping it?', 'Who are the competitors?'],
    lookFor: ['Industry size or importance.', 'Growth trends.', 'Major players.', 'Tailwinds (AI, healthcare, etc.).', 'Headwinds (regulation, slowdown).'],
    shortcuts: ['Google: “[industry] market size growth”', 'Google: “[company] competitors”', 'News on industry trends'],
    imageHint: 'Helpful visuals: industry growth chart, competitor map, trend graphic.',
    placeholder: 'Paragraph or bullets.',
  },
  {
    key: 'stock_analysis',
    title: '4. Stock Analysis (Metrics + Comparison)',
    prompt: 'What do the numbers tell you about this company?',
    helper: ['Look at key financial metrics.', 'Compare to competitors or market.', 'Identify what stands out.'],
    lookFor: ['P/E ratio.', 'Revenue growth.', 'Profit margins.', 'Comparison vs competitors.', 'Comparison vs S&P 500 (basic).'],
    shortcuts: ['Yahoo Finance → Key Statistics', 'Google: “[company] PE ratio”', 'Google: “[company] vs competitors”'],
    imageHint: 'Helpful visuals: stock price chart (must-have), metrics table, earnings/revenue trend graph.',
    placeholder: 'Short explanation + key stats.',
    extra: 'metrics',
  },
  {
    key: 'thesis',
    title: '5. Thesis (Core Section)',
    prompt: 'What is the unique opportunity here?',
    helper: ['What is NOT fully understood by the market?', 'Why is this stock mispriced?', 'What makes this special?'],
    lookFor: ['Specific, not generic.', '“Hidden value” or overlooked factor.', 'Clear reasoning.', 'Not just “good company”.'],
    shortcuts: ['Earnings reports (summary)', 'News about company strategy', 'Analyst opinions (optional)'],
    imageHint: 'Helpful visuals: one supporting chart, one key highlighted stat, optional mini idea diagram.',
    placeholder: '1–2 strong paragraphs.',
  },
  {
    key: 'catalysts',
    title: '6. Catalysts (Upside + Risks + Scenarios)',
    prompt: 'What events could drive this stock up or down?',
    helper: ['What could help this stock grow?', 'What could hurt it?', 'How likely are these outcomes?'],
    lookFor: ['Tailwinds: launches, expansion, growth.', 'Headwinds: competition, regulation, slowdown.', 'Scenario thinking: best/base/worst case.'],
    shortcuts: ['Google: “[company] outlook”', 'News: “[company] growth plans”', 'Google: “[company] risks”'],
    imageHint: 'Helpful visuals: catalyst timeline, scenario chart, upside-vs-risk visual split.',
    placeholder: 'Bullets split into Upside and Risks.',
  },
  {
    key: 'conclusion',
    title: '7. Conclusion',
    prompt: 'What is your final investment decision?',
    helper: ['Should someone buy this now?', 'Is this short-term or long-term?', 'How confident are you?'],
    lookFor: ['Clear recommendation.', 'Consistent with thesis.', 'Time horizon awareness.'],
    shortcuts: [],
    imageHint: 'Helpful visuals: simple price target view, risk/reward diagram, or final summary box.',
    placeholder: 'Final decision notes.',
    extra: 'conclusion',
  },
];

const signupScreen = document.querySelector('#signup-screen');
const modeScreen = document.querySelector('#mode-screen');
const cycleScreen = document.querySelector('#cycle-screen');
const pitchHub = document.querySelector('#pitch-hub');
const groupHub = document.querySelector('#group-hub');
const presentationView = document.querySelector('#presentation-view');

const signupForm = document.querySelector('#signup-form');
const individualBtn = document.querySelector('#individual-btn');
const clubBtn = document.querySelector('#club-btn');
const classBtn = document.querySelector('#class-btn');
const groupActions = document.querySelector('#group-actions');
const groupTitle = document.querySelector('#group-title');
const groupSpaceName = document.querySelector('#group-space-name');
const groupJoinCode = document.querySelector('#group-join-code');
const createGroupBtn = document.querySelector('#create-group-btn');
const joinGroupBtn = document.querySelector('#join-group-btn');

const cycleInfo = document.querySelector('#cycle-info');
const joinCycleBtn = document.querySelector('#join-cycle-btn');
const tickerStep = document.querySelector('#ticker-step');
const tickerInput = document.querySelector('#ticker-input');
const lockTickerBtn = document.querySelector('#lock-ticker-btn');

const lockModal = document.querySelector('#lock-modal');
const confirmLockBtn = document.querySelector('#confirm-lock-btn');
const cancelLockBtn = document.querySelector('#cancel-lock-btn');

const statusPill = document.querySelector('#status-pill');
const hubCycle = document.querySelector('#hub-cycle');
const hubSector = document.querySelector('#hub-sector');
const hubCountdown = document.querySelector('#hub-countdown');
const hubTicker = document.querySelector('#hub-ticker');
const hubCompany = document.querySelector('#hub-company');
const progressPercent = document.querySelector('#progress-percent');
const progressList = document.querySelector('#progress-list');
const submitPitchBtn = document.querySelector('#submit-pitch-btn');
const viewPresentationBtn = document.querySelector('#view-presentation-btn');
const submitNote = document.querySelector('#submit-note');
const deadlineText = document.querySelector('#deadline-text');

const prevSlideBtn = document.querySelector('#prev-slide-btn');
const nextSlideBtn = document.querySelector('#next-slide-btn');
const slidePosition = document.querySelector('#slide-position');
const slideTitle = document.querySelector('#slide-title');
const slidePrompt = document.querySelector('#slide-prompt');
const slideHelper = document.querySelector('#slide-helper');
const slideLookfor = document.querySelector('#slide-lookfor');
const toggleShortcutsBtn = document.querySelector('#toggle-shortcuts-btn');
const slideShortcuts = document.querySelector('#slide-shortcuts');
const slideShortcutsList = document.querySelector('#slide-shortcuts-list');
const slideInput = document.querySelector('#slide-input');
const slideExtraFields = document.querySelector('#slide-extra-fields');
const saveSlideBtn = document.querySelector('#save-slide-btn');
const slideImageUpload = document.querySelector('#slide-image-upload');
const slideImageHint = document.querySelector('#slide-image-hint');
const slideImagePreview = document.querySelector('#slide-image-preview');

const groupHubTitle = document.querySelector('#group-hub-title');
const groupHubSubtitle = document.querySelector('#group-hub-subtitle');
const groupHubCards = document.querySelector('#group-hub-cards');

const presentationSlides = document.querySelector('#presentation-slides');
const backToHubBtn = document.querySelector('#back-to-hub-btn');

let db = loadDb();
let currentUser = null;
let activeSession = null;
let activeGroupType = null;
let currentSlideIndex = 0;
let pendingSlideImages = null;

function loadDb() {
  const saved = localStorage.getItem(DB_KEY);
  if (!saved) return { users: [], sessions: [], spaces: [] };
  try {
    const parsed = JSON.parse(saved);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      spaces: Array.isArray(parsed.spaces) ? parsed.spaces : [],
    };
  } catch {
    return { users: [], sessions: [], spaces: [] };
  }
}

function saveDb() { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function makeId(prefix) { return `${prefix}_${Math.random().toString(36).slice(2, 10)}`; }
function generateJoinCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function currentCycleName() { return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }); }
function cycleDeadline() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); }
function daysUntilDeadline() { return Math.max(0, Math.ceil((cycleDeadline().getTime() - Date.now()) / 86400000)); }

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createUser({ fullName, email }) {
  const user = { id: makeId('user'), fullName, email, createdAt: new Date().toISOString() };
  db.users.push(user); saveDb(); return user;
}

function emptySlideResponses() {
  return Object.fromEntries(HUB_SLIDES.map((slide) => [slide.key, { input: '', extras: {}, images: [] }]));
}

function getOrCreateSession(userId) {
  const cycleName = currentCycleName();
  let session = db.sessions.find((item) => item.userId === userId && item.cycleName === cycleName);
  if (!session) {
    session = {
      id: makeId('session'), userId, cycleName,
      sector: SECTORS[Math.floor(Math.random() * SECTORS.length)],
      joinedCycle: false, joinedAt: null, ticker: '', tickerLocked: false,
      slideResponses: emptySlideResponses(),
      submittedAt: null, createdAt: new Date().toISOString(),
    };
    db.sessions.push(session); saveDb();
  }
  if (!session.slideResponses) session.slideResponses = emptySlideResponses();
  HUB_SLIDES.forEach((slide) => {
    if (!session.slideResponses[slide.key]) session.slideResponses[slide.key] = { input: '', extras: {}, images: [] };
    if (!Array.isArray(session.slideResponses[slide.key].images)) session.slideResponses[slide.key].images = [];
  });
  saveDb();
  return session;
}

function createGroupSpace(type, name, ownerId) {
  const role = type === 'club' ? 'leader' : 'teacher';
  const space = { id: makeId('space'), type, name, joinCode: generateJoinCode(), ownerId, members: [{ userId: ownerId, role }], createdAt: new Date().toISOString() };
  db.spaces.push(space); saveDb(); return { space, role };
}

function joinGroupSpace(type, code, userId) {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6,8}$/.test(normalized)) return { error: 'invalid' };
  const space = db.spaces.find((candidate) => candidate.joinCode === normalized);
  if (!space) return { error: 'not_found' };
  if (space.type !== type) return { error: 'wrong_type' };
  const existing = space.members.find((member) => member.userId === userId);
  if (existing) return { space, role: existing.role };
  const role = type === 'club' ? 'member' : 'student';
  space.members.push({ userId, role }); saveDb(); return { space, role };
}

function hideAllMainScreens() {
  modeScreen.classList.add('hidden');
  cycleScreen.classList.add('hidden');
  pitchHub.classList.add('hidden');
  groupHub.classList.add('hidden');
  presentationView.classList.add('hidden');
}

function renderCycleStep() {
  cycleInfo.textContent = `${activeSession.cycleName} • Assigned sector: ${activeSession.sector}`;
  joinCycleBtn.disabled = activeSession.joinedCycle;
  joinCycleBtn.textContent = activeSession.joinedCycle ? 'Joined (locked)' : 'Join this cycle';
  tickerStep.classList.toggle('hidden', !activeSession.joinedCycle);
  tickerInput.value = activeSession.ticker;
  tickerInput.disabled = activeSession.tickerLocked;
  lockTickerBtn.disabled = activeSession.tickerLocked;
  lockTickerBtn.textContent = activeSession.tickerLocked ? 'Ticker locked' : 'Lock in ticker';
}

function statusForSession(session) {
  if (session.submittedAt) return 'Submitted';
  const completed = HUB_SLIDES.filter((slide) => session.slideResponses[slide.key]?.input?.trim()).length;
  return completed > 0 ? 'In progress' : 'Not started';
}

function renderImagePreview(images) {
  slideImagePreview.innerHTML = images.map((src) => `<img src="${src}" alt="Uploaded visual" class="preview-image" />`).join('');
}

function readFilesAsDataUrls(files) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Unable to read image.'));
          reader.readAsDataURL(file);
        }),
    ),
  );
}

function renderSlide() {
  const slide = HUB_SLIDES[currentSlideIndex];
  const response = activeSession.slideResponses[slide.key] || { input: '', extras: {}, images: [] };

  slidePosition.textContent = `Section ${currentSlideIndex + 1} of ${HUB_SLIDES.length}`;
  slideTitle.textContent = slide.title;
  slidePrompt.textContent = `Prompt: ${slide.prompt}`;
  slideHelper.innerHTML = slide.helper.map((item) => `<li>${item}</li>`).join('');
  slideLookfor.innerHTML = slide.lookFor.map((item) => `<li>${item}</li>`).join('');
  slideImageHint.textContent = `Visual hint: ${slide.imageHint}`;

  slideShortcutsList.innerHTML = slide.shortcuts.length
    ? slide.shortcuts.map((item) => `<li>${item}</li>`).join('')
    : '<li>No shortcuts for this section.</li>';

  slideInput.placeholder = slide.placeholder;
  slideInput.value = response.input || '';
  slideImageUpload.value = '';
  pendingSlideImages = null;
  renderImagePreview(response.images || []);

  slideExtraFields.classList.add('hidden');
  slideExtraFields.innerHTML = '';

  if (slide.extra === 'metrics') {
    const metrics = response.extras.metrics || ['', '', ''];
    slideExtraFields.classList.remove('hidden');
    slideExtraFields.innerHTML = `
      <h4>Optional: Add 2–3 metrics</h4>
      <div class="mode-options">
        <input data-metric-index="0" placeholder="Metric 1 (e.g., P/E: 24.3)" value="${escapeHtml(metrics[0] || '')}" />
        <input data-metric-index="1" placeholder="Metric 2" value="${escapeHtml(metrics[1] || '')}" />
        <input data-metric-index="2" placeholder="Metric 3" value="${escapeHtml(metrics[2] || '')}" />
      </div>
    `;
  }

  if (slide.extra === 'conclusion') {
    const rec = response.extras.recommendation || 'Watch';
    const horizon = response.extras.horizon || 'medium';
    const confidence = response.extras.confidence || '5';
    slideExtraFields.classList.remove('hidden');
    slideExtraFields.innerHTML = `
      <h4>Decision details</h4>
      <div class="mode-options">
        <label>Recommendation
          <select id="conclusion-rec">
            <option ${rec === 'Buy' ? 'selected' : ''}>Buy</option>
            <option ${rec === 'Watch' ? 'selected' : ''}>Watch</option>
            <option ${rec === 'Avoid' ? 'selected' : ''}>Avoid</option>
          </select>
        </label>
        <label>Time horizon
          <select id="conclusion-horizon">
            <option value="short" ${horizon === 'short' ? 'selected' : ''}>Short</option>
            <option value="medium" ${horizon === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="long" ${horizon === 'long' ? 'selected' : ''}>Long</option>
          </select>
        </label>
        <label>Confidence (1–10)
          <input id="conclusion-confidence" type="number" min="1" max="10" value="${escapeHtml(confidence)}" />
        </label>
      </div>
    `;
  }

  prevSlideBtn.disabled = currentSlideIndex === 0;
  nextSlideBtn.disabled = currentSlideIndex === HUB_SLIDES.length - 1;
}

function renderProgress() {
  const completed = HUB_SLIDES.filter((slide) => activeSession.slideResponses[slide.key]?.input?.trim()).length;
  const percent = Math.round((completed / HUB_SLIDES.length) * 100);
  progressPercent.textContent = `${percent}% complete`;
  progressList.innerHTML = HUB_SLIDES.map((slide) => {
    const done = Boolean(activeSession.slideResponses[slide.key]?.input?.trim());
    return `<li>${done ? '✅' : '⬜'} ${slide.title}</li>`;
  }).join('');

  const canSubmit = completed >= MIN_REQUIRED_SECTIONS && !activeSession.submittedAt;
  submitPitchBtn.disabled = !canSubmit;
  viewPresentationBtn.classList.toggle('hidden', !activeSession.submittedAt);
  submitNote.textContent = activeSession.submittedAt
    ? 'Pitch submitted. Everything is now locked. You can now view your completed presentation.'
    : canSubmit
      ? 'Ready to submit your pitch.'
      : `Complete all ${MIN_REQUIRED_SECTIONS} sections to submit.`;
}

function renderPitchHub() {
  hideAllMainScreens();
  pitchHub.classList.remove('hidden');
  statusPill.textContent = statusForSession(activeSession);
  hubCycle.textContent = `Cycle: ${activeSession.cycleName}`;
  hubSector.textContent = `Sector: ${activeSession.sector}`;
  hubCountdown.textContent = `${daysUntilDeadline()} day(s) left in cycle`;
  hubTicker.textContent = `Ticker: ${activeSession.ticker}`;
  hubCompany.textContent = `Company: ${activeSession.ticker} (name lookup coming soon)`;
  deadlineText.textContent = `${daysUntilDeadline()} days left to submit.`;
  renderProgress();
  renderSlide();
}

function renderPresentationDeck() {
  const responses = activeSession.slideResponses;

  const imageHtml = (images) =>
    images?.length
      ? `<div class="presentation-images">${images.map((src) => `<img src="${src}" alt="Slide visual"/>`).join('')}</div>`
      : '';

  const slide1 = responses.executive_summary || {};
  const bullets = (slide1.input || '').split('\n').filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`).join('');

  const slide2 = responses.company_overview || {};
  const slide3 = responses.industry_overview || {};
  const slide4 = responses.stock_analysis || {};
  const slide5 = responses.thesis || {};
  const slide6 = responses.catalysts || {};
  const slide7 = responses.conclusion || {};

  const metrics = (slide4.extras?.metrics || []).filter(Boolean).map((m) => `<li>${escapeHtml(m)}</li>`).join('');

  presentationSlides.innerHTML = `
    <article class="presentation-slide">
      <h3>Slide 1 — Executive Summary</h3>
      <p class="recommendation-text">${escapeHtml(slide7.extras?.recommendation || 'Watch')}</p>
      <ul>${bullets || `<li>${escapeHtml(slide1.input || '')}</li>`}</ul>
      ${imageHtml(slide1.images)}
    </article>

    <article class="presentation-slide two-col">
      <h3>Slide 2 — Company Overview</h3>
      <div>
        <p>${escapeHtml(slide2.input || '')}</p>
      </div>
      <div>
        <p><strong>What they do</strong></p>
        <p><strong>Revenue model</strong></p>
        <p><strong>Key segments</strong></p>
      </div>
      ${imageHtml(slide2.images)}
    </article>

    <article class="presentation-slide">
      <h3>Slide 3 — Industry Overview</h3>
      <p>${escapeHtml(slide3.input || '')}</p>
      ${imageHtml(slide3.images)}
    </article>

    <article class="presentation-slide">
      <h3>Slide 4 — Stock Analysis</h3>
      <p>${escapeHtml(slide4.input || '')}</p>
      ${metrics ? `<ul>${metrics}</ul>` : ''}
      ${imageHtml(slide4.images)}
    </article>

    <article class="presentation-slide thesis-slide">
      <h3>Slide 5 — Thesis</h3>
      <p>${escapeHtml(slide5.input || '')}</p>
      ${imageHtml(slide5.images)}
    </article>

    <article class="presentation-slide catalyst-split">
      <h3>Slide 6 — Catalysts</h3>
      <div class="split upside"><h4>Upside</h4><p>${escapeHtml(slide6.input || '')}</p></div>
      <div class="split risks"><h4>Risks</h4><p>${escapeHtml(slide6.input || '')}</p></div>
      ${imageHtml(slide6.images)}
    </article>

    <article class="presentation-slide">
      <h3>Slide 7 — Conclusion</h3>
      <p><strong>Recommendation:</strong> ${escapeHtml(slide7.extras?.recommendation || 'Watch')}</p>
      <p><strong>Confidence:</strong> ${escapeHtml(slide7.extras?.confidence || '5')} / 10</p>
      <p><strong>Time horizon:</strong> ${escapeHtml(slide7.extras?.horizon || 'medium')}</p>
      <p>${escapeHtml(slide7.input || '')}</p>
      ${imageHtml(slide7.images)}
    </article>
  `;
}

function renderGroupHub(space, role) {
  hideAllMainScreens();
  groupHub.classList.remove('hidden');
  groupHubTitle.textContent = `${space.type === 'club' ? 'Club' : 'Class'} dashboard`;
  groupHubSubtitle.textContent = `${space.name} • Role: ${role} • Join code: ${space.joinCode}`;
  const memberList = space.members.map((member) => `<li>${member.role}</li>`).join('');

  groupHubCards.innerHTML = space.type === 'club'
    ? `<article class="dash-card"><h3>Club name</h3><p>${space.name}</p></article>
      <article class="dash-card"><h3>Members</h3><ul>${memberList}</ul></article>
      <article class="dash-card"><h3>Cycle section</h3><p>Club cycle placeholder</p></article>
      <article class="dash-card"><h3>Leaderboard</h3><p>Leaderboard placeholder</p></article>
      <article class="dash-card"><h3>Admin controls</h3><p>${role === 'leader' ? 'Manage club settings enabled.' : 'View-only member.'}</p></article>`
    : `<article class="dash-card"><h3>Class name</h3><p>${space.name}</p></article>
      <article class="dash-card"><h3>Assignments</h3><p>Assignments placeholder</p></article>
      <article class="dash-card"><h3>Student roster</h3><ul>${memberList}</ul></article>
      <article class="dash-card"><h3>Due dates</h3><p>Due dates placeholder</p></article>
      <article class="dash-card"><h3>Teacher controls</h3><p>${role === 'teacher' ? 'Grading enabled.' : 'Student view only.'}</p></article>`;
}

signupForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  currentUser = createUser({
    fullName: String(formData.get('fullName') || '').trim(),
    email: String(formData.get('email') || '').trim(),
  });
  signupScreen.classList.add('hidden');
  modeScreen.classList.remove('hidden');
});

individualBtn?.addEventListener('click', () => {
  if (!currentUser?.id) return;
  activeSession = getOrCreateSession(currentUser.id);
  currentSlideIndex = 0;
  hideAllMainScreens();
  cycleScreen.classList.remove('hidden');
  groupActions.classList.add('hidden');
  renderCycleStep();
  if (activeSession.tickerLocked) renderPitchHub();
});

function setGroupMode(type) {
  activeGroupType = type;
  groupActions.classList.remove('hidden');
  groupTitle.textContent = type === 'club' ? 'Club space' : 'Class space';
  createGroupBtn.textContent = type === 'club' ? 'Create club' : 'Create class';
}

clubBtn?.addEventListener('click', () => setGroupMode('club'));
classBtn?.addEventListener('click', () => setGroupMode('class'));

joinCycleBtn?.addEventListener('click', () => {
  if (!activeSession || activeSession.joinedCycle) return;
  activeSession.joinedCycle = true;
  activeSession.joinedAt = new Date().toISOString();
  saveDb();
  renderCycleStep();
});

lockTickerBtn?.addEventListener('click', () => {
  if (!activeSession?.joinedCycle || activeSession.tickerLocked) return;
  const ticker = tickerInput.value.trim().toUpperCase();
  if (!/^[A-Z]{1,8}$/.test(ticker)) {
    tickerInput.setCustomValidity('Enter a valid stock ticker (letters only, max 8).');
    tickerInput.reportValidity();
    return;
  }
  tickerInput.setCustomValidity('');
  activeSession.ticker = ticker;
  lockModal.classList.remove('hidden');
});

confirmLockBtn?.addEventListener('click', () => {
  if (!activeSession?.ticker) return;
  activeSession.tickerLocked = true;
  saveDb();
  lockModal.classList.add('hidden');
  renderPitchHub();
});
cancelLockBtn?.addEventListener('click', () => lockModal.classList.add('hidden'));

prevSlideBtn?.addEventListener('click', () => {
  if (currentSlideIndex > 0) {
    currentSlideIndex -= 1;
    renderSlide();
  }
});

nextSlideBtn?.addEventListener('click', () => {
  if (currentSlideIndex < HUB_SLIDES.length - 1) {
    currentSlideIndex += 1;
    renderSlide();
  }
});

toggleShortcutsBtn?.addEventListener('click', () => {
  slideShortcuts.classList.toggle('hidden');
  toggleShortcutsBtn.textContent = slideShortcuts.classList.contains('hidden')
    ? 'Show research shortcuts'
    : 'Hide research shortcuts';
});

slideImageUpload?.addEventListener('change', async () => {
  if (!slideImageUpload.files?.length) {
    pendingSlideImages = null;
    return;
  }

  const files = [...slideImageUpload.files];
  if (files.length > 3) {
    slideImageUpload.setCustomValidity('Please upload between 1 and 3 images.');
    slideImageUpload.reportValidity();
    return;
  }

  slideImageUpload.setCustomValidity('');
  pendingSlideImages = await readFilesAsDataUrls(files);
  renderImagePreview(pendingSlideImages);
});

saveSlideBtn?.addEventListener('click', () => {
  if (!activeSession || activeSession.submittedAt) return;
  const slide = HUB_SLIDES[currentSlideIndex];
  const response = activeSession.slideResponses[slide.key] || { input: '', extras: {}, images: [] };

  response.input = slideInput.value.trim();
  if (pendingSlideImages?.length) {
    response.images = pendingSlideImages.slice(0, 3);
  }

  if (slide.extra === 'metrics') {
    const metricInputs = [...slideExtraFields.querySelectorAll('[data-metric-index]')].map((input) => input.value.trim());
    response.extras.metrics = metricInputs;
  }

  if (slide.extra === 'conclusion') {
    response.extras.recommendation = slideExtraFields.querySelector('#conclusion-rec')?.value || 'Watch';
    response.extras.horizon = slideExtraFields.querySelector('#conclusion-horizon')?.value || 'medium';
    response.extras.confidence = slideExtraFields.querySelector('#conclusion-confidence')?.value || '5';
  }

  activeSession.slideResponses[slide.key] = response;
  pendingSlideImages = null;
  saveDb();
  renderPitchHub();
});

submitPitchBtn?.addEventListener('click', () => {
  if (!activeSession || activeSession.submittedAt) return;
  const completed = HUB_SLIDES.filter((slide) => activeSession.slideResponses[slide.key]?.input?.trim()).length;
  if (completed < MIN_REQUIRED_SECTIONS) return;
  activeSession.submittedAt = new Date().toISOString();
  saveDb();
  renderPitchHub();
});

viewPresentationBtn?.addEventListener('click', () => {
  if (!activeSession?.submittedAt) return;
  hideAllMainScreens();
  presentationView.classList.remove('hidden');
  renderPresentationDeck();
});

backToHubBtn?.addEventListener('click', () => {
  renderPitchHub();
});

groupActions?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activeGroupType || !currentUser?.id || !groupSpaceName.value.trim()) return;
  const { space, role } = createGroupSpace(activeGroupType, groupSpaceName.value.trim(), currentUser.id);
  renderGroupHub(space, role);
});

joinGroupBtn?.addEventListener('click', () => {
  if (!activeGroupType || !currentUser?.id || !groupJoinCode.value.trim()) return;
  const result = joinGroupSpace(activeGroupType, groupJoinCode.value, currentUser.id);
  if (result.error) {
    const errors = { invalid: 'Enter a valid join code.', not_found: 'No matching space found.', wrong_type: 'This code belongs to a different space type.' };
    groupJoinCode.setCustomValidity(errors[result.error]);
    groupJoinCode.reportValidity();
    return;
  }
  groupJoinCode.setCustomValidity('');
  renderGroupHub(result.space, result.role);
});
