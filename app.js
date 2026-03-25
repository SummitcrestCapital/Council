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

const ROLES = {
  INDIVIDUAL: 'individual',
  MEMBER: 'member',
  LEADER: 'leader',
  STUDENT: 'student',
  TEACHER: 'teacher',
};

const PERMISSIONS = {
  VIEW: 'view',
  SUBMIT: 'submit',
  CREATE_CYCLE: 'create_cycle',
  CREATE_ASSIGNMENT: 'create_assignment',
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
