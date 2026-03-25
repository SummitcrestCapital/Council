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
  REVIEW: 'review',
  GRADE: 'grade',
  MANAGE_CLUB_SETTINGS: 'manage_club_settings',
};

const ROLE_PERMISSIONS = {
  [ROLES.INDIVIDUAL]: [PERMISSIONS.VIEW, PERMISSIONS.SUBMIT],
  [ROLES.MEMBER]: [PERMISSIONS.VIEW, PERMISSIONS.SUBMIT],
  [ROLES.LEADER]: [PERMISSIONS.VIEW, PERMISSIONS.SUBMIT, PERMISSIONS.CREATE_CYCLE, PERMISSIONS.MANAGE_CLUB_SETTINGS],
  [ROLES.STUDENT]: [PERMISSIONS.VIEW, PERMISSIONS.SUBMIT],
  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW,
    PERMISSIONS.SUBMIT,
    PERMISSIONS.CREATE_ASSIGNMENT,
    PERMISSIONS.REVIEW,
    PERMISSIONS.GRADE,
  ],
};

let selectedType = null;
let currentUser = null;

function loadDb() {
  const saved = localStorage.getItem(DB_KEY);

  if (!saved) {
    return { users: [], spaces: [] };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      spaces: Array.isArray(parsed.spaces) ? parsed.spaces : [],
    };
  } catch {
    return { users: [], spaces: [] };
  }
}

let db = loadDb();

function saveDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getCreatorRole(type) {
  if (type === 'club') return ROLES.LEADER;
  if (type === 'class') return ROLES.TEACHER;
  return ROLES.INDIVIDUAL;
}

function getJoinerRole(type) {
  if (type === 'club') return ROLES.MEMBER;
  if (type === 'class') return ROLES.STUDENT;
  return ROLES.INDIVIDUAL;
}

function hasPermission(role, permission) {
  return Boolean(ROLE_PERMISSIONS[role]?.includes(permission));
}

function validateJoinCode(code) {
  return /^[A-Z0-9]{6,8}$/.test(code.trim().toUpperCase());
}

function createUser({ fullName, email }) {
  const user = {
    id: makeId('user'),
    fullName,
    email,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDb();

  return user;
}

function createSpace({ type, name, ownerId }) {
  const now = new Date().toISOString();
  const creatorRole = getCreatorRole(type);

  const space = {
    id: makeId('space'),
    type,
    name,
    joinCode: generateJoinCode(),
    ownerId,
    members: [
      {
        userId: ownerId,
        role: creatorRole,
        joinedAt: now,
      },
    ],
    role: creatorRole,
    createdAt: now,
  };

  db.spaces.push(space);
  saveDb();

  return { space, membershipRole: creatorRole };
}

function joinSpace({ code, userId, expectedType }) {
  const normalized = code.trim().toUpperCase();

  if (!validateJoinCode(normalized)) {
    return { error: 'invalid_code_format' };
  }

  const space = db.spaces.find((candidate) => candidate.joinCode === normalized);

  if (!space) {
    return { error: 'code_not_found' };
  }

  if (space.type === 'individual') {
    return { error: 'individual_not_joinable' };
  }

  if (expectedType && space.type !== expectedType) {
    return { error: 'wrong_space_type' };
  }

  const existing = space.members.find((member) => member.userId === userId);
  if (existing) {
    return { space, membershipRole: existing.role };
  }

  const role = getJoinerRole(space.type);
  space.members.push({
    userId,
    role,
    joinedAt: new Date().toISOString(),
  });

  saveDb();

  return { space, membershipRole: role };
}

function findUserName(userId) {
  const user = db.users.find((candidate) => candidate.id === userId);
  return user?.fullName || `User ${userId.slice(-4)}`;
}

function createCard(title, contentHtml) {
  return `
    <article class="dash-card">
      <h3>${title}</h3>
      ${contentHtml}
    </article>
  `;
}

function renderPermissions(role) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  const items = permissions.map((item) => `<li>${item}</li>`).join('');
  return createCard('Role permissions', `<p><strong>${role}</strong></p><ul>${items}</ul>`);
}

function renderIndividualDashboard(space, membershipRole) {
  return [
    createCard('Welcome message', `<p>Welcome back, ${currentUser?.fullName || 'Investor'}.</p>`),
    createCard('Current progress', '<p>Cycle 1 progress: <strong>20%</strong> complete.</p>'),
    createCard('Current council cycle', '<button class="cta-btn" type="button">Join current council cycle</button>'),
    createCard('Pitches', '<p class="placeholder">Pitch workspace placeholder.</p>'),
    createCard('Leaderboard', '<p class="placeholder">Leaderboard placeholder.</p>'),
    createCard('Space info', `<p>Space name: <strong>${space.name}</strong><br/>Join code: <strong>${space.joinCode}</strong></p>`),
    renderPermissions(membershipRole),
  ].join('');
}

function renderClubDashboard(space, membershipRole) {
  const membersHtml = space.members
    .map((member) => `<li>${findUserName(member.userId)} — ${member.role}</li>`)
    .join('');

  const leaderControls = hasPermission(membershipRole, PERMISSIONS.CREATE_CYCLE)
    ? '<p>Leader controls: create cycle, manage submissions, manage club settings.</p>'
    : '<p>You are a member. Leader controls are hidden.</p>';

  return [
    createCard('Club name', `<p><strong>${space.name}</strong></p>`),
    createCard('Members', `<ul>${membersHtml || '<li>No members yet.</li>'}</ul>`),
    createCard('Cycle section', '<p class="placeholder">Club cycle planning placeholder.</p>'),
    createCard('Leaderboard', '<p class="placeholder">Leaderboard placeholder.</p>'),
    createCard('Join code', `<p>Share this code: <strong>${space.joinCode}</strong></p>`),
    createCard('Admin controls', leaderControls),
    renderPermissions(membershipRole),
  ].join('');
}

function renderClassDashboard(space, membershipRole) {
  const rosterHtml = space.members
    .map((member) => `<li>${findUserName(member.userId)} — ${member.role}</li>`)
    .join('');

  const teacherControls = hasPermission(membershipRole, PERMISSIONS.CREATE_ASSIGNMENT)
    ? '<p>Teacher controls: create assignments, review submissions, and grade work.</p>'
    : '<p>Student view: submit work and track due dates.</p>';

  return [
    createCard('Class name', `<p><strong>${space.name}</strong></p>`),
    createCard('Assignments', '<p class="placeholder">Assignments section placeholder.</p>'),
    createCard('Student roster', `<ul>${rosterHtml || '<li>No students yet.</li>'}</ul>`),
    createCard('Due dates', '<ul><li>Pitch 1 — Apr 10</li><li>Reflection — Apr 17</li></ul>'),
    createCard('Teacher controls', teacherControls),
    renderPermissions(membershipRole),
  ].join('');
}

function showDashboard(space, membershipRole) {
  if (!dashboardScreen || !dashboardGrid || !dashboardTitle || !dashboardSubtitle || !spaceScreen) {
    return;
  }

  spaceScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');

  dashboardTitle.textContent = `${space.type.charAt(0).toUpperCase()}${space.type.slice(1)} dashboard`;
  dashboardSubtitle.textContent = `Space: ${space.name} • Role: ${membershipRole}`;

  if (space.type === 'individual') {
    dashboardGrid.innerHTML = renderIndividualDashboard(space, membershipRole);
    return;
  }

  if (space.type === 'club') {
    dashboardGrid.innerHTML = renderClubDashboard(space, membershipRole);
    return;
  }

  dashboardGrid.innerHTML = renderClassDashboard(space, membershipRole);
}

signupForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(signupForm);
  currentUser = createUser({
    fullName: String(formData.get('fullName') || '').trim(),
    email: String(formData.get('email') || '').trim(),
  });

  signupScreen?.classList.add('hidden');
  spaceScreen?.classList.remove('hidden');
});

modeOptions?.addEventListener('click', (event) => {
  const trigger = event.target.closest('button[data-type]');

  if (!(trigger instanceof HTMLButtonElement)) {
    return;
  }

  selectedType = trigger.dataset.type;

  document.querySelectorAll('.option-card').forEach((option) => {
    option.classList.remove('active');
  });

  trigger.classList.add('active');
  spaceActions?.classList.remove('hidden');

  const modeLabel = MODE_LABELS[selectedType];
  if (spaceModeLabel) {
    spaceModeLabel.textContent = `Mode: ${modeLabel}`;
  }

  if (spaceNameInput) {
    const defaultName =
      selectedType === 'individual'
        ? 'My personal council space'
        : selectedType === 'club'
          ? 'My investment club'
          : 'My class council';

    spaceNameInput.value = defaultName;
  }

  if (joinCodeInput) {
    joinCodeInput.value = '';
    joinCodeInput.setCustomValidity('');
  }

  const individualMode = selectedType === 'individual';
  if (joinSpaceButton) {
    joinSpaceButton.disabled = individualMode;
  }
  if (createSpaceButton) {
    createSpaceButton.textContent = individualMode ? 'Start personal space' : `Create ${selectedType} space`;
  }
});

spaceActions?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!selectedType || !currentUser?.id || !spaceNameInput?.value.trim()) {
    return;
  }

  const { space, membershipRole } = createSpace({
    type: selectedType,
    name: spaceNameInput.value.trim(),
    ownerId: currentUser.id,
  });

  showDashboard(space, membershipRole);
});

joinSpaceButton?.addEventListener('click', () => {
  if (!selectedType || !currentUser?.id || !joinCodeInput?.value.trim()) {
    return;
  }

  const result = joinSpace({
    code: joinCodeInput.value,
    userId: currentUser.id,
    expectedType: selectedType,
  });

  if (result.error) {
    const messages = {
      invalid_code_format: 'Join code format should be 6-8 letters/numbers.',
      code_not_found: 'No space found with that join code.',
      individual_not_joinable: 'Individual spaces cannot be joined.',
      wrong_space_type: 'That join code belongs to a different space type.',
    };

    joinCodeInput.setCustomValidity(messages[result.error] || 'Unable to join this space.');
    joinCodeInput.reportValidity();
    return;
  }

  joinCodeInput.setCustomValidity('');
  showDashboard(result.space, result.membershipRole);
});
