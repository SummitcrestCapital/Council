diff --git a/app.js b/app.js
index e1d8c66204aa316cd764cc533242796b60fb5148..3f864b0b0fefc38ac1039c549a514ae9b03fa8b9 100644
--- a/app.js
+++ b/app.js
@@ -1,63 +1,74 @@
+const SUPABASE_URL = 'https://seyhhqobsefkzmekwqjj.supabase.co';
+const SUPABASE_ANON_KEY = 'sb_publishable_9vlBuHDWJJdBJ9NuDlTWmg_4X2mDwIY';
+const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
+
 const DB_KEY = 'council-db-v6';
 const SECTORS = ['Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer'];
 const MIN_REQUIRED_SECTIONS = 7;
+const INDIVIDUAL_SPACE_SLUG = 'individual';
 
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
+const authTitle = document.querySelector('#auth-title');
+const authDescription = document.querySelector('#auth-description');
+const authSubmitBtn = document.querySelector('#auth-submit-btn');
+const authToggleBtn = document.querySelector('#auth-toggle-btn');
+const authModeInput = document.querySelector('#auth-mode');
+const authError = document.querySelector('#auth-error');
+const signOutBtn = document.querySelector('#signout-btn');
+
 const individualBtn = document.querySelector('#individual-btn');
 const clubBtn = document.querySelector('#club-btn');
 const classBtn = document.querySelector('#class-btn');
 const groupActions = document.querySelector('#group-actions');
 const groupTitle = document.querySelector('#group-title');
 const groupSpaceName = document.querySelector('#group-space-name');
 const groupDescription = document.querySelector('#group-description');
 const groupJoinCode = document.querySelector('#group-join-code');
-const createGroupBtn = document.querySelector('#create-group-btn');
 const joinGroupBtn = document.querySelector('#join-group-btn');
 
 const pickPmBtn = document.querySelector('#pick-pm-btn');
 const pickAnalystBtn = document.querySelector('#pick-analyst-btn');
-
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
@@ -75,169 +86,203 @@ const nextSlideBtn = document.querySelector('#next-slide-btn');
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
 
-let db = loadDb();
+let db = loadDb(); // legacy support for club/class
 let currentUser = null;
+let currentProfile = null;
 let activeSession = null;
 let currentSlideIndex = 0;
 let pendingSlideImages = null;
 let activeClub = null;
-let pendingClub = null;
 let currentContext = 'individual';
 let presentationSlidesHtml = [];
 let presentationIndex = 0;
+let individualSpace = null;
+let activeCycle = null;
+let activeParticipant = null;
+let authMode = 'signup';
 
 function loadDb() {
   const saved = localStorage.getItem(DB_KEY);
   if (!saved) return { users: [], sessions: [], spaces: [] };
-  try {
-    const parsed = JSON.parse(saved);
-    return {
-      users: Array.isArray(parsed.users) ? parsed.users : [],
-      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
-      spaces: Array.isArray(parsed.spaces) ? parsed.spaces : [],
-    };
-  } catch {
-    return { users: [], sessions: [], spaces: [] };
-  }
+  try { return JSON.parse(saved); } catch { return { users: [], sessions: [], spaces: [] }; }
 }
-
 const saveDb = () => localStorage.setItem(DB_KEY, JSON.stringify(db));
+
 const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
 const generateJoinCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
 const currentCycleName = () => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
 const cycleDeadline = () => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); };
 const daysUntilDeadline = () => Math.max(0, Math.ceil((cycleDeadline().getTime() - Date.now()) / 86400000));
-
 function escapeHtml(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
+function emptySlideResponses() { return Object.fromEntries(HUB_SLIDES.map((s) => [s.key, { input: '', extras: {}, images: [] }])); }
 
-function createUser({ fullName, email }) {
-  const user = { id: makeId('user'), fullName, email, createdAt: new Date().toISOString() };
-  db.users.push(user); saveDb(); return user;
+async function getCurrentUserProfile() {
+  if (!currentUser?.id) return null;
+  const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
+  if (error) throw error;
+  if (data) return data;
+  const { data: inserted, error: insertError } = await supabaseClient.from('profiles').insert({ id: currentUser.id, email: currentUser.email, full_name: currentUser.user_metadata?.full_name || '', onboarding_complete: false }).select('*').single();
+  if (insertError) throw insertError;
+  return inserted;
 }
 
-function emptySlideResponses() { return Object.fromEntries(HUB_SLIDES.map((s) => [s.key, { input: '', extras: {}, images: [] }])); }
+async function getUserMemberships() {
+  if (!currentUser?.id) return [];
+  const { data, error } = await supabaseClient.from('memberships').select('*').eq('user_id', currentUser.id);
+  if (error) throw error;
+  return data || [];
+}
 
-function getOrCreateSession(userId) {
-  const cycleName = currentCycleName();
-  let session = db.sessions.find((item) => item.userId === userId && item.cycleName === cycleName && !item.groupId);
-  if (!session) {
-    session = { id: makeId('session'), userId, cycleName, sector: SECTORS[Math.floor(Math.random() * SECTORS.length)], joinedCycle: false, joinedAt: null, ticker: '', tickerLocked: false, slideResponses: emptySlideResponses(), submittedAt: null, createdAt: new Date().toISOString() };
-    db.sessions.push(session); saveDb();
-  }
-  return session;
+async function getActiveCycleForSpace(spaceId) {
+  const { data, error } = await supabaseClient.from('cycles').select('*').eq('space_id', spaceId).eq('is_active', true).maybeSingle();
+  if (error) throw error;
+  return data || null;
 }
 
-function getOrCreateClubGroupSession({ userId, clubId, groupId, role, sector, ticker }) {
-  const cycleName = currentCycleName();
-  let session = db.sessions.find((item) => item.userId === userId && item.clubId === clubId && item.groupId === groupId && item.cycleName === cycleName);
-  if (!session) {
-    session = {
-      id: makeId('session'), userId, clubId, groupId, role,
-      cycleName, sector, joinedCycle: true, joinedAt: new Date().toISOString(),
-      ticker: ticker || '', tickerLocked: Boolean(ticker), slideResponses: emptySlideResponses(),
-      submittedAt: null, createdAt: new Date().toISOString(),
-    };
-    db.sessions.push(session); saveDb();
-  }
-  if (!session.slideResponses) session.slideResponses = emptySlideResponses();
-  return session;
+async function getOrCreateCycleParticipant(cycleId) {
+  const { data, error } = await supabaseClient.from('cycle_participants').select('*').eq('cycle_id', cycleId).eq('user_id', currentUser.id).maybeSingle();
+  if (error) throw error;
+  if (data) return data;
+  const { data: inserted, error: insertError } = await supabaseClient.from('cycle_participants').insert({ cycle_id: cycleId, user_id: currentUser.id, submission_status: 'in_progress' }).select('*').single();
+  if (insertError) throw insertError;
+  return inserted;
 }
 
-function createClub(name, description, ownerId) {
-  const code = generateJoinCode();
-  const club = { id: makeId('space'), type: 'club', name, description, joinCode: code, ownerId, currentCycle: currentCycleName(), members: [{ userId: ownerId, displayName: currentUser.fullName, role: 'executive' }], groups: [], pitches: [], createdAt: new Date().toISOString() };
-  db.spaces.push(club); saveDb(); return club;
+async function getPitchSections(cycleParticipantId) {
+  const { data, error } = await supabaseClient.from('pitch_sections').select('*').eq('cycle_participant_id', cycleParticipantId);
+  if (error) throw error;
+  return data || [];
 }
 
-function joinClubByCode(code, userId, displayName) {
-  const normalized = code.trim().toUpperCase();
-  let club = db.spaces.find((space) => space.type === 'club' && space.joinCode === normalized);
-  if (!club) {
-    club = { id: makeId('space'), type: 'club', name: `Test Club ${normalized}`, description: 'Auto-created test club', joinCode: normalized || generateJoinCode(), ownerId: userId, currentCycle: currentCycleName(), members: [], groups: [], pitches: [], createdAt: new Date().toISOString() };
-    db.spaces.push(club);
+async function savePitchSection(cycleParticipantId, sectionKey, payload) {
+  const { data, error } = await supabaseClient.from('pitch_sections').upsert({ cycle_participant_id: cycleParticipantId, section_key: sectionKey, content: payload.input, extras: payload.extras || {}, images: payload.images || [] }, { onConflict: 'cycle_participant_id,section_key' }).select('*').single();
+  if (error) throw error;
+  return data;
+}
+
+async function lockTickerSelection(cycleParticipantId, ticker, companyName) {
+  const { data, error } = await supabaseClient.from('cycle_participants').update({ ticker, company_name: companyName, ticker_locked: true, submission_status: 'in_progress' }).eq('id', cycleParticipantId).select('*').single();
+  if (error) throw error;
+  return data;
+}
+
+async function submitPitch(cycleParticipantId) {
+  const { data, error } = await supabaseClient.from('cycle_participants').update({ submission_status: 'submitted' }).eq('id', cycleParticipantId).select('*').single();
+  if (error) throw error;
+  return data;
+}
+
+async function ensureIndividualSpaceMembership() {
+  const { data: spaceData, error: spaceError } = await supabaseClient.from('spaces').select('*').eq('slug', INDIVIDUAL_SPACE_SLUG).maybeSingle();
+  if (spaceError) throw spaceError;
+  individualSpace = spaceData;
+  if (!individualSpace) throw new Error('Individual space not found.');
+
+  const memberships = await getUserMemberships();
+  const existing = memberships.find((m) => m.space_id === individualSpace.id);
+  if (!existing) {
+    const { error } = await supabaseClient.from('memberships').insert({ user_id: currentUser.id, space_id: individualSpace.id, role: 'member' });
+    if (error) throw error;
   }
-  pendingClub = { clubId: club.id, userId, displayName };
-  saveDb();
-  return club;
+  activeCycle = await getActiveCycleForSpace(individualSpace.id);
+  if (!activeCycle) throw new Error('No active cycle found for individual space.');
+  activeParticipant = await getOrCreateCycleParticipant(activeCycle.id);
+  hydrateLocalSession();
 }
 
-function addClubMemberRole(clubId, userId, displayName, role) {
-  const club = db.spaces.find((space) => space.id === clubId && space.type === 'club');
-  if (!club) return null;
-  const existing = club.members.find((m) => m.userId === userId);
-  if (existing) existing.role = role;
-  else club.members.push({ userId, displayName, role });
-  saveDb();
-  return club;
+function hydrateLocalSession() {
+  activeSession = {
+    id: `participant_${activeParticipant.id}`,
+    cycleName: activeCycle?.name || currentCycleName(),
+    sector: activeCycle?.sector || SECTORS[Math.floor(Math.random() * SECTORS.length)],
+    joinedCycle: true,
+    joinedAt: activeParticipant?.created_at || new Date().toISOString(),
+    ticker: activeParticipant?.ticker || '',
+    tickerLocked: Boolean(activeParticipant?.ticker_locked),
+    slideResponses: emptySlideResponses(),
+    submittedAt: activeParticipant?.submission_status === 'submitted' ? (activeParticipant.updated_at || new Date().toISOString()) : null,
+  };
 }
 
-function hideAllMainScreens() {
-  modeScreen.classList.add('hidden'); cycleScreen.classList.add('hidden'); pitchHub.classList.add('hidden'); groupHub.classList.add('hidden'); presentationView.classList.add('hidden'); clubRoleScreen.classList.add('hidden'); clubDashboard.classList.add('hidden');
+async function hydratePitchSections() {
+  if (!activeParticipant?.id) return;
+  const sections = await getPitchSections(activeParticipant.id);
+  for (const section of sections) {
+    activeSession.slideResponses[section.section_key] = {
+      input: section.content || '',
+      extras: section.extras || {},
+      images: section.images || [],
+    };
+  }
 }
 
+function hideAllMainScreens() {
+  modeScreen.classList.add('hidden');
+  cycleScreen.classList.add('hidden');
+  pitchHub.classList.add('hidden');
+  groupHub.classList.add('hidden');
+  presentationView.classList.add('hidden');
+  clubRoleScreen.classList.add('hidden');
+  clubDashboard.classList.add('hidden');
+}
 
 function setModeButtonActive(active) {
   [individualBtn, clubBtn, classBtn].forEach((btn) => {
     if (!btn) return;
-    if (btn.id === active) {
-      btn.classList.add('primary-btn');
-      btn.classList.remove('secondary');
-    } else {
-      btn.classList.remove('primary-btn');
-      btn.classList.add('secondary');
-    }
+    if (btn.id === active) { btn.classList.add('primary-btn'); btn.classList.remove('secondary'); }
+    else { btn.classList.remove('primary-btn'); btn.classList.add('secondary'); }
   });
 }
 
 function renderCycleStep() {
   cycleInfo.textContent = `${activeSession.cycleName} • Assigned sector: ${activeSession.sector}`;
-  joinCycleBtn.disabled = activeSession.joinedCycle;
-  joinCycleBtn.textContent = activeSession.joinedCycle ? 'Joined (locked)' : 'Join this cycle';
-  tickerStep.classList.toggle('hidden', !activeSession.joinedCycle);
+  joinCycleBtn.disabled = true;
+  joinCycleBtn.textContent = 'Joined (persisted)';
+  tickerStep.classList.remove('hidden');
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
 
 function renderImagePreview(images) { slideImagePreview.innerHTML = images.map((src) => `<img src="${src}" alt="Uploaded visual" class="preview-image" />`).join(''); }
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
@@ -248,298 +293,268 @@ function renderSlide() {
   renderImagePreview(response.images || []);
 
   slideExtraFields.classList.add('hidden');
   slideExtraFields.innerHTML = '';
   if (slide.extra === 'metrics') {
     const metrics = response.extras.metrics || ['', '', ''];
     slideExtraFields.classList.remove('hidden');
     slideExtraFields.innerHTML = `<h4>Optional: Add 2–3 metrics</h4><div class="mode-options"><input data-metric-index="0" placeholder="Metric 1" value="${escapeHtml(metrics[0] || '')}" /><input data-metric-index="1" placeholder="Metric 2" value="${escapeHtml(metrics[1] || '')}" /><input data-metric-index="2" placeholder="Metric 3" value="${escapeHtml(metrics[2] || '')}" /></div>`;
   }
   if (slide.extra === 'conclusion') {
     const rec = response.extras.recommendation || 'Watch';
     const horizon = response.extras.horizon || 'medium';
     const confidence = response.extras.confidence || '5';
     slideExtraFields.classList.remove('hidden');
     slideExtraFields.innerHTML = `<h4>Decision details</h4><div class="mode-options"><label>Recommendation<select id="conclusion-rec"><option ${rec === 'Buy' ? 'selected' : ''}>Buy</option><option ${rec === 'Watch' ? 'selected' : ''}>Watch</option><option ${rec === 'Avoid' ? 'selected' : ''}>Avoid</option></select></label><label>Time horizon<select id="conclusion-horizon"><option value="short" ${horizon === 'short' ? 'selected' : ''}>Short</option><option value="medium" ${horizon === 'medium' ? 'selected' : ''}>Medium</option><option value="long" ${horizon === 'long' ? 'selected' : ''}>Long</option></select></label><label>Confidence (1–10)<input id="conclusion-confidence" type="number" min="1" max="10" value="${escapeHtml(confidence)}" /></label></div>`;
   }
   prevSlideBtn.disabled = currentSlideIndex === 0;
   nextSlideBtn.disabled = currentSlideIndex === HUB_SLIDES.length - 1;
 }
 
 function renderProgress() {
   const completed = HUB_SLIDES.filter((slide) => activeSession.slideResponses[slide.key]?.input?.trim()).length;
   const percent = Math.round((completed / HUB_SLIDES.length) * 100);
   progressPercent.textContent = `${percent}% complete`;
   progressList.innerHTML = HUB_SLIDES.map((slide) => `<li>${activeSession.slideResponses[slide.key]?.input?.trim() ? '✅' : '⬜'} ${slide.title}</li>`).join('');
-
   const canSubmit = completed >= MIN_REQUIRED_SECTIONS && !activeSession.submittedAt;
-  const isAnalystContext = currentContext === 'club_group' && activeSession.role === 'analyst';
-  submitPitchBtn.disabled = !canSubmit || isAnalystContext;
+  submitPitchBtn.disabled = !canSubmit;
   viewPresentationBtn.classList.toggle('hidden', !activeSession.submittedAt);
-  if (isAnalystContext) submitNote.textContent = 'Analysts can contribute, but only Portfolio Managers can submit.';
-  else submitNote.textContent = activeSession.submittedAt ? 'Pitch submitted. Everything is now locked. You can now view your completed presentation.' : canSubmit ? 'Ready to submit your pitch.' : `Complete all ${MIN_REQUIRED_SECTIONS} sections to submit.`;
+  submitNote.textContent = activeSession.submittedAt ? 'Pitch submitted. Everything is now locked. You can now view your completed presentation.' : canSubmit ? 'Ready to submit your pitch.' : `Complete all ${MIN_REQUIRED_SECTIONS} sections to submit.`;
 }
 
 function renderPitchHub() {
   hideAllMainScreens();
   pitchHub.classList.remove('hidden');
   statusPill.textContent = statusForSession(activeSession);
   hubCycle.textContent = `Cycle: ${activeSession.cycleName}`;
   hubSector.textContent = `Sector: ${activeSession.sector}`;
   hubCountdown.textContent = `${daysUntilDeadline()} day(s) left in cycle`;
   hubTicker.textContent = `Ticker: ${activeSession.ticker}`;
-  hubCompany.textContent = `Company: ${activeSession.ticker || 'Not selected'} (name lookup coming soon)`;
+  hubCompany.textContent = `Company: ${activeParticipant?.company_name || activeSession.ticker || 'Not selected'}`;
   deadlineText.textContent = `${daysUntilDeadline()} days left to submit.`;
   renderProgress();
   renderSlide();
 }
 
 function renderPresentationDeck() {
   const responses = activeSession.slideResponses;
   const imageHtml = (images) => images?.length ? `<div class="presentation-images">${images.map((src) => `<img src="${src}" alt="Slide visual"/>`).join('')}</div>` : '';
   const s1 = responses.executive_summary || {}, s2 = responses.company_overview || {}, s3 = responses.industry_overview || {}, s4 = responses.stock_analysis || {}, s5 = responses.thesis || {}, s6 = responses.catalysts || {}, s7 = responses.conclusion || {};
   const bullets = (s1.input || '').split('\n').filter(Boolean).map((x) => `<li>${escapeHtml(x)}</li>`).join('');
   const metrics = (s4.extras?.metrics || []).filter(Boolean).map((m) => `<li>${escapeHtml(m)}</li>`).join('');
 
   presentationSlidesHtml = [
     `<article class="presentation-slide full-slide"><h3>Executive Summary</h3><p class="recommendation-text">${escapeHtml(s7.extras?.recommendation || 'Watch')}</p><ul>${bullets || `<li>${escapeHtml(s1.input || '')}</li>`}</ul>${imageHtml(s1.images)}</article>`,
     `<article class="presentation-slide full-slide two-col"><h3>Company Overview</h3><div><p>${escapeHtml(s2.input || '')}</p></div><div><p><strong>What they do</strong></p><p><strong>Revenue model</strong></p><p><strong>Key segments</strong></p></div>${imageHtml(s2.images)}</article>`,
     `<article class="presentation-slide full-slide"><h3>Industry Overview</h3><p>${escapeHtml(s3.input || '')}</p>${imageHtml(s3.images)}</article>`,
     `<article class="presentation-slide full-slide"><h3>Stock Analysis</h3><p>${escapeHtml(s4.input || '')}</p>${metrics ? `<ul>${metrics}</ul>` : ''}${imageHtml(s4.images)}</article>`,
     `<article class="presentation-slide full-slide thesis-slide"><h3>Thesis</h3><p>${escapeHtml(s5.input || '')}</p>${imageHtml(s5.images)}</article>`,
     `<article class="presentation-slide full-slide catalyst-split"><h3>Catalysts</h3><div class="split upside"><h4>Upside</h4><p>${escapeHtml(s6.input || '')}</p></div><div class="split risks"><h4>Risks</h4><p>${escapeHtml(s6.input || '')}</p></div>${imageHtml(s6.images)}</article>`,
     `<article class="presentation-slide full-slide"><h3>Conclusion</h3><p><strong>Recommendation:</strong> ${escapeHtml(s7.extras?.recommendation || 'Watch')}</p><p><strong>Confidence:</strong> ${escapeHtml(s7.extras?.confidence || '5')} / 10</p><p><strong>Time horizon:</strong> ${escapeHtml(s7.extras?.horizon || 'medium')}</p><p>${escapeHtml(s7.input || '')}</p>${imageHtml(s7.images)}</article>`,
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
   hideAllMainScreens();
   groupHub.classList.remove('hidden');
   groupHubTitle.textContent = 'Class mode';
   groupHubSubtitle.textContent = 'Class mode remains unchanged in this iteration.';
   groupHubCards.innerHTML = '<article class="dash-card"><h3>Coming soon</h3><p>Class workflows are unchanged for now.</p></article>';
 }
 
-function renderClubDashboard() {
-  if (!activeClub) return;
-  hideAllMainScreens();
-  clubDashboard.classList.remove('hidden');
-
-  const currentMember = activeClub.members.find((m) => m.userId === currentUser.id);
-  clubName.textContent = activeClub.name;
-  clubRoleLine.textContent = `Your role: ${currentMember?.role || 'member'}`;
-  clubCycle.textContent = activeClub.currentCycle;
-  clubMembers.innerHTML = activeClub.members.map((m) => `<li>${escapeHtml(m.displayName || m.userId)} — ${m.role}</li>`).join('');
-
-  const submitted = (activeClub.pitches || []).map((pitch) => `<li>${escapeHtml(pitch.groupName)} • ${escapeHtml(pitch.ticker)} • by ${escapeHtml(pitch.userName)}</li>`).join('');
-  clubPitches.innerHTML = submitted || '<li>No submitted pitches yet.</li>';
-
-  executiveControls.classList.toggle('hidden', currentMember?.role !== 'executive');
-
-  clubGroupsList.innerHTML = (activeClub.groups || []).map((group) => {
-    const isPm = currentMember?.role === 'portfolio_manager';
-    const canEnter = currentMember?.role === 'analyst' || currentMember?.role === 'portfolio_manager';
-    return `
-      <div class="section-card">
-        <strong>${escapeHtml(group.name)}</strong>
-        <p>Sector: ${escapeHtml(group.sector)}</p>
-        <p>Members: ${escapeHtml((group.memberNames || []).join(', ') || 'None')}</p>
-        ${isPm ? `<label>Stock ticker<input data-group-stock="${group.id}" value="${escapeHtml(group.stockTicker || '')}" placeholder="AAPL" /></label><button data-save-stock="${group.id}" class="secondary" type="button">Save stock</button>` : ''}
-        ${canEnter ? `<button data-open-group="${group.id}" class="primary-btn" type="button">Open Group Hub</button>` : ''}
-      </div>
-    `;
-  }).join('') || '<p>No groups yet.</p>';
-}
+// Legacy local club behavior preserved
+function createUser({ fullName, email }) { const user = { id: makeId('user'), fullName, email }; db.users.push(user); saveDb(); return user; }
+function createClub(name, description, ownerId) { const club = { id: makeId('space'), type: 'club', name, description, joinCode: generateJoinCode(), ownerId, currentCycle: currentCycleName(), members: [{ userId: ownerId, displayName: currentUser?.fullName || 'Member', role: 'executive' }], groups: [], pitches: [] }; db.spaces.push(club); saveDb(); return club; }
+function joinClubByCode(code, userId, displayName) { const normalized = code.trim().toUpperCase(); let club = db.spaces.find((space) => space.type === 'club' && space.joinCode === normalized); if (!club) { club = { id: makeId('space'), type: 'club', name: `Test Club ${normalized}`, description: 'Auto-created test club', joinCode: normalized, ownerId: userId, currentCycle: currentCycleName(), members: [], groups: [], pitches: [] }; db.spaces.push(club); } saveDb(); return club; }
+function addClubMemberRole(clubId, userId, displayName, role) { const club = db.spaces.find((space) => space.id === clubId && space.type === 'club'); if (!club) return null; const existing = club.members.find((m) => m.userId === userId); if (existing) existing.role = role; else club.members.push({ userId, displayName, role }); saveDb(); return club; }
+function renderClubDashboard() { if (!activeClub) return; hideAllMainScreens(); clubDashboard.classList.remove('hidden'); const currentMember = activeClub.members.find((m) => m.userId === currentUser.id); clubName.textContent = activeClub.name; clubRoleLine.textContent = `Your role: ${currentMember?.role || 'member'}`; clubCycle.textContent = activeClub.currentCycle; clubMembers.innerHTML = activeClub.members.map((m) => `<li>${escapeHtml(m.displayName || m.userId)} — ${m.role}</li>`).join(''); clubPitches.innerHTML = (activeClub.pitches || []).map((pitch) => `<li>${escapeHtml(pitch.groupName)} • ${escapeHtml(pitch.ticker)} • by ${escapeHtml(pitch.userName)}</li>`).join('') || '<li>No submitted pitches yet.</li>'; executiveControls.classList.toggle('hidden', currentMember?.role !== 'executive'); clubGroupsList.innerHTML = (activeClub.groups || []).map((group) => `<div class="section-card"><strong>${escapeHtml(group.name)}</strong><p>Sector: ${escapeHtml(group.sector)}</p></div>`).join('') || '<p>No groups yet.</p>'; }
 
-// Events
-signupForm?.addEventListener('submit', (event) => {
-  event.preventDefault();
-  const formData = new FormData(signupForm);
-  currentUser = createUser({ fullName: String(formData.get('fullName') || '').trim(), email: String(formData.get('email') || '').trim() });
+async function routeAuthenticatedUser() {
+  currentProfile = await getCurrentUserProfile();
   signupScreen.classList.add('hidden');
   modeScreen.classList.remove('hidden');
-});
+  signOutBtn.classList.remove('hidden');
 
-individualBtn?.addEventListener('click', () => {
-  if (!currentUser?.id) return;
-  setModeButtonActive('individual-btn');
-  currentContext = 'individual';
-  activeSession = getOrCreateSession(currentUser.id);
-  currentSlideIndex = 0;
-  hideAllMainScreens();
-  cycleScreen.classList.remove('hidden');
-  groupActions.classList.add('hidden');
-  renderCycleStep();
-  if (activeSession.tickerLocked) renderPitchHub();
-});
+  if (!currentProfile?.onboarding_complete) {
+    hideAllMainScreens();
+    modeScreen.classList.remove('hidden');
+    return;
+  }
 
-clubBtn?.addEventListener('click', () => {
-  setModeButtonActive('club-btn');
-  hideAllMainScreens();
-  modeScreen.classList.remove('hidden');
-  groupActions.classList.remove('hidden');
-  groupTitle.textContent = 'Club setup';
-});
+  await ensureIndividualSpaceMembership();
+  await hydratePitchSections();
 
-classBtn?.addEventListener('click', () => { setModeButtonActive('class-btn'); renderClassPlaceholder(); });
+  if (activeParticipant?.submission_status === 'submitted' || activeParticipant?.ticker_locked) {
+    renderPitchHub();
+  } else if (activeParticipant?.ticker) {
+    hideAllMainScreens();
+    cycleScreen.classList.remove('hidden');
+    renderCycleStep();
+  } else {
+    hideAllMainScreens();
+    modeScreen.classList.remove('hidden');
+  }
+}
 
-groupActions?.addEventListener('submit', (event) => {
-  event.preventDefault();
-  if (!currentUser?.id || !groupSpaceName.value.trim()) return;
-  activeClub = createClub(groupSpaceName.value.trim(), groupDescription.value.trim(), currentUser.id);
-  pendingClub = null;
-  renderClubDashboard();
-});
+function setAuthMode(mode) {
+  authMode = mode;
+  authModeInput.value = mode;
+  const isSignup = mode === 'signup';
+  authTitle.textContent = isSignup ? 'Create your account' : 'Welcome back';
+  authDescription.textContent = isSignup ? 'Start your council journey in under a minute.' : 'Sign in to continue your saved council progress.';
+  authSubmitBtn.textContent = isSignup ? 'Create account' : 'Sign in';
+  authToggleBtn.textContent = isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up';
+}
 
-joinGroupBtn?.addEventListener('click', () => {
-  if (!currentUser?.id || !groupJoinCode.value.trim()) return;
-  activeClub = joinClubByCode(groupJoinCode.value, currentUser.id, currentUser.fullName);
-  hideAllMainScreens();
-  clubRoleScreen.classList.remove('hidden');
-});
+signupForm?.addEventListener('submit', async (event) => {
+  event.preventDefault();
+  authError.textContent = '';
+  const formData = new FormData(signupForm);
+  const fullName = String(formData.get('fullName') || '').trim();
+  const email = String(formData.get('email') || '').trim();
+  const password = String(formData.get('password') || '');
 
-pickPmBtn?.addEventListener('click', () => {
-  if (!activeClub || !currentUser?.id) return;
-  activeClub = addClubMemberRole(activeClub.id, currentUser.id, currentUser.fullName, 'portfolio_manager');
-  renderClubDashboard();
+  try {
+    if (authMode === 'signup') {
+      const { error } = await supabaseClient.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
+      if (error) throw error;
+    } else {
+      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
+      if (error) throw error;
+    }
+  } catch (error) {
+    authError.textContent = error.message || 'Authentication failed.';
+  }
 });
 
-pickAnalystBtn?.addEventListener('click', () => {
-  if (!activeClub || !currentUser?.id) return;
-  activeClub = addClubMemberRole(activeClub.id, currentUser.id, currentUser.fullName, 'analyst');
-  renderClubDashboard();
-});
+authToggleBtn?.addEventListener('click', () => setAuthMode(authMode === 'signup' ? 'signin' : 'signup'));
+signOutBtn?.addEventListener('click', async () => { await supabaseClient.auth.signOut(); });
 
-createClubGroupBtn?.addEventListener('click', () => {
-  if (!activeClub || !clubGroupName.value.trim()) return;
-  const memberNames = clubGroupMembers.value.split(',').map((x) => x.trim()).filter(Boolean);
-  activeClub.groups.push({ id: makeId('group'), name: clubGroupName.value.trim(), sector: clubGroupSector.value, memberNames, stockTicker: '', submittedBy: null });
-  saveDb();
-  renderClubDashboard();
-});
+individualBtn?.addEventListener('click', async () => {
+  if (!currentUser?.id) return;
+  setModeButtonActive('individual-btn');
+  currentContext = 'individual';
 
-clubGroupsList?.addEventListener('click', (event) => {
-  const saveStockBtn = event.target.closest('button[data-save-stock]');
-  if (saveStockBtn) {
-    const group = activeClub.groups.find((g) => g.id === saveStockBtn.dataset.saveStock);
-    const input = clubGroupsList.querySelector(`input[data-group-stock="${group.id}"]`);
-    group.stockTicker = input?.value.trim().toUpperCase() || '';
-    saveDb();
-    renderClubDashboard();
-    return;
+  if (!currentProfile?.onboarding_complete) {
+    const { data, error } = await supabaseClient.from('profiles').update({ onboarding_complete: true }).eq('id', currentUser.id).select('*').single();
+    if (!error) currentProfile = data;
   }
 
-  const openGroupBtn = event.target.closest('button[data-open-group]');
-  if (openGroupBtn) {
-    const group = activeClub.groups.find((g) => g.id === openGroupBtn.dataset.openGroup);
-    if (!group) return;
-    const member = activeClub.members.find((m) => m.userId === currentUser.id);
-    currentContext = 'club_group';
-    activeSession = getOrCreateClubGroupSession({ userId: currentUser.id, clubId: activeClub.id, groupId: group.id, role: member?.role || 'analyst', sector: group.sector, ticker: group.stockTicker });
-    activeSession.ticker = group.stockTicker;
-    activeSession.tickerLocked = Boolean(group.stockTicker);
-    renderPitchHub();
-  }
+  await ensureIndividualSpaceMembership();
+  await hydratePitchSections();
+  currentSlideIndex = 0;
+  hideAllMainScreens();
+
+  if (activeSession.tickerLocked || activeParticipant?.submission_status === 'submitted') renderPitchHub();
+  else { cycleScreen.classList.remove('hidden'); renderCycleStep(); }
 });
 
-joinCycleBtn?.addEventListener('click', () => {
-  if (!activeSession || activeSession.joinedCycle) return;
-  activeSession.joinedCycle = true;
-  activeSession.joinedAt = new Date().toISOString();
-  saveDb();
+clubBtn?.addEventListener('click', () => { setModeButtonActive('club-btn'); hideAllMainScreens(); modeScreen.classList.remove('hidden'); groupActions.classList.remove('hidden'); groupTitle.textContent = 'Club setup'; });
+classBtn?.addEventListener('click', () => { setModeButtonActive('class-btn'); renderClassPlaceholder(); });
+
+groupActions?.addEventListener('submit', (event) => { event.preventDefault(); if (!currentUser?.id || !groupSpaceName.value.trim()) return; activeClub = createClub(groupSpaceName.value.trim(), groupDescription.value.trim(), currentUser.id); renderClubDashboard(); });
+joinGroupBtn?.addEventListener('click', () => { if (!currentUser?.id || !groupJoinCode.value.trim()) return; activeClub = joinClubByCode(groupJoinCode.value, currentUser.id, currentUser.user_metadata?.full_name || 'Member'); hideAllMainScreens(); clubRoleScreen.classList.remove('hidden'); });
+pickPmBtn?.addEventListener('click', () => { if (!activeClub || !currentUser?.id) return; activeClub = addClubMemberRole(activeClub.id, currentUser.id, currentUser.user_metadata?.full_name || 'Member', 'portfolio_manager'); renderClubDashboard(); });
+pickAnalystBtn?.addEventListener('click', () => { if (!activeClub || !currentUser?.id) return; activeClub = addClubMemberRole(activeClub.id, currentUser.id, currentUser.user_metadata?.full_name || 'Member', 'analyst'); renderClubDashboard(); });
+createClubGroupBtn?.addEventListener('click', () => { if (!activeClub || !clubGroupName.value.trim()) return; const memberNames = clubGroupMembers.value.split(',').map((x) => x.trim()).filter(Boolean); activeClub.groups.push({ id: makeId('group'), name: clubGroupName.value.trim(), sector: clubGroupSector.value, memberNames, stockTicker: '', submittedBy: null }); saveDb(); renderClubDashboard(); });
+
+joinCycleBtn?.addEventListener('click', async () => {
+  if (!activeCycle?.id) return;
+  await ensureIndividualSpaceMembership();
+  await hydratePitchSections();
   renderCycleStep();
 });
 
 lockTickerBtn?.addEventListener('click', () => {
-  if (!activeSession?.joinedCycle || activeSession.tickerLocked) return;
+  if (!activeSession || activeSession.tickerLocked) return;
   const ticker = tickerInput.value.trim().toUpperCase();
   if (!/^[A-Z]{1,8}$/.test(ticker)) { tickerInput.setCustomValidity('Enter a valid stock ticker (letters only, max 8).'); tickerInput.reportValidity(); return; }
   tickerInput.setCustomValidity('');
   activeSession.ticker = ticker;
   lockModal.classList.remove('hidden');
 });
 
-confirmLockBtn?.addEventListener('click', () => {
-  if (!activeSession?.ticker) return;
+confirmLockBtn?.addEventListener('click', async () => {
+  if (!activeSession?.ticker || !activeParticipant?.id) return;
+  activeParticipant = await lockTickerSelection(activeParticipant.id, activeSession.ticker, activeSession.ticker);
   activeSession.tickerLocked = true;
-  saveDb();
   lockModal.classList.add('hidden');
   renderPitchHub();
 });
 cancelLockBtn?.addEventListener('click', () => lockModal.classList.add('hidden'));
 
 prevSlideBtn?.addEventListener('click', () => { if (currentSlideIndex > 0) { currentSlideIndex -= 1; renderSlide(); } });
 nextSlideBtn?.addEventListener('click', () => { if (currentSlideIndex < HUB_SLIDES.length - 1) { currentSlideIndex += 1; renderSlide(); } });
 
-toggleShortcutsBtn?.addEventListener('click', () => {
-  slideShortcuts.classList.toggle('hidden');
-  toggleShortcutsBtn.textContent = slideShortcuts.classList.contains('hidden') ? 'Show research shortcuts' : 'Hide research shortcuts';
-});
+toggleShortcutsBtn?.addEventListener('click', () => { slideShortcuts.classList.toggle('hidden'); toggleShortcutsBtn.textContent = slideShortcuts.classList.contains('hidden') ? 'Show research shortcuts' : 'Hide research shortcuts'; });
 
 slideImageUpload?.addEventListener('change', async () => {
   if (!slideImageUpload.files?.length) { pendingSlideImages = null; return; }
   const files = [...slideImageUpload.files];
   if (files.length > 3) { slideImageUpload.setCustomValidity('Please upload between 1 and 3 images.'); slideImageUpload.reportValidity(); return; }
   slideImageUpload.setCustomValidity('');
   pendingSlideImages = await readFilesAsDataUrls(files);
   renderImagePreview(pendingSlideImages);
 });
 
-saveSlideBtn?.addEventListener('click', () => {
-  if (!activeSession || activeSession.submittedAt) return;
+saveSlideBtn?.addEventListener('click', async () => {
+  if (!activeSession || activeSession.submittedAt || !activeParticipant?.id) return;
   const slide = HUB_SLIDES[currentSlideIndex];
   const response = activeSession.slideResponses[slide.key] || { input: '', extras: {}, images: [] };
   response.input = slideInput.value.trim();
   if (pendingSlideImages?.length) response.images = pendingSlideImages.slice(0, 3);
-
   if (slide.extra === 'metrics') response.extras.metrics = [...slideExtraFields.querySelectorAll('[data-metric-index]')].map((input) => input.value.trim());
   if (slide.extra === 'conclusion') {
     response.extras.recommendation = slideExtraFields.querySelector('#conclusion-rec')?.value || 'Watch';
     response.extras.horizon = slideExtraFields.querySelector('#conclusion-horizon')?.value || 'medium';
     response.extras.confidence = slideExtraFields.querySelector('#conclusion-confidence')?.value || '5';
   }
-
   activeSession.slideResponses[slide.key] = response;
+  await savePitchSection(activeParticipant.id, slide.key, response);
   pendingSlideImages = null;
-  saveDb();
   renderPitchHub();
 });
 
-submitPitchBtn?.addEventListener('click', () => {
-  if (!activeSession || activeSession.submittedAt) return;
+submitPitchBtn?.addEventListener('click', async () => {
+  if (!activeSession || activeSession.submittedAt || !activeParticipant?.id) return;
   const completed = HUB_SLIDES.filter((slide) => activeSession.slideResponses[slide.key]?.input?.trim()).length;
   if (completed < MIN_REQUIRED_SECTIONS) return;
+  activeParticipant = await submitPitch(activeParticipant.id);
   activeSession.submittedAt = new Date().toISOString();
-
-  if (currentContext === 'club_group' && activeSession.role === 'portfolio_manager') {
-    const group = activeClub.groups.find((g) => g.id === activeSession.groupId);
-    if (group) {
-      activeClub.pitches.push({ groupId: group.id, groupName: group.name, ticker: activeSession.ticker, userName: currentUser.fullName, submittedAt: activeSession.submittedAt });
-      saveDb();
-    }
-  }
-
-  saveDb();
   renderPitchHub();
 });
 
-viewPresentationBtn?.addEventListener('click', () => {
-  if (!activeSession?.submittedAt) return;
-  hideAllMainScreens();
-  presentationView.classList.remove('hidden');
-  renderPresentationDeck();
-});
-
+viewPresentationBtn?.addEventListener('click', () => { if (!activeSession?.submittedAt) return; hideAllMainScreens(); presentationView.classList.remove('hidden'); renderPresentationDeck(); });
 backToHubBtn?.addEventListener('click', () => renderPitchHub());
 presentationPrevBtn?.addEventListener('click', () => { if (presentationIndex > 0) { presentationIndex -= 1; renderPresentationPage(); } });
 presentationNextBtn?.addEventListener('click', () => { if (presentationIndex < presentationSlidesHtml.length - 1) { presentationIndex += 1; renderPresentationPage(); } });
+
+(async function boot() {
+  setAuthMode('signup');
+  const { data } = await supabaseClient.auth.getSession();
+  currentUser = data.session?.user || null;
+
+  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
+    currentUser = session?.user || null;
+    if (!currentUser) {
+      signOutBtn.classList.add('hidden');
+      hideAllMainScreens();
+      signupScreen.classList.remove('hidden');
+      modeScreen.classList.add('hidden');
+      return;
+    }
+    await routeAuthenticatedUser();
+  });
+
+  if (currentUser) await routeAuthenticatedUser();
+})();
