const DB_KEY = 'council-db-v3';
const SECTORS = ['Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer'];
const PITCH_SECTIONS = ['Thesis', 'Business Understanding', 'Upside', 'Risks', 'Valuation', 'Final Call'];
const MIN_REQUIRED_SECTIONS = 4;

const signupScreen = document.querySelector('#signup-screen');
const modeScreen = document.querySelector('#mode-screen');
const cycleScreen = document.querySelector('#cycle-screen');
const pitchHub = document.querySelector('#pitch-hub');
const groupHub = document.querySelector('#group-hub');

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
const sectionCards = document.querySelector('#section-cards');
const submitPitchBtn = document.querySelector('#submit-pitch-btn');
const submitNote = document.querySelector('#submit-note');
const deadlineText = document.querySelector('#deadline-text');

const editorBox = document.querySelector('#editor-box');
const editorTitle = document.querySelector('#editor-title');
const editorText = document.querySelector('#editor-text');
const saveSectionBtn = document.querySelector('#save-section-btn');

const groupHubTitle = document.querySelector('#group-hub-title');
const groupHubSubtitle = document.querySelector('#group-hub-subtitle');
const groupHubCards = document.querySelector('#group-hub-cards');

let db = loadDb();
let currentUser = null;
let activeSession = null;
let activeGroupType = null;
let currentEditSection = null;

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

function currentCycleName() {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
function cycleDeadline() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}
function daysUntilDeadline() {
  const diff = cycleDeadline().getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function createUser({ fullName, email }) {
  const user = { id: makeId('user'), fullName, email, createdAt: new Date().toISOString() };
  db.users.push(user);
  saveDb();
  return user;
}

function getOrCreateSession(userId) {
  const cycleName = currentCycleName();
  let session = db.sessions.find((item) => item.userId === userId && item.cycleName === cycleName);
  if (!session) {
    const assignedSector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    session = {
      id: makeId('session'), userId, cycleName, sector: assignedSector,
      joinedCycle: false, joinedAt: null, ticker: '', tickerLocked: false,
      pitch: Object.fromEntries(PITCH_SECTIONS.map((section) => [section, ''])),
      submittedAt: null, createdAt: new Date().toISOString(),
    };
    db.sessions.push(session);
    saveDb();
  }
  return session;
}

function createGroupSpace(type, name, ownerId) {
  const role = type === 'club' ? 'leader' : 'teacher';
  const space = {
    id: makeId('space'),
    type,
    name,
    joinCode: generateJoinCode(),
    ownerId,
    members: [{ userId: ownerId, role }],
    createdAt: new Date().toISOString(),
  };
  db.spaces.push(space);
  saveDb();
  return { space, role };
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
  space.members.push({ userId, role });
  saveDb();
  return { space, role };
}

function hideAllMainScreens() {
  modeScreen.classList.add('hidden');
  cycleScreen.classList.add('hidden');
  pitchHub.classList.add('hidden');
  groupHub.classList.add('hidden');
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
  const completed = PITCH_SECTIONS.filter((name) => session.pitch[name]?.trim()).length;
  return completed > 0 ? 'In progress' : 'Not started';
}

function renderProgress() {
  const completed = PITCH_SECTIONS.filter((name) => activeSession.pitch[name]?.trim()).length;
  const percent = Math.round((completed / PITCH_SECTIONS.length) * 100);
  progressPercent.textContent = `${percent}% complete`;
  progressList.innerHTML = PITCH_SECTIONS.map((section) => `<li>${activeSession.pitch[section]?.trim() ? '✅' : '⬜'} ${section}</li>`).join('');
  sectionCards.innerHTML = PITCH_SECTIONS.map((section) => {
    const done = Boolean(activeSession.pitch[section]?.trim());
    return `<div class="section-card ${done ? 'complete' : ''}"><strong>${section}</strong><p>${done ? 'Status: complete' : 'Status: incomplete'}</p><button type="button" data-edit-section="${section}" class="primary-btn">${done ? 'Edit' : 'Start'}</button></div>`;
  }).join('');

  const canSubmit = completed >= MIN_REQUIRED_SECTIONS && !activeSession.submittedAt;
  submitPitchBtn.disabled = !canSubmit;
  submitNote.textContent = activeSession.submittedAt
    ? 'Pitch submitted. Everything is now locked.'
    : canSubmit
      ? 'Ready to submit your pitch.'
      : `Complete at least ${MIN_REQUIRED_SECTIONS} sections to submit.`;
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
}

function renderGroupHub(space, role) {
  hideAllMainScreens();
  groupHub.classList.remove('hidden');
  groupHubTitle.textContent = `${space.type === 'club' ? 'Club' : 'Class'} dashboard`;
  groupHubSubtitle.textContent = `${space.name} • Role: ${role} • Join code: ${space.joinCode}`;

  const memberList = space.members.map((member) => `<li>${member.role}</li>`).join('');
  if (space.type === 'club') {
    groupHubCards.innerHTML = `
      <article class="dash-card"><h3>Club name</h3><p>${space.name}</p></article>
      <article class="dash-card"><h3>Members</h3><ul>${memberList}</ul></article>
      <article class="dash-card"><h3>Cycle section</h3><p>Club cycle placeholder</p></article>
      <article class="dash-card"><h3>Leaderboard</h3><p>Leaderboard placeholder</p></article>
      <article class="dash-card"><h3>Admin controls</h3><p>${role === 'leader' ? 'Manage club settings enabled.' : 'View-only member.'}</p></article>
    `;
    return;
  }

  groupHubCards.innerHTML = `
    <article class="dash-card"><h3>Class name</h3><p>${space.name}</p></article>
    <article class="dash-card"><h3>Assignments</h3><p>Assignments placeholder</p></article>
    <article class="dash-card"><h3>Student roster</h3><ul>${memberList}</ul></article>
    <article class="dash-card"><h3>Due dates</h3><p>Due dates placeholder</p></article>
    <article class="dash-card"><h3>Teacher controls</h3><p>${role === 'teacher' ? 'Grading enabled.' : 'Student view only.'}</p></article>
  `;
}

function openEditor(sectionName) {
  if (!activeSession || activeSession.submittedAt) return;
  currentEditSection = sectionName;
  editorTitle.textContent = sectionName;
  editorText.value = activeSession.pitch[sectionName] || '';
  editorBox.classList.remove('hidden');
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

sectionCards?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-edit-section]');
  if (!button) return;
  openEditor(button.dataset.editSection);
});

saveSectionBtn?.addEventListener('click', () => {
  if (!currentEditSection || !activeSession || activeSession.submittedAt) return;
  activeSession.pitch[currentEditSection] = editorText.value.trim();
  saveDb();
  editorBox.classList.add('hidden');
  renderPitchHub();
});

submitPitchBtn?.addEventListener('click', () => {
  if (!activeSession || activeSession.submittedAt) return;
  const completed = PITCH_SECTIONS.filter((name) => activeSession.pitch[name]?.trim()).length;
  if (completed < MIN_REQUIRED_SECTIONS) return;
  activeSession.submittedAt = new Date().toISOString();
  saveDb();
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
    const errors = {
      invalid: 'Enter a valid join code.',
      not_found: 'No matching space found.',
      wrong_type: 'This code belongs to a different space type.',
    };
    groupJoinCode.setCustomValidity(errors[result.error]);
    groupJoinCode.reportValidity();
    return;
  }
  groupJoinCode.setCustomValidity('');
  renderGroupHub(result.space, result.role);
});
