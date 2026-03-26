const DB_KEY = 'council-db-v6';
const SECTORS = ['Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer'];
const MIN_REQUIRED_SECTIONS = 7;
const SUPABASE_URL = 'https://seyhhqobsefkzmekwqjj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNleWhocW9ic2Vma3ptZWt3cWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk0NDAsImV4cCI6MjA5MDAzNTQ0MH0.xdy-X51uf1EeXpPYG6aKLui7pgHq9qtqqvJI2u1Kqeg';

const HUB_SLIDES = [
  { key: 'executive_summary', title: '1. Executive Summary', prompt: 'What is your overall recommendation and why?', helper: ['This is your quick pitch.', 'Imagine explaining your idea in 30 seconds.', 'Include BOTH positives and negatives.'], lookFor: ['Clear recommendation (Buy / Watch / Avoid).', '2–4 key points.', 'Balanced view (not just hype).', 'Should summarize everything that follows.'], shortcuts: ['None needed — this is YOUR synthesis.'], imageHint: 'Helpful visuals: company logo, mini stock chart, or one key stat image. Keep this slide light.', placeholder: 'Write 3–5 bullets.' },
  { key: 'company_overview', title: '2. Company Overview', prompt: 'Explain the company and how it operates.', helper: ['What does the company do?', 'How does it make money?', 'Who are its customers?', 'What makes it different?'], lookFor: ['Clear business model.', 'Revenue sources.', 'Competitive advantage (moat).', 'Key segments.', 'Basic management insight (optional for MVP).'], shortcuts: ['Company website → About', 'Yahoo Finance → Profile', 'Google: “how does [company] make money”'], imageHint: 'Helpful visuals: business model diagram, revenue breakdown chart, product/service image.', placeholder: 'Paragraph or bullet mix (4–8 sentences).' },
  { key: 'industry_overview', title: '3. Industry Overview', prompt: 'What industry does this company operate in and what is happening in it?', helper: ['How big is the industry?', 'Is it growing or shrinking?', 'What trends are shaping it?', 'Who are the competitors?'], lookFor: ['Industry size or importance.', 'Growth trends.', 'Major players.', 'Tailwinds (AI, healthcare, etc.).', 'Headwinds (regulation, slowdown).'], shortcuts: ['Google: “[industry] market size growth”', 'Google: “[company] competitors”', 'News on industry trends'], imageHint: 'Helpful visuals: industry growth chart, competitor map, trend graphic.', placeholder: 'Paragraph or bullets.' },
  { key: 'stock_analysis', title: '4. Stock Analysis (Metrics + Comparison)', prompt: 'What do the numbers tell you about this company?', helper: ['Look at key financial metrics.', 'Compare to competitors or market.', 'Identify what stands out.'], lookFor: ['P/E ratio.', 'Revenue growth.', 'Profit margins.', 'Comparison vs competitors.', 'Comparison vs S&P 500 (basic).'], shortcuts: ['Yahoo Finance → Key Statistics', 'Google: “[company] PE ratio”', 'Google: “[company] vs competitors”'], imageHint: 'Helpful visuals: stock price chart (must-have), metrics table, earnings/revenue trend graph.', placeholder: 'Short explanation + key stats.', extra: 'metrics' },
  { key: 'thesis', title: '5. Thesis (Core Section)', prompt: 'What is the unique opportunity here?', helper: ['What is NOT fully understood by the market?', 'Why is this stock mispriced?', 'What makes this special?'], lookFor: ['Specific, not generic.', '“Hidden value” or overlooked factor.', 'Clear reasoning.', 'Not just “good company”.'], shortcuts: ['Earnings reports (summary)', 'News about company strategy', 'Analyst opinions (optional)'], imageHint: 'Helpful visuals: one supporting chart, one key highlighted stat, optional mini idea diagram.', placeholder: '1–2 strong paragraphs.' },
  { key: 'catalysts', title: '6. Catalysts (Upside + Risks + Scenarios)', prompt: 'What events could drive this stock up or down?', helper: ['What could help this stock grow?', 'What could hurt it?', 'How likely are these outcomes?'], lookFor: ['Tailwinds: launches, expansion, growth.', 'Headwinds: competition, regulation, slowdown.', 'Scenario thinking: best/base/worst case.'], shortcuts: ['Google: “[company] outlook”', 'News: “[company] growth plans”', 'Google: “[company] risks”'], imageHint: 'Helpful visuals: catalyst timeline, scenario chart, upside-vs-risk visual split.', placeholder: 'Bullets split into Upside and Risks.' },
  { key: 'conclusion', title: '7. Conclusion', prompt: 'What is your final investment decision?', helper: ['Should someone buy this now?', 'Is this short-term or long-term?', 'How confident are you?'], lookFor: ['Clear recommendation.', 'Consistent with thesis.', 'Time horizon awareness.'], shortcuts: [], imageHint: 'Helpful visuals: simple price target view, risk/reward diagram, or final summary box.', placeholder: 'Final decision notes.', extra: 'conclusion' },
];

const signupScreen = document.querySelector('#signup-screen');
const modeScreen = document.querySelector('#mode-screen');
const cycleScreen = document.querySelector('#cycle-screen');
const pitchHub = document.querySelector('#pitch-hub');
const groupHub = document.querySelector('#group-hub');
const presentationView = document.querySelector('#presentation-view');
const clubRoleScreen = document.querySelector('#club-role-screen');
const clubDashboard = document.querySelector('#club-dashboard');

const signupForm = document.querySelector('#signup-form');
const signupStatus = document.querySelector('#signup-status');
const individualBtn = document.querySelector('#individual-btn');
const clubBtn = document.querySelector('#club-btn');
const classBtn = document.querySelector('#class-btn');
const groupActions = document.querySelector('#group-actions');
const groupTitle = document.querySelector('#group-title');
const groupSpaceName = document.querySelector('#group-space-name');
const groupDescription = document.querySelector('#group-description');
const groupJoinCode = document.querySelector('#group-join-code');
const createGroupBtn = document.querySelector('#create-group-btn');
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
@@ -115,50 +118,105 @@ function loadDb() {
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

const saveDb = () => localStorage.setItem(DB_KEY, JSON.stringify(db));
const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const generateJoinCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const currentCycleName = () => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
const cycleDeadline = () => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); };
const daysUntilDeadline = () => Math.max(0, Math.ceil((cycleDeadline().getTime() - Date.now()) / 86400000));

function escapeHtml(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

function createUser({ fullName, email }) {
  const user = { id: makeId('user'), fullName, email, createdAt: new Date().toISOString() };
  db.users.push(user); saveDb(); return user;
}

async function createSupabaseAuthUser({ email, password, fullName }) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: { full_name: fullName },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.msg || payload?.error_description || payload?.error || 'Unable to create auth account.');
  return payload;
}

async function upsertSupabaseProfile({ authUserId, email, fullName, password, accessToken }) {
  if (!authUserId) throw new Error('Unable to create profile: missing auth user id.');
  const profilePayload = {
    id: authUserId,
    username: email,
    full_name: fullName,
    onboarding_complete: false,
    password,
  };
  const missingColumnRegex = /Could not find the '([^']+)' column/i;
  let attempts = 0;
  while (attempts < 4) {
    attempts += 1;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify([profilePayload]),
    });
    if (response.ok) return;
    const payload = await response.json().catch(() => ({}));
    const message = String(payload?.message || payload?.hint || '');
    const missingColumn = message.match(missingColumnRegex)?.[1];
    if (missingColumn && Object.prototype.hasOwnProperty.call(profilePayload, missingColumn)) {
      delete profilePayload[missingColumn];
      continue;
    }
    throw new Error(payload?.message || payload?.hint || 'Unable to write profile row.');
  }
  throw new Error('Unable to write profile row: profile schema does not include required columns.');
}

function emptySlideResponses() { return Object.fromEntries(HUB_SLIDES.map((s) => [s.key, { input: '', extras: {}, images: [] }])); }

function getOrCreateSession(userId) {
  const cycleName = currentCycleName();
  let session = db.sessions.find((item) => item.userId === userId && item.cycleName === cycleName && !item.groupId);
  if (!session) {
    session = { id: makeId('session'), userId, cycleName, sector: SECTORS[Math.floor(Math.random() * SECTORS.length)], joinedCycle: false, joinedAt: null, ticker: '', tickerLocked: false, slideResponses: emptySlideResponses(), submittedAt: null, createdAt: new Date().toISOString() };
    db.sessions.push(session); saveDb();
  }
  return session;
}

function getOrCreateClubGroupSession({ userId, clubId, groupId, role, sector, ticker }) {
  const cycleName = currentCycleName();
  let session = db.sessions.find((item) => item.userId === userId && item.clubId === clubId && item.groupId === groupId && item.cycleName === cycleName);
  if (!session) {
    session = {
      id: makeId('session'), userId, clubId, groupId, role,
      cycleName, sector, joinedCycle: true, joinedAt: new Date().toISOString(),
      ticker: ticker || '', tickerLocked: Boolean(ticker), slideResponses: emptySlideResponses(),
      submittedAt: null, createdAt: new Date().toISOString(),
    };
    db.sessions.push(session); saveDb();
  }
  if (!session.slideResponses) session.slideResponses = emptySlideResponses();
@@ -340,56 +398,80 @@ function renderClubDashboard() {
  clubRoleLine.textContent = `Your role: ${currentMember?.role || 'member'}`;
  clubCycle.textContent = activeClub.currentCycle;
  clubMembers.innerHTML = activeClub.members.map((m) => `<li>${escapeHtml(m.displayName || m.userId)} — ${m.role}</li>`).join('');

  const submitted = (activeClub.pitches || []).map((pitch) => `<li>${escapeHtml(pitch.groupName)} • ${escapeHtml(pitch.ticker)} • by ${escapeHtml(pitch.userName)}</li>`).join('');
  clubPitches.innerHTML = submitted || '<li>No submitted pitches yet.</li>';

  executiveControls.classList.toggle('hidden', currentMember?.role !== 'executive');

  clubGroupsList.innerHTML = (activeClub.groups || []).map((group) => {
    const isPm = currentMember?.role === 'portfolio_manager';
    const canEnter = currentMember?.role === 'analyst' || currentMember?.role === 'portfolio_manager';
    return `
      <div class="section-card">
        <strong>${escapeHtml(group.name)}</strong>
        <p>Sector: ${escapeHtml(group.sector)}</p>
        <p>Members: ${escapeHtml((group.memberNames || []).join(', ') || 'None')}</p>
        ${isPm ? `<label>Stock ticker<input data-group-stock="${group.id}" value="${escapeHtml(group.stockTicker || '')}" placeholder="AAPL" /></label><button data-save-stock="${group.id}" class="secondary" type="button">Save stock</button>` : ''}
        ${canEnter ? `<button data-open-group="${group.id}" class="primary-btn" type="button">Open Group Hub</button>` : ''}
      </div>
    `;
  }).join('') || '<p>No groups yet.</p>';
}

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);

const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  if (!fullName || !email || !password) return;
  const submitBtn = signupForm.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  if (signupStatus) signupStatus.textContent = 'Creating your account...';
  try {
    const authPayload = await createSupabaseAuthUser({ email, password, fullName });
    await upsertSupabaseProfile({
      authUserId: authPayload?.user?.id,
      email,
      fullName,
      password,
      accessToken: authPayload?.session?.access_token,
    });
  } catch (error) {
    if (signupStatus) signupStatus.textContent = error.message || 'Unable to create account right now.';
    if (submitBtn) submitBtn.disabled = false;
    return;
  }

  currentUser = createUser({ fullName, email });
  signupScreen.classList.add('hidden');
  modeScreen.classList.remove('hidden');
  if (signupStatus) signupStatus.textContent = '';
  if (submitBtn) submitBtn.disabled = false;
});

individualBtn?.addEventListener('click', () => {
  if (!currentUser?.id) return;
  setModeButtonActive('individual-btn');
  currentContext = 'individual';
  activeSession = getOrCreateSession(currentUser.id);
  currentSlideIndex = 0;
  hideAllMainScreens();
  cycleScreen.classList.remove('hidden');
  groupActions.classList.add('hidden');
  renderCycleStep();
  if (activeSession.tickerLocked) renderPitchHub();
});

clubBtn?.addEventListener('click', () => {
  setModeButtonActive('club-btn');
  hideAllMainScreens();
  modeScreen.classList.remove('hidden');
  groupActions.classList.remove('hidden');
  groupTitle.textContent = 'Club setup';
});

classBtn?.addEventListener('click', () => { setModeButtonActive('class-btn'); renderClassPlaceholder(); });
