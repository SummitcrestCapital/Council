const DB_KEY = 'council-db-v1';

const signupForm = document.querySelector('#signup-form');
const signupScreen = document.querySelector('#signup-screen');
const spaceScreen = document.querySelector('#space-screen');
const modeOptions = document.querySelector('#mode-options');
const spaceActions = document.querySelector('#space-actions');
const spaceModeLabel = document.querySelector('#space-mode-label');
const spaceNameInput = document.querySelector('#space-name');
const joinCodeInput = document.querySelector('#join-code');
const joinSpaceButton = document.querySelector('#join-space-btn');
const createSpaceButton = document.querySelector('#create-space-btn');
const dashboardScreen = document.querySelector('#dashboard-screen');
const dashboardTitle = document.querySelector('#dashboard-title');
const dashboardSubtitle = document.querySelector('#dashboard-subtitle');
const dashboardGrid = document.querySelector('#dashboard-grid');

const MODE_LABELS = {
  individual: 'Learn on your own',
  club: 'Join a club',
  class: 'Join a class',
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
  const space = {
    id: makeId('space'),
    type,
    name,
    joinCode: generateJoinCode(),
    ownerId,
    members: [
      {
        userId: ownerId,
        role: 'owner',
        joinedAt: now,
      },
    ],
    role: 'owner',
    createdAt: now,
  };

  db.spaces.push(space);
  saveDb();

  return space;
}

function joinSpace({ code, userId }) {
  const normalized = code.trim().toUpperCase();
  const space = db.spaces.find((candidate) => candidate.joinCode === normalized);

  if (!space) {
    return null;
  }

  const alreadyMember = space.members.some((member) => member.userId === userId);

  if (!alreadyMember) {
    space.members.push({
      userId,
      role: 'member',
      joinedAt: new Date().toISOString(),
    });

    saveDb();
  }

  return space;
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

function renderIndividualDashboard(space) {
  return [
    createCard('Welcome message', `<p>Welcome back, ${currentUser?.fullName || 'Investor'}.</p>`),
    createCard('Current progress', '<p>Cycle 1 progress: <strong>20%</strong> complete.</p>'),
    createCard('Current council cycle', '<button class="cta-btn" type="button">Join current council cycle</button>'),
    createCard('Pitches', '<p class="placeholder">Pitch workspace placeholder.</p>'),
    createCard('Leaderboard', '<p class="placeholder">Leaderboard placeholder.</p>'),
    createCard('Space info', `<p>Space name: <strong>${space.name}</strong><br/>Join code: <strong>${space.joinCode}</strong></p>`),
  ].join('');
}

function renderClubDashboard(space, membershipRole) {
  const membersHtml = space.members
    .map((member) => `<li>${findUserName(member.userId)} — ${member.role}</li>`)
    .join('');

  return [
    createCard('Club name', `<p><strong>${space.name}</strong></p>`),
    createCard('Members', `<ul>${membersHtml || '<li>No members yet.</li>'}</ul>`),
    createCard('Cycle section', '<p class="placeholder">Club cycle planning placeholder.</p>'),
    createCard('Leaderboard', '<p class="placeholder">Leaderboard placeholder.</p>'),
    createCard('Join code', `<p>Share this code: <strong>${space.joinCode}</strong></p>`),
    createCard(
      'Admin controls',
      membershipRole === 'owner'
        ? '<p>Leader controls: invite members, start cycle, manage submissions.</p>'
        : '<p>You are a member. Leader controls appear for club owners.</p>',
    ),
  ].join('');
}

function renderClassDashboard(space, membershipRole) {
  const rosterHtml = space.members
    .map((member) => `<li>${findUserName(member.userId)} — ${member.role === 'owner' ? 'teacher' : 'student'}</li>`)
    .join('');

  return [
    createCard('Class name', `<p><strong>${space.name}</strong></p>`),
    createCard('Assignments', '<p class="placeholder">Assignments section placeholder.</p>'),
    createCard('Student roster', `<ul>${rosterHtml || '<li>No students yet.</li>'}</ul>`),
    createCard('Due dates', '<ul><li>Pitch 1 — Apr 10</li><li>Reflection — Apr 17</li></ul>'),
    createCard(
      'Teacher controls',
      membershipRole === 'owner'
        ? '<p>Teacher controls: publish assignments, grade submissions, lock deadlines.</p>'
        : '<p>Teacher controls are visible for class owners.</p>',
    ),
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
    dashboardGrid.innerHTML = renderIndividualDashboard(space);
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
  }

  const individualMode = selectedType === 'individual';
  if (joinSpaceButton) {
    joinSpaceButton.disabled = individualMode;
  }
  if (createSpaceButton) {
    createSpaceButton.textContent = individualMode ? 'Start personal space' : 'Create new space';
  }
});

spaceActions?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!selectedType || !currentUser?.id || !spaceNameInput?.value.trim()) {
    return;
  }

  const space = createSpace({
    type: selectedType,
    name: spaceNameInput.value.trim(),
    ownerId: currentUser.id,
  });

  showDashboard(space, 'owner');
});

joinSpaceButton?.addEventListener('click', () => {
  if (!selectedType || !currentUser?.id || !joinCodeInput?.value.trim()) {
    return;
  }

  const space = joinSpace({
    code: joinCodeInput.value,
    userId: currentUser.id,
  });

  if (!space) {
    joinCodeInput.setCustomValidity('No space found with that join code.');
    joinCodeInput.reportValidity();
    return;
  }

  joinCodeInput.setCustomValidity('');
  showDashboard(space, 'member');
});
