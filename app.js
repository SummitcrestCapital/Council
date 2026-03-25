const DB_KEY = 'council-db-v2';
const SECTORS = ['Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer'];
const PITCH_SECTIONS = ['Thesis', 'Business Understanding', 'Upside', 'Risks', 'Valuation', 'Final Call'];
const MIN_REQUIRED_SECTIONS = 4;

const signupScreen = document.querySelector('#signup-screen');
const modeScreen = document.querySelector('#mode-screen');
const cycleScreen = document.querySelector('#cycle-screen');
const pitchHub = document.querySelector('#pitch-hub');

const signupForm = document.querySelector('#signup-form');
const individualBtn = document.querySelector('#individual-btn');
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

let db = loadDb();
let currentUser = null;
let activeSession = null;
let currentEditSection = null;

function loadDb() {
  const saved = localStorage.getItem(DB_KEY);
  if (!saved) return { users: [], sessions: [] };

  try {
    const parsed = JSON.parse(saved);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return { users: [], sessions: [] };
  }
}

function saveDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function currentCycleName() {
  const now = new Date();
  return now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
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
      id: makeId('session'),
      userId,
      cycleName,
      sector: assignedSector,
      joinedCycle: false,
      joinedAt: null,
      ticker: '',
      tickerLocked: false,
      pitch: Object.fromEntries(PITCH_SECTIONS.map((section) => [section, ''])),
      submittedAt: null,
      createdAt: new Date().toISOString(),
    };
    db.sessions.push(session);
    saveDb();
  }

  return session;
}

function statusForSession(session) {
  if (session.submittedAt) return 'Submitted';
  const completed = PITCH_SECTIONS.filter((name) => session.pitch[name]?.trim()).length;
  if (completed > 0) return 'In progress';
  return 'Not started';
}

function renderCycleStep() {
  cycleInfo.textContent = `${activeSession.cycleName} • Assigned sector: ${activeSession.sector}`;

  if (activeSession.joinedCycle) {
    joinCycleBtn.disabled = true;
    joinCycleBtn.textContent = 'Joined (locked)';
    tickerStep.classList.remove('hidden');
  } else {
    joinCycleBtn.disabled = false;
    joinCycleBtn.textContent = 'Join this cycle';
    tickerStep.classList.add('hidden');
  }

  if (activeSession.tickerLocked) {
    tickerInput.value = activeSession.ticker;
    tickerInput.disabled = true;
    lockTickerBtn.disabled = true;
    lockTickerBtn.textContent = 'Ticker locked';
  } else {
    tickerInput.value = activeSession.ticker;
    tickerInput.disabled = false;
    lockTickerBtn.disabled = false;
    lockTickerBtn.textContent = 'Lock in ticker';
  }
}

function renderProgress() {
  const completed = PITCH_SECTIONS.filter((name) => activeSession.pitch[name]?.trim()).length;
  const percent = Math.round((completed / PITCH_SECTIONS.length) * 100);

  progressPercent.textContent = `${percent}% complete`;
  progressList.innerHTML = PITCH_SECTIONS.map((section) => {
    const done = Boolean(activeSession.pitch[section]?.trim());
    return `<li>${done ? '✅' : '⬜'} ${section}</li>`;
  }).join('');

  sectionCards.innerHTML = PITCH_SECTIONS.map((section) => {
    const done = Boolean(activeSession.pitch[section]?.trim());
    return `
      <div class="section-card ${done ? 'complete' : ''}">
        <strong>${section}</strong>
        <p>${done ? 'Status: complete' : 'Status: incomplete'}</p>
        <button type="button" data-edit-section="${section}" class="primary-btn">${done ? 'Edit' : 'Start'}</button>
      </div>
    `;
  }).join('');

  const canSubmit = completed >= MIN_REQUIRED_SECTIONS && !activeSession.submittedAt;
  submitPitchBtn.disabled = !canSubmit;

  if (activeSession.submittedAt) {
    submitNote.textContent = 'Pitch submitted. Everything is now locked.';
  } else if (canSubmit) {
    submitNote.textContent = 'Ready to submit your pitch.';
  } else {
    submitNote.textContent = `Complete at least ${MIN_REQUIRED_SECTIONS} sections to submit.`;
  }
}

function renderPitchHub() {
  modeScreen.classList.add('hidden');
  cycleScreen.classList.add('hidden');
  pitchHub.classList.remove('hidden');

  statusPill.textContent = statusForSession(activeSession);
  hubCycle.textContent = `Cycle: ${activeSession.cycleName}`;
  hubSector.textContent = `Sector: ${activeSession.sector}`;
  hubCountdown.textContent = `${daysUntilDeadline()} day(s) left in cycle`;
  hubTicker.textContent = `Ticker: ${activeSession.ticker}`;
  hubCompany.textContent = `Company: ${activeSession.ticker ? `${activeSession.ticker} (name lookup coming soon)` : 'Not selected'}`;
  deadlineText.textContent = `${daysUntilDeadline()} days left to submit.`;

  renderProgress();
}

function openEditor(sectionName) {
  if (activeSession.submittedAt) return;

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
  modeScreen.classList.add('hidden');
  cycleScreen.classList.remove('hidden');
  renderCycleStep();

  if (activeSession.tickerLocked) {
    renderPitchHub();
  }
});

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

cancelLockBtn?.addEventListener('click', () => {
  lockModal.classList.add('hidden');
});

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
