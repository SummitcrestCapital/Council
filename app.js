const SECTORS = ['Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer'];
const MIN_REQUIRED_SECTIONS = 7;
const SUPABASE_URL = 'https://seyhhqobsefkzmekwqjj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9vlBuHDWJJdBJ9NuDlTWmg_4X2mDwIY';
const DEFAULT_INDIVIDUAL_SPACE_SLUG = 'individual';

const HUB_SLIDES = [
  { key: 'executive_summary', title: '1. Executive Summary', prompt: 'What is your overall recommendation and why?', helper: ['This is your quick pitch.', 'Imagine explaining your idea in 30 seconds.', 'Include BOTH positives and negatives.'], lookFor: ['Clear recommendation (Buy / Watch / Avoid).', '2-4 key points.', 'Balanced view (not just hype).', 'Should summarize everything that follows.'], shortcuts: ['None needed - this is YOUR synthesis.'], imageHint: 'Helpful visuals: company logo, mini stock chart, or one key stat image. Keep this slide light.', placeholder: 'Write 3-5 bullets.' },
  { key: 'company_overview', title: '2. Company Overview', prompt: 'Explain the company and how it operates.', helper: ['What does the company do?', 'How does it make money?', 'Who are its customers?', 'What makes it different?'], lookFor: ['Clear business model.', 'Revenue sources.', 'Competitive advantage (moat).', 'Key segments.', 'Basic management insight (optional for MVP).'], shortcuts: ['Company website - About', 'Yahoo Finance - Profile', 'Google: "how does [company] make money"'], imageHint: 'Helpful visuals: business model diagram, revenue breakdown chart, product/service image.', placeholder: 'Paragraph or bullet mix (4-8 sentences).' },
  { key: 'industry_overview', title: '3. Industry Overview', prompt: 'What industry does this company operate in and what is happening in it?', helper: ['How big is the industry?', 'Is it growing or shrinking?', 'What trends are shaping it?', 'Who are the competitors?'], lookFor: ['Industry size or importance.', 'Growth trends.', 'Major players.', 'Tailwinds (AI, healthcare, etc.).', 'Headwinds (regulation, slowdown).'], shortcuts: ['Google: "[industry] market size growth"', 'Google: "[company] competitors"', 'News on industry trends'], imageHint: 'Helpful visuals: industry growth chart, competitor map, trend graphic.', placeholder: 'Paragraph or bullets.' },
  { key: 'stock_analysis', title: '4. Stock Analysis (Metrics + Comparison)', prompt: 'What do the numbers tell you about this company?', helper: ['Look at key financial metrics.', 'Compare to competitors or market.', 'Identify what stands out.'], lookFor: ['P/E ratio.', 'Revenue growth.', 'Profit margins.', 'Comparison vs competitors.', 'Comparison vs S&P 500 (basic).'], shortcuts: ['Yahoo Finance - Key Statistics', 'Google: "[company] PE ratio"', 'Google: "[company] vs competitors"'], imageHint: 'Helpful visuals: stock price chart (must-have), metrics table, earnings/revenue trend graph.', placeholder: 'Short explanation + key stats.', extra: 'metrics' },
  { key: 'thesis', title: '5. Thesis (Core Section)', prompt: 'What is the unique opportunity here?', helper: ['What is NOT fully understood by the market?', 'Why is this stock mispriced?', 'What makes this special?'], lookFor: ['Specific, not generic.', 'Hidden value or overlooked factor.', 'Clear reasoning.', 'Not just "good company".'], shortcuts: ['Earnings reports (summary)', 'News about company strategy', 'Analyst opinions (optional)'], imageHint: 'Helpful visuals: one supporting chart, one key highlighted stat, optional mini idea diagram.', placeholder: '1-2 strong paragraphs.' },
  { key: 'catalysts', title: '6. Catalysts (Upside + Risks + Scenarios)', prompt: 'What events could drive this stock up or down?', helper: ['What could help this stock grow?', 'What could hurt it?', 'How likely are these outcomes?'], lookFor: ['Tailwinds: launches, expansion, growth.', 'Headwinds: competition, regulation, slowdown.', 'Scenario thinking: best/base/worst case.'], shortcuts: ['Google: "[company] outlook"', 'News: "[company] growth plans"', 'Google: "[company] risks"'], imageHint: 'Helpful visuals: catalyst timeline, scenario chart, upside-vs-risk visual split.', placeholder: 'Bullets split into Upside and Risks.' },
  { key: 'conclusion', title: '7. Conclusion', prompt: 'What is your final investment decision?', helper: ['Should someone buy this now?', 'Is this short-term or long-term?', 'How confident are you?'], lookFor: ['Clear recommendation.', 'Consistent with thesis.', 'Time horizon awareness.'], shortcuts: [], imageHint: 'Helpful visuals: simple price target view, risk/reward diagram, or final summary box.', placeholder: 'Final decision notes.', extra: 'conclusion' },
];

const signupScreen = document.querySelector('#signup-screen');
const signupTitle = document.querySelector('#signup-title');
const modeScreen = document.querySelector('#mode-screen');
const cycleScreen = document.querySelector('#cycle-screen');
const pitchHub = document.querySelector('#pitch-hub');
const groupHub = document.querySelector('#group-hub');
const presentationView = document.querySelector('#presentation-view');
const clubRoleScreen = document.querySelector('#club-role-screen');
const clubDashboard = document.querySelector('#club-dashboard');
const signupForm = document.querySelector('#signup-form');
const authModeLabel = document.querySelector('#auth-mode-label');
const authSubmitBtn = document.querySelector('#auth-submit-btn');
const authSwitchBtn = document.querySelector('#auth-switch-btn');
const individualBtn = document.querySelector('#individual-btn');
const clubBtn = document.querySelector('#club-btn');
const classBtn = document.querySelector('#class-btn');
const groupActions = document.querySelector('#group-actions');
const groupTitle = document.querySelector('#group-title');
const groupSpaceName = document.querySelector('#group-space-name');
const groupDescription = document.querySelector('#group-description');
const groupJoinCode = document.querySelector('#group-join-code');
const joinGroupBtn = document.querySelector('#join-group-btn');
const pickPmBtn = document.querySelector('#pick-pm-btn');
const pickAnalystBtn = document.querySelector('#pick-analyst-btn');
const clubName = document.querySelector('#club-name');
const clubRoleLine = document.querySelector('#club-role-line');
const clubMembers = document.querySelector('#club-members');
const clubCycle = document.querySelector('#club-cycle');
const clubPitches = document.querySelector('#club-pitches');
const executiveControls = document.querySelector('#executive-controls');
const clubGroupName = document.querySelector('#club-group-name');
const clubGroupSector = document.querySelector('#club-group-sector');
const clubGroupMembers = document.querySelector('#club-group-members');
const createClubGroupBtn = document.querySelector('#create-club-group-btn');
const clubGroupsList = document.querySelector('#club-groups-list');
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
const presentationPrevBtn = document.querySelector('#presentation-prev-btn');
const presentationNextBtn = document.querySelector('#presentation-next-btn');
const presentationPosition = document.querySelector('#presentation-position');

const supabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
  : null;

let db = { users: [], sessions: [], spaces: [] };
let currentUser = null;
let activeSession = null;
let currentSlideIndex = 0;
let pendingSlideImages = null;
let activeClub = null;
let pendingClub = null;
let currentContext = 'individual';
let presentationSlidesHtml = [];
let presentationIndex = 0;
let authMode = 'signup';

const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const saveDb = () => {};
const generateJoinCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const currentCycleName = () => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
const cycleDeadline = () => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); };
const daysUntilDeadline = () => Math.max(0, Math.ceil((cycleDeadline().getTime() - Date.now()) / 86400000));

function escapeHtml(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function emptySlideResponses() { return Object.fromEntries(HUB_SLIDES.map((s) => [s.key, { input: '', extras: {}, images: [] }])); }

// ─── Supabase DB functions aligned to actual schema ───────────────────────────

async function ensureProfileFromAuth(authUser, fullName) {
  // profiles: id, username, full_name, onboarding_complete, created_at
  const payload = { id: authUser.id };
  if (fullName) payload.full_name = fullName;
  const { data, error } = await supabaseClient.from('profiles').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return data;
}

async function getOrCreateIndividualSpace() {
  // spaces: id, type, name, owner_id, join_code, created_at, slug
  let { data: space, error } = await supabaseClient.from('spaces').select('*').eq('slug', DEFAULT_INDIVIDUAL_SPACE_SLUG).maybeSingle();
  if (error) throw error;
  if (space) return space;
  const { data: created, error: ie } = await supabaseClient
    .from('spaces')
    .insert({ type: 'individual', name: 'Individual', slug: DEFAULT_INDIVIDUAL_SPACE_SLUG })
    .select('*').single();
  if (ie) throw ie;
  return created;
}

async function getCurrentCycle(spaceId) {
  // cycles: id, space_id, title, sector, start_date, deadline_at, status, created_at, name
  const cycleName = currentCycleName();
  const { data, error } = await supabaseClient.from('cycles').select('*')
    .eq('name', cycleName).eq('space_id', spaceId).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: ie } = await supabaseClient.from('cycles')
    .insert({
      name: cycleName,
      title: cycleName,
      space_id: spaceId,
      deadline_at: cycleDeadline().toISOString(),
      start_date: new Date().toISOString(),
      status: 'active',
      sector: SECTORS[Math.floor(Math.random() * SECTORS.length)],
    })
    .select('*').single();
  if (ie) throw ie;
  return created;
}

async function ensureMembership(userId, spaceId) {
  // memberships: id, user_id, space_id, role, created_at
  const { data: existing, error } = await supabaseClient.from('memberships').select('*')
    .eq('user_id', userId).eq('space_id', spaceId).maybeSingle();
  if (error) throw error;
  if (existing) return existing;
  const { data: created, error: ie } = await supabaseClient.from('memberships')
    .insert({ user_id: userId, space_id: spaceId, role: 'member' })
    .select('*').single();
  if (ie) throw ie;
  return created;
}

function normalizeParticipantRecord(participant) {
  // cycle_participants: id, cycle_id, user_id, ticker, company_name, ticker_locked,
  // submission_status, last_opened_section, joined_at, updated_at
  return {
    id: participant.id,
    userId: participant.user_id,
    cycleId: participant.cycle_id,
    cycleName: participant.cycles?.name || currentCycleName(),
    sector: participant.cycles?.sector || SECTORS[0],
    joinedCycle: Boolean(participant.joined_at),
    joinedAt: participant.joined_at || null,
    ticker: participant.ticker || '',
    companyName: participant.company_name || '',
    tickerLocked: Boolean(participant.ticker_locked),
    submittedAt: participant.submission_status === 'submitted' ? (participant.updated_at || new Date().toISOString()) : null,
    status: participant.submission_status || 'in_progress',
    slideResponses: emptySlideResponses(),
    createdAt: participant.updated_at || new Date().toISOString(),
  };
}

async function loadPitchSectionsForParticipant(participantId) {
  // pitch_sections: id, cycle_participant_id, section_key, content, is_complete, updated_at
  // We JSON-encode the full response object into the content column
  const { data, error } = await supabaseClient.from('pitch_sections').select('*').eq('cycle_participant_id', participantId);
  if (error) throw error;
  const responses = emptySlideResponses();
  (data || []).forEach((section) => {
    try {
      const decoded = JSON.parse(section.content || '');
      if (decoded && typeof decoded === 'object' && 'input' in decoded) {
        responses[section.section_key] = decoded;
        return;
      }
    } catch (_) {}
    responses[section.section_key] = { input: section.content || '', extras: {}, images: [] };
  });
  return responses;
}

async function savePitchSection(participantId, sectionKey, response) {
  // Encode full response as JSON in the content column since there are no extras/images columns
  const payload = {
    cycle_participant_id: participantId,
    section_key: sectionKey,
    content: JSON.stringify({ input: response.input || '', extras: response.extras || {}, images: response.images || [] }),
    is_complete: Boolean((response.input || '').trim()),
  };
  const { error } = await supabaseClient.from('pitch_sections').upsert(payload, { onConflict: 'cycle_participant_id,section_key' });
  if (error) throw error;
}

async function getOrCreateCycleParticipant({ userId, cycleId }) {
  // cycle_participants has no space_id column
  const { data, error } = await supabaseClient.from('cycle_participants')
    .select('*,cycles(name,sector)')
    .eq('user_id', userId).eq('cycle_id', cycleId).maybeSingle();
  if (error) throw error;
  if (data) return normalizeParticipantRecord(data);
  const { data: created, error: ie } = await supabaseClient.from('cycle_participants')
    .insert({ user_id: userId, cycle_id: cycleId, submission_status: 'in_progress' })
    .select('*,cycles(name,sector)').single();
  if (ie) throw ie;
  return normalizeParticipantRecord(created);
}

// ─── In-memory club helpers (unchanged) ───────────────────────────────────────

function getOrCreateClubGroupSession({ userId, clubId, groupId, role, sector, ticker }) {
  const cycleName = currentCycleName();
  let session = db.sessions.find((item) => item.userId === userId && item.clubId === clubId && item.groupId === groupId && item.cycleName === cycleName);
  if (!session) {
    session = { id: makeId('session'), userId, clubId, groupId, role, cycleName, sector, joinedCycle: true, joinedAt: new Date().toISOString(), ticker: ticker || '', tickerLocked: Boolean(ticker), slideResponses: emptySlideResponses(), submittedAt: null, createdAt: new Date().toISOString() };
    db.sessions.push(session); saveDb();
  }
  if (!session.slideResponses) session.slideResponses = emptySlideResponses();
  return session;
}

function createClub(name, description, ownerId) {
  const code = generateJoinCode();
  const club = { id: makeId('space'), type: 'club', name, description, joinCode: code, ownerId, currentCycle: currentCycleName(), members: [{ userId: ownerId, displayName: currentUser.fullName, role: 'executive' }], groups: [], pitches: [], createdAt: new Date().toISOString() };
  db.spaces.push(club); saveDb(); return club;
}

function joinClubByCode(code, userId, displayName) {
  const normalized = code.trim().toUpperCase();
  let club = db.spaces.find((s) => s.type === 'club' && s.joinCode === normalized);
  if (!club) {
    club = { id: makeId('space'), type: 'club', name: `Test Club ${normalized}`, description: 'Auto-created test club', joinCode: normalized || generateJoinCode(), ownerId: userId, currentCycle: currentCycleName(), members: [], groups: [], pitches: [], createdAt: new Date().toISOString() };
    db.spaces.push(club);
  }
  pendingClub = { clubId: club.id, userId, displayName };
  saveDb(); return club;
}

function addClubMemberRole(clubId, userId, displayName, role) {
  const club = db.spaces.find((s) => s.id === clubId && s.type === 'club');
  if (!club) return null;
  const existing = club.members.find((m) => m.userId === userId);
  if (existing) existing.role = role; else club.members.push({ userId, displayName, role });
  saveDb(); return club;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function hideAllMainScreens() {
  modeScreen.classList.add('hidden'); cycleScreen.classList.add('hidden'); pitchHub.classList.add('hidden');
  groupHub.classList.add('hidden'); presentationView.classList.add('hidden');
  clubRoleScreen.classList.add('hidden'); clubDashboard.classList.add('hidden');
}

function setAuthMode(mode) {
  authMode = mode === 'signin' ? 'signin' : 'signup';
  const fullNameInput = signupForm?.querySelector('input[name="fullName"]');
  const fullNameField = fullNameInput?.closest('label');
  if (fullNameInput) {
    fullNameInput.required = authMode === 'signup';
  }
  if (fullNameField) fullNameField.classList.toggle('hidden', authMode === 'signin');
  if (signupTitle) signupTitle.textContent = authMode === 'signup' ? 'Create your account' : 'Sign in';
  if (authModeLabel) authModeLabel.textContent = authMode === 'signup' ? 'Creating a new account' : 'Signing in to an existing account';
  if (authSubmitBtn) authSubmitBtn.textContent = authMode === 'signup' ? 'Create account' : 'Sign in';
  if (authSwitchBtn) authSwitchBtn.textContent = authMode === 'signup' ? 'I already have an account' : 'I need to create an account';
}

function showSupabaseUnavailable() {
  const message = 'Unable to load Supabase client. Check your internet connection and reload.';
  const panelText = signupScreen.querySelector('.panel-text');
  if (panelText) panelText.textContent = message;
  const submitButton = signupForm?.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
}

async function routeAuthenticatedUser() {
  if (!supabaseClient) {
    showSupabaseUnavailable();
    signupScreen.classList.remove('hidden');
    hideAllMainScreens();
    return;
  }
  try {
    const authUser = (await supabaseClient.auth.getUser()).data.user;
    if (!authUser) {
      signupScreen.classList.remove('hidden');
      hideAllMainScreens();
      return;
    }
    const profile = await ensureProfileFromAuth(authUser);
    currentUser = { id: profile.id, fullName: profile.full_name || authUser.email || 'Member', email: authUser.email || '' };
    signupScreen.classList.add('hidden');
    modeScreen.classList.remove('hidden');
    setModeButtonActive('individual-btn');
    currentContext = 'individual';

    const individualSpace = await getOrCreateIndividualSpace();
    await ensureMembership(currentUser.id, individualSpace.id);
    const activeCycle = await getCurrentCycle(individualSpace.id);
    activeSession = await getOrCreateCycleParticipant({ userId: currentUser.id, cycleId: activeCycle.id });
    activeSession.slideResponses = await loadPitchSectionsForParticipant(activeSession.id);
    currentSlideIndex = 0;

    if (!activeSession.joinedCycle || !activeSession.tickerLocked) {
      hideAllMainScreens();
      cycleScreen.classList.remove('hidden');
      groupActions.classList.add('hidden');
      renderCycleStep();
      return;
    }
    renderPitchHub();
  } catch (error) {
    console.error('routeAuthenticatedUser failed:', error);
    signupScreen.classList.remove('hidden');
    hideAllMainScreens();
    alert('Sign-in error: ' + (error.message || 'Something went wrong. Check the console for details.'));
  }
}

function setModeButtonActive(active) {
  [individualBtn, clubBtn, classBtn].forEach((btn) => {
    if (!btn) return;
    if (btn.id === active) { btn.classList.add('primary-btn'); btn.classList.remove('secondary'); }
    else { btn.classList.remove('primary-btn'); btn.classList.add('secondary'); }
  });
}

function renderCycleStep() {
  cycleInfo.textContent = `${activeSession.cycleName} - Assigned sector: ${activeSession.sector}`;
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

function renderImagePreview(images) { slideImagePreview.innerHTML = (images || []).map((src) => `<img src="${src}" alt="Uploaded visual" class="preview-image" />`).join(''); }
function readFilesAsDataUrls(files) { return Promise.all(files.map((f) => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(new Error('Unable to read image.')); r.readAsDataURL(f); }))); }

function renderSlide() {
  const slide = HUB_SLIDES[currentSlideIndex];
  const response = activeSession.slideResponses[slide.key] || { input: '', extras: {}, images: [] };
  slidePosition.textContent = `Section ${currentSlideIndex + 1} of ${HUB_SLIDES.length}`;
  slideTitle.textContent = slide.title;
  slidePrompt.textContent = `Prompt: ${slide.prompt}`;
  slideHelper.innerHTML = slide.helper.map((item) => `<li>${item}</li>`).join('');
  slideLookfor.innerHTML = slide.lookFor.map((item) => `<li>${item}</li>`).join('');
  slideImageHint.textContent = `Visual hint: ${slide.imageHint}`;
  slideShortcutsList.innerHTML = slide.shortcuts.length ? slide.shortcuts.map((item) => `<li>${item}</li>`).join('') : '<li>No shortcuts for this section.</li>';
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
    slideExtraFields.innerHTML = `<h4>Optional: Add 2-3 metrics</h4><div class="mode-options"><input data-metric-index="0" placeholder="Metric 1" value="${escapeHtml(metrics[0] || '')}" /><input data-metric-index="1" placeholder="Metric 2" value="${escapeHtml(metrics[1] || '')}" /><input data-metric-index="2" placeholder="Metric 3" value="${escapeHtml(metrics[2] || '')}" /></div>`;
  }
  if (slide.extra === 'conclusion') {
    const rec = response.extras.recommendation || 'Watch';
    const horizon = response.extras.horizon || 'medium';
    const confidence = response.extras.confidence || '5';
    slideExtraFields.classList.remove('hidden');
    slideExtraFields.innerHTML = `<h4>Decision details</h4><div class="mode-options"><label>Recommendation<select id="conclusion-rec"><option ${rec === 'Buy' ? 'selected' : ''}>Buy</option><option ${rec === 'Watch' ? 'selected' : ''}>Watch</option><option ${rec === 'Avoid' ? 'selected' : ''}>Avoid</option></select></label><label>Time horizon<select id="conclusion-horizon"><option value="short" ${horizon === 'short' ? 'selected' : ''}>Short</option><option value="medium" ${horizon === 'medium' ? 'selected' : ''}>Medium</option><option value="long" ${horizon === 'long' ? 'selected' : ''}>Long</option></select></label><label>Confidence (1-10)<input id="conclusion-confidence" type="number" min="1" max="10" value="${escapeHtml(confidence)}" /></label></div>`;
  }
  prevSlideBtn.disabled = currentSlideIndex === 0;
  nextSlideBtn.disabled = currentSlideIndex === HUB_SLIDES.length - 1;
}

function renderProgress() {
  const completed = HUB_SLIDES.filter((slide) => activeSession.slideResponses[slide.key]?.input?.trim()).length;
  const percent = Math.round((completed / HUB_SLIDES.length) * 100);
  progressPercent.textContent = `${percent}% complete`;
  progressList.innerHTML = HUB_SLIDES.map((slide) => `<li>${activeSession.slideResponses[slide.key]?.input?.trim() ? 'done' : 'todo'} ${slide.title}</li>`).join('');
  const canSubmit = completed >= MIN_REQUIRED_SECTIONS && !activeSession.submittedAt;
  const isAnalystContext = currentContext === 'club_group' && activeSession.role === 'analyst';
  submitPitchBtn.disabled = !canSubmit || isAnalystContext;
  viewPresentationBtn.classList.toggle('hidden', !activeSession.submittedAt);
  if (isAnalystContext) submitNote.textContent = 'Analysts can contribute, but only Portfolio Managers can submit.';
  else submitNote.textContent = activeSession.submittedAt ? 'Pitch submitted. You can now view your completed presentation.' : canSubmit ? 'Ready to submit your pitch.' : `Complete ${MIN_REQUIRED_SECTIONS} sections to submit.`;
}

function renderPitchHub() {
  hideAllMainScreens();
  pitchHub.classList.remove('hidden');
  statusPill.textContent = statusForSession(activeSession);
  hubCycle.textContent = `Cycle: ${activeSession.cycleName}`;
  hubSector.textContent = `Sector: ${activeSession.sector}`;
  hubCountdown.textContent = `${daysUntilDeadline()} day(s) left in cycle`;
  hubTicker.textContent = `Ticker: ${activeSession.ticker}`;
  hubCompany.textContent = `Company: ${activeSession.companyName || activeSession.ticker || 'Not selected'}`;
  deadlineText.textContent = `${daysUntilDeadline()} days left to submit.`;
  renderProgress();
  renderSlide();
}

function renderPresentationDeck() {
  const responses = activeSession.slideResponses;
  const imageHtml = (images) => (images && images.length) ? `<div class="presentation-images">${images.map((src) => `<img src="${src}" alt="Slide visual"/>`).join('')}</div>` : '';
  const s1 = responses.executive_summary || {}, s2 = responses.company_overview || {}, s3 = responses.industry_overview || {},
        s4 = responses.stock_analysis || {}, s5 = responses.thesis || {}, s6 = responses.catalysts || {}, s7 = responses.conclusion || {};
  const bullets = (s1.input || '').split('\n').filter(Boolean).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
  const metrics = ((s4.extras || {}).metrics || []).filter(Boolean).map((m) => `<li>${escapeHtml(m)}</li>`).join('');
  presentationSlidesHtml = [
    `<article class="presentation-slide full-slide"><h3>Executive Summary</h3><p class="recommendation-text">${escapeHtml((s7.extras || {}).recommendation || 'Watch')}</p><ul>${bullets || `<li>${escapeHtml(s1.input || '')}</li>`}</ul>${imageHtml(s1.images)}</article>`,
    `<article class="presentation-slide full-slide two-col"><h3>Company Overview</h3><div><p>${escapeHtml(s2.input || '')}</p></div><div><p><strong>What they do</strong></p><p><strong>Revenue model</strong></p><p><strong>Key segments</strong></p></div>${imageHtml(s2.images)}</article>`,
    `<article class="presentation-slide full-slide"><h3>Industry Overview</h3><p>${escapeHtml(s3.input || '')}</p>${imageHtml(s3.images)}</article>`,
    `<article class="presentation-slide full-slide"><h3>Stock Analysis</h3><p>${escapeHtml(s4.input || '')}</p>${metrics ? `<ul>${metrics}</ul>` : ''}${imageHtml(s4.images)}</article>`,
    `<article class="presentation-slide full-slide thesis-slide"><h3>Thesis</h3><p>${escapeHtml(s5.input || '')}</p>${imageHtml(s5.images)}</article>`,
    `<article class="presentation-slide full-slide catalyst-split"><h3>Catalysts</h3><div class="split upside"><h4>Upside</h4><p>${escapeHtml(s6.input || '')}</p></div><div class="split risks"><h4>Risks</h4><p>${escapeHtml(s6.input || '')}</p></div>${imageHtml(s6.images)}</article>`,
    `<article class="presentation-slide full-slide"><h3>Conclusion</h3><p><strong>Recommendation:</strong> ${escapeHtml((s7.extras || {}).recommendation || 'Watch')}</p><p><strong>Confidence:</strong> ${escapeHtml((s7.extras || {}).confidence || '5')} / 10</p><p><strong>Time horizon:</strong> ${escapeHtml((s7.extras || {}).horizon || 'medium')}</p><p>${escapeHtml(s7.input || '')}</p>${imageHtml(s7.images)}</article>`,
  ];
  presentationIndex = 0;
  renderPresentationPage();
}

function renderPresentationPage() {
  if (!presentationSlidesHtml.length) return;
  presentationSlides.innerHTML = presentationSlidesHtml[presentationIndex];
  presentationPosition.textContent = `Slide ${presentationIndex + 1} of ${presentationSlidesHtml.length}`;
  presentationPrevBtn.disabled = presentationIndex === 0;
  presentationNextBtn.disabled = presentationIndex === presentationSlidesHtml.length - 1;
}

function renderClassPlaceholder() {
  hideAllMainScreens(); groupHub.classList.remove('hidden');
  groupHubTitle.textContent = 'Class mode';
  groupHubSubtitle.textContent = 'Class mode remains unchanged in this iteration.';
  groupHubCards.innerHTML = '<article class="dash-card"><h3>Coming soon</h3><p>Class workflows are unchanged for now.</p></article>';
}

function renderClubDashboard() {
  if (!activeClub) return;
  hideAllMainScreens(); clubDashboard.classList.remove('hidden');
  const currentMember = activeClub.members.find((m) => m.userId === currentUser.id);
  clubName.textContent = activeClub.name;
  clubRoleLine.textContent = `Your role: ${currentMember ? currentMember.role : 'member'}`;
  clubCycle.textContent = activeClub.currentCycle;
  clubMembers.innerHTML = activeClub.members.map((m) => `<li>${escapeHtml(m.displayName || m.userId)} - ${m.role}</li>`).join('');
  const submitted = (activeClub.pitches || []).map((pitch) => `<li>${escapeHtml(pitch.groupName)} - ${escapeHtml(pitch.ticker)} - by ${escapeHtml(pitch.userName)}</li>`).join('');
  clubPitches.innerHTML = submitted || '<li>No submitted pitches yet.</li>';
  executiveControls.classList.toggle('hidden', (currentMember ? currentMember.role : '') !== 'executive');
  clubGroupsList.innerHTML = (activeClub.groups || []).map((group) => {
    const isPm = currentMember && currentMember.role === 'portfolio_manager';
    const canEnter = currentMember && (currentMember.role === 'analyst' || currentMember.role === 'portfolio_manager');
    return `<div class="section-card"><strong>${escapeHtml(group.name)}</strong><p>Sector: ${escapeHtml(group.sector)}</p><p>Members: ${escapeHtml((group.memberNames || []).join(', ') || 'None')}</p>${isPm ? `<label>Stock ticker<input data-group-stock="${group.id}" value="${escapeHtml(group.stockTicker || '')}" placeholder="AAPL" /></label><button data-save-stock="${group.id}" class="secondary" type="button">Save stock</button>` : ''}${canEnter ? `<button data-open-group="${group.id}" class="primary-btn" type="button">Open Group Hub</button>` : ''}</div>`;
  }).join('') || '<p>No groups yet.</p>';
}

// ─── Event listeners ──────────────────────────────────────────────────────────

setAuthMode('signup');

signupForm && signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabaseClient) { showSupabaseUnavailable(); return; }
  const formData = new FormData(signupForm);
  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  try {
    if (authMode === 'signin') {
      const signIn = await supabaseClient.auth.signInWithPassword({ email, password });
      if (signIn.error) throw signIn.error;
    } else {
      const signUp = await supabaseClient.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (signUp.error) {
        const message = String(signUp.error.message || '');
        const isAlreadyRegistered = /already registered|already exists|exists/i.test(message);
        if (!isAlreadyRegistered) throw signUp.error;
        const fallbackSignIn = await supabaseClient.auth.signInWithPassword({ email, password });
        if (fallbackSignIn.error) throw new Error('This email already exists. Switch to "Sign in" and use your existing password.');
      }
      if (signUp.data.user && !signUp.data.session) {
        const immediateSignIn = await supabaseClient.auth.signInWithPassword({ email, password });
        if (immediateSignIn.error) {
          const signInMessage = String(immediateSignIn.error.message || '');
          const needsConfirmation = /confirm|verification|verified|not confirmed/i.test(signInMessage);
          if (needsConfirmation) {
            throw new Error('Account created, but email verification is required before you can continue. Please verify your email, then sign in.');
          }
          throw immediateSignIn.error;
        }
      }
    }
    const authUser = (await supabaseClient.auth.getUser()).data.user;
    if (!authUser) throw new Error('Authentication failed. Please try again.');
    await ensureProfileFromAuth(authUser, fullName);
    await routeAuthenticatedUser();
  } catch (error) {
    alert(error.message || (authMode === 'signin' ? 'Unable to sign in right now.' : 'Unable to create account right now.'));
  }
});

authSwitchBtn && authSwitchBtn.addEventListener('click', () => {
  setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
  if (authMode === 'signin') alert('Switched to Sign in mode. Use your existing email and password.');
});

individualBtn && individualBtn.addEventListener('click', async () => {
  if (!currentUser || !currentUser.id) return;
  try { await routeAuthenticatedUser(); } catch (error) { alert(error.message || 'Unable to load your session.'); }
});

clubBtn && clubBtn.addEventListener('click', () => {
  setModeButtonActive('club-btn');
  hideAllMainScreens();
  modeScreen.classList.remove('hidden');
  groupActions.classList.remove('hidden');
  groupTitle.textContent = 'Club setup';
});

classBtn && classBtn.addEventListener('click', () => { setModeButtonActive('class-btn'); renderClassPlaceholder(); });

groupActions && groupActions.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!currentUser || !currentUser.id || !groupSpaceName.value.trim()) return;
  activeClub = createClub(groupSpaceName.value.trim(), groupDescription.value.trim(), currentUser.id);
  pendingClub = null;
  renderClubDashboard();
});

joinGroupBtn && joinGroupBtn.addEventListener('click', () => {
  if (!currentUser || !currentUser.id || !groupJoinCode.value.trim()) return;
  activeClub = joinClubByCode(groupJoinCode.value, currentUser.id, currentUser.fullName);
  hideAllMainScreens();
  clubRoleScreen.classList.remove('hidden');
});

pickPmBtn && pickPmBtn.addEventListener('click', () => {
  if (!activeClub || !currentUser || !currentUser.id) return;
  activeClub = addClubMemberRole(activeClub.id, currentUser.id, currentUser.fullName, 'portfolio_manager');
  renderClubDashboard();
});

pickAnalystBtn && pickAnalystBtn.addEventListener('click', () => {
  if (!activeClub || !currentUser || !currentUser.id) return;
  activeClub = addClubMemberRole(activeClub.id, currentUser.id, currentUser.fullName, 'analyst');
  renderClubDashboard();
});

createClubGroupBtn && createClubGroupBtn.addEventListener('click', () => {
  if (!activeClub || !clubGroupName.value.trim()) return;
  const memberNames = clubGroupMembers.value.split(',').map((x) => x.trim()).filter(Boolean);
  activeClub.groups.push({ id: makeId('group'), name: clubGroupName.value.trim(), sector: clubGroupSector.value, memberNames, stockTicker: '', submittedBy: null });
  saveDb(); renderClubDashboard();
});

clubGroupsList && clubGroupsList.addEventListener('click', (event) => {
  const saveStockBtn = event.target.closest('button[data-save-stock]');
  if (saveStockBtn) {
    const group = activeClub.groups.find((g) => g.id === saveStockBtn.dataset.saveStock);
    const input = clubGroupsList.querySelector(`input[data-group-stock="${group.id}"]`);
    group.stockTicker = (input ? input.value.trim().toUpperCase() : '') || '';
    saveDb(); renderClubDashboard(); return;
  }
  const openGroupBtn = event.target.closest('button[data-open-group]');
  if (openGroupBtn) {
    const group = activeClub.groups.find((g) => g.id === openGroupBtn.dataset.openGroup);
    if (!group) return;
    const member = activeClub.members.find((m) => m.userId === currentUser.id);
    currentContext = 'club_group';
    activeSession = getOrCreateClubGroupSession({ userId: currentUser.id, clubId: activeClub.id, groupId: group.id, role: member ? member.role : 'analyst', sector: group.sector, ticker: group.stockTicker });
    activeSession.ticker = group.stockTicker;
    activeSession.tickerLocked = Boolean(group.stockTicker);
    renderPitchHub();
  }
});

joinCycleBtn && joinCycleBtn.addEventListener('click', async () => {
  if (!activeSession || activeSession.joinedCycle) return;
  try {
    const joinedAt = new Date().toISOString();
    activeSession.joinedCycle = true;
    activeSession.joinedAt = joinedAt;
    if (currentContext === 'individual') {
      const { error } = await supabaseClient.from('cycle_participants').update({ joined_at: joinedAt, submission_status: 'in_progress' }).eq('id', activeSession.id);
      if (error) throw error;
    } else saveDb();
    renderCycleStep();
  } catch (error) { alert(error.message || 'Unable to join cycle.'); }
});

lockTickerBtn && lockTickerBtn.addEventListener('click', () => {
  if (!activeSession || !activeSession.joinedCycle || activeSession.tickerLocked) return;
  const ticker = tickerInput.value.trim().toUpperCase();
  if (!/^[A-Z]{1,8}$/.test(ticker)) { tickerInput.setCustomValidity('Enter a valid stock ticker (letters only, max 8).'); tickerInput.reportValidity(); return; }
  tickerInput.setCustomValidity('');
  activeSession.ticker = ticker;
  lockModal.classList.remove('hidden');
});

confirmLockBtn && confirmLockBtn.addEventListener('click', async () => {
  if (!activeSession || !activeSession.ticker) return;
  try {
    activeSession.tickerLocked = true;
    if (currentContext === 'individual') {
      const { error } = await supabaseClient.from('cycle_participants').update({ ticker: activeSession.ticker, company_name: activeSession.ticker, ticker_locked: true }).eq('id', activeSession.id);
      if (error) throw error;
    } else saveDb();
    lockModal.classList.add('hidden');
    renderPitchHub();
  } catch (error) { alert(error.message || 'Unable to lock ticker.'); }
});

cancelLockBtn && cancelLockBtn.addEventListener('click', () => lockModal.classList.add('hidden'));
prevSlideBtn && prevSlideBtn.addEventListener('click', () => { if (currentSlideIndex > 0) { currentSlideIndex -= 1; renderSlide(); } });
nextSlideBtn && nextSlideBtn.addEventListener('click', () => { if (currentSlideIndex < HUB_SLIDES.length - 1) { currentSlideIndex += 1; renderSlide(); } });

toggleShortcutsBtn && toggleShortcutsBtn.addEventListener('click', () => {
  slideShortcuts.classList.toggle('hidden');
  toggleShortcutsBtn.textContent = slideShortcuts.classList.contains('hidden') ? 'Show research shortcuts' : 'Hide research shortcuts';
});

slideImageUpload && slideImageUpload.addEventListener('change', async () => {
  if (!slideImageUpload.files || !slideImageUpload.files.length) { pendingSlideImages = null; return; }
  const files = Array.from(slideImageUpload.files);
  if (files.length > 3) { slideImageUpload.setCustomValidity('Please upload between 1 and 3 images.'); slideImageUpload.reportValidity(); return; }
  slideImageUpload.setCustomValidity('');
  pendingSlideImages = await readFilesAsDataUrls(files);
  renderImagePreview(pendingSlideImages);
});

saveSlideBtn && saveSlideBtn.addEventListener('click', async () => {
  if (!activeSession || activeSession.submittedAt) return;
  const slide = HUB_SLIDES[currentSlideIndex];
  const response = activeSession.slideResponses[slide.key] || { input: '', extras: {}, images: [] };
  response.input = slideInput.value.trim();
  if (pendingSlideImages && pendingSlideImages.length) response.images = pendingSlideImages.slice(0, 3);
  if (slide.extra === 'metrics') response.extras.metrics = Array.from(slideExtraFields.querySelectorAll('[data-metric-index]')).map((input) => input.value.trim());
  if (slide.extra === 'conclusion') {
    const rec = slideExtraFields.querySelector('#conclusion-rec');
    const hor = slideExtraFields.querySelector('#conclusion-horizon');
    const con = slideExtraFields.querySelector('#conclusion-confidence');
    response.extras.recommendation = rec ? rec.value : 'Watch';
    response.extras.horizon = hor ? hor.value : 'medium';
    response.extras.confidence = con ? con.value : '5';
  }
  activeSession.slideResponses[slide.key] = response;
  pendingSlideImages = null;
  try {
    if (currentContext === 'individual') await savePitchSection(activeSession.id, slide.key, response);
    else saveDb();
    renderPitchHub();
  } catch (error) { alert(error.message || 'Unable to save section.'); }
});

submitPitchBtn && submitPitchBtn.addEventListener('click', async () => {
  if (!activeSession || activeSession.submittedAt) return;
  const completed = HUB_SLIDES.filter((slide) => activeSession.slideResponses[slide.key] && activeSession.slideResponses[slide.key].input && activeSession.slideResponses[slide.key].input.trim()).length;
  if (completed < MIN_REQUIRED_SECTIONS) return;
  activeSession.submittedAt = new Date().toISOString();
  if (currentContext === 'club_group' && activeSession.role === 'portfolio_manager') {
    const group = activeClub.groups.find((g) => g.id === activeSession.groupId);
    if (group) { activeClub.pitches.push({ groupId: group.id, groupName: group.name, ticker: activeSession.ticker, userName: currentUser.fullName, submittedAt: activeSession.submittedAt }); saveDb(); }
  }
  try {
    if (currentContext === 'individual') {
      const { error } = await supabaseClient.from('cycle_participants').update({ submission_status: 'submitted' }).eq('id', activeSession.id);
      if (error) throw error;
    } else saveDb();
    renderPitchHub();
  } catch (error) { alert(error.message || 'Unable to submit pitch.'); }
});

viewPresentationBtn && viewPresentationBtn.addEventListener('click', () => {
  if (!activeSession || !activeSession.submittedAt) return;
  hideAllMainScreens(); presentationView.classList.remove('hidden'); renderPresentationDeck();
});

backToHubBtn && backToHubBtn.addEventListener('click', () => renderPitchHub());
presentationPrevBtn && presentationPrevBtn.addEventListener('click', () => { if (presentationIndex > 0) { presentationIndex -= 1; renderPresentationPage(); } });
presentationNextBtn && presentationNextBtn.addEventListener('click', () => { if (presentationIndex < presentationSlidesHtml.length - 1) { presentationIndex += 1; renderPresentationPage(); } });

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange(async (event) => {
    if (event === 'SIGNED_OUT') {
      currentUser = null; activeSession = null;
      signupScreen.classList.remove('hidden'); hideAllMainScreens(); return;
    }
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
      try { await routeAuthenticatedUser(); } catch (error) { console.error(error); }
    }
  });
} else {
  showSupabaseUnavailable();
  console.error('Supabase client unavailable: CDN script failed to load.');
  signupScreen.classList.remove('hidden');
  hideAllMainScreens();
}
