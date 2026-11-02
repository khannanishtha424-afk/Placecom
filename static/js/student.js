// HSB Student Development Program — Student Portal JS

let currentYear = 2026;
let currentMonth = 10;
let selectedPeriodId = null;
let currentEvaluation = null;
let activeAttributeType = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.isAuthenticated()) {
    window.location.href = '/';
    return;
  }

  const user = API.getUser();
  if (user && user.role !== 'student') {
    // If management accidentally accesses student portal, allow with notice
    console.log('Viewing as management user');
  }

  await loadStudentProfile();
  await loadPeriodsOverview(currentYear, currentMonth);
});

async function loadStudentProfile() {
  try {
    const student = await API.request('/student/me');
    document.getElementById('studentNameDisplay').textContent = student.name;
    document.getElementById('studentGreeting').textContent = `Welcome, ${student.name}`;
    document.getElementById('studentIdDisplay').textContent = `${student.student_id} · ${student.cohort}`;
    document.getElementById('studentCohortBadge').textContent = student.cohort;
    if (student.mentor_name) {
      document.getElementById('mentorDisplay').textContent = student.mentor_name;
    }
  } catch (err) {
    console.warn('Could not load student profile directly:', err);
    const u = API.getUser();
    if (u) {
      document.getElementById('studentNameDisplay').textContent = u.full_name || 'Student';
    }
  }
}

async function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  } else if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  await loadPeriodsOverview(currentYear, currentMonth);
}

async function loadPeriodsOverview(year, month) {
  try {
    const data = await API.getStudentPeriodsOverview(year, month);
    document.getElementById('calendarMonthLabel').textContent = data.month_name;

    const grid = document.getElementById('weekCardsGrid');
    grid.innerHTML = '';

    let defaultSelectPeriod = null;

    data.periods.forEach(p => {
      const card = document.createElement('div');
      card.id = `week-card-${p.period_id}`;
      
      let badgeClass = 'badge-gray';
      if (p.status_color === 'green') badgeClass = 'badge-green';
      else if (p.status_color === 'yellow') badgeClass = 'badge-yellow';
      else if (p.status_color === 'red') badgeClass = 'badge-red';
      else if (p.status_color === 'blue') badgeClass = 'badge-blue';

      const isCurrentPill = p.is_current ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">CURRENT WEEK</span>` : '';
      const readOnlyNote = p.is_future ? `<p class="text-[10px] text-slate-400 mt-1 italic">Read-only until week opens</p>` : '';

      card.className = `p-4 rounded-xl border bg-white transition cursor-pointer card-hover ${
        p.is_current ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
      }`;

      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-900">Week ${p.week_number}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}">
            ${p.status_label}
          </span>
        </div>
        <div class="text-sm font-semibold text-slate-800">${p.start_date.split('-').slice(1).join('/')} – ${p.end_date.split('-').slice(1).join('/')}</div>
        <div class="text-xs text-slate-500 mt-0.5">${p.month_name} ${p.year}</div>
        <div class="mt-3 flex items-center justify-between">
          ${isCurrentPill}
          <span class="text-[11px] font-medium text-blue-900 hover:underline">Select week &rarr;</span>
        </div>
        ${readOnlyNote}
      `;

      card.onclick = () => selectWeek(p.period_id, p);
      grid.appendChild(card);

      if (p.is_current || (!defaultSelectPeriod && !p.is_future)) {
        defaultSelectPeriod = p;
      }
    });

    if (defaultSelectPeriod) {
      selectWeek(defaultSelectPeriod.period_id, defaultSelectPeriod);
    } else if (data.periods.length > 0) {
      selectWeek(data.periods[0].period_id, data.periods[0]);
    }
  } catch (err) {
    console.error('Failed to load periods overview:', err);
  }
}

async function selectWeek(periodId, periodData) {
  selectedPeriodId = periodId;

  // Highlight card
  document.querySelectorAll('[id^="week-card-"]').forEach(el => {
    el.classList.remove('border-blue-600', 'ring-2', 'ring-blue-200');
  });
  const activeCard = document.getElementById(`week-card-${periodId}`);
  if (activeCard) {
    activeCard.classList.add('border-blue-600', 'ring-2', 'ring-blue-200');
  }

  // Update header
  document.getElementById('selectedWeekBadge').textContent = `Week ${periodData.week_number}`;
  document.getElementById('selectedWeekTitle').textContent = `Attributes · ${periodData.title}`;

  await loadWeekAttributes(periodId);
}

async function loadWeekAttributes(periodId) {
  try {
    const evalData = await API.getPeriodEvaluation(periodId);
    currentEvaluation = evalData;

    // Update overall badge
    const overallPill = document.getElementById('overallWeekStatusPill');
    overallPill.textContent = evalData.classification;
    if (evalData.classification === 'Fully compliant') {
      overallPill.className = 'font-bold px-2.5 py-0.5 rounded-full badge-green';
    } else if (evalData.classification === 'Partially compliant') {
      overallPill.className = 'font-bold px-2.5 py-0.5 rounded-full badge-yellow';
    } else if (evalData.classification === 'No targets met') {
      overallPill.className = 'font-bold px-2.5 py-0.5 rounded-full badge-red';
    } else {
      overallPill.className = 'font-bold px-2.5 py-0.5 rounded-full badge-gray';
    }

    renderAttributeCards(evalData.attributes);
  } catch (err) {
    console.error('Failed to load week attributes:', err);
  }
}

function renderAttributeCards(attributes) {
  const container = document.getElementById('attributeCardsGrid');
  container.innerHTML = '';

  const attrMeta = {
    linkedin: { icon: 'fa-brands fa-linkedin', color: 'text-blue-600', bg: 'bg-blue-50', targetDesc: 'Monthly target: 2 published posts' },
    projects: { icon: 'fa-solid fa-laptop-code', color: 'text-indigo-600', bg: 'bg-indigo-50', targetDesc: 'Weekly timeline & initiation tracking' },
    competitions: { icon: 'fa-solid fa-trophy', color: 'text-amber-600', bg: 'bg-amber-50', targetDesc: 'Weekly participation update' },
    activities: { icon: 'fa-solid fa-users', color: 'text-emerald-600', bg: 'bg-emerald-50', targetDesc: 'Weekly activity timeline & contribution' },
    certifications: { icon: 'fa-solid fa-certificate', color: 'text-purple-600', bg: 'bg-purple-50', targetDesc: 'Monthly completion target + weekly timeline' },
    networking: { icon: 'fa-solid fa-handshake', color: 'text-teal-600', bg: 'bg-teal-50', targetDesc: 'Weekly target: 2 meaningful conversations' }
  };

  for (const [attrKey, attrData] of Object.entries(attributes)) {
    const meta = attrMeta[attrKey] || { icon: 'fa-solid fa-folder', color: 'text-slate-600', bg: 'bg-slate-50', targetDesc: '' };
    
    let statusBadgeClass = 'badge-gray';
    let statusText = 'Pending';
    if (attrData.status === 'green') {
      statusBadgeClass = 'badge-green';
      statusText = 'Green · On Track';
    } else if (attrData.status === 'yellow') {
      statusBadgeClass = 'badge-yellow';
      statusText = 'Yellow · Partial';
    } else if (attrData.status === 'red') {
      statusBadgeClass = 'badge-red';
      statusText = 'Red · Action Req.';
    }

    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between card-hover space-y-4';

    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center text-lg">
              <i class="${meta.icon}"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">${attrData.name}</h4>
              <p class="text-[11px] text-slate-500">${meta.targetDesc}</p>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadgeClass}">
            ${statusText}
          </span>
        </div>

        <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium">Status & Progress:</span>
          <span class="font-bold text-slate-800">${attrData.progress_display || attrData.target_achievement || 'Updated'}</span>
        </div>

        <div class="text-xs text-slate-600 leading-relaxed bg-white p-2 rounded border border-slate-100">
          <span class="font-medium text-slate-700">Reason:</span> ${attrData.reason}
        </div>
      </div>

      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <button onclick="viewAttributeRecords('${attrKey}', '${attrData.name}')" class="text-slate-600 hover:text-blue-900 font-medium flex items-center space-x-1">
          <i class="fa-solid fa-list-ul"></i>
          <span>View Log (${attrData.records ? attrData.records.length : 0})</span>
        </button>
        <button onclick="openEntryModal('${attrKey}', '${attrData.name}')" class="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium shadow-sm flex items-center space-x-1 transition">
          <i class="fa-solid fa-plus text-[10px]"></i>
          <span>Add / Update</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  }
}

// Data Entry Modal logic (BR-UI-03)
function openEntryModal(attrType, attrName, existingRecord = null) {
  activeAttributeType = attrType;
  document.getElementById('formAttrType').value = attrType;
  document.getElementById('formPeriodId').value = selectedPeriodId || '';
  document.getElementById('formRecordId').value = existingRecord ? existingRecord.id : '';
  document.getElementById('modalTitle').textContent = existingRecord ? `Edit ${attrName} Record` : `Add ${attrName} Record`;
  document.getElementById('formErrorBox').classList.add('hidden');

  const container = document.getElementById('dynamicFormFields');
  container.innerHTML = generateFormHTML(attrType, existingRecord);

  document.getElementById('entryModal').classList.remove('hidden');
}

function closeEntryModal() {
  document.getElementById('entryModal').classList.add('hidden');
}

function generateFormHTML(attrType, r = null) {
  const titleVal = r ? r.title : '';
  const descVal = r ? (r.description || '') : '';
  const statusVal = r ? r.current_status : 'In progress';
  const startVal = r && r.start_date ? r.start_date : '';
  const endVal = r && r.planned_end_date ? r.planned_end_date : '';
  const actualVal = r && r.actual_completion_date ? r.actual_completion_date : '';
  const evVal = r ? (r.evidence_url || r.certificate_url || r.post_url || '') : '';
  const updateVal = r ? (r.progress_update || '') : '';

  if (attrType === 'linkedin') {
    return `
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Post Title / Topic *</label>
        <input type="text" id="field_title" required value="${titleVal}" placeholder="e.g. Insights on Indian EV Battery Ecosystem"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Publication Date *</label>
          <input type="date" id="field_publication_date" required value="${r && r.publication_date ? r.publication_date : ''}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Post URL (Live published link) *</label>
          <input type="url" id="field_post_url" required value="${r ? (r.post_url || '') : ''}" placeholder="https://linkedin.com/posts/..."
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Key Takeaway / Notes</label>
        <textarea id="field_post_notes" rows="2" placeholder="Brief note on engagement, reactions, or mentor discussion"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">${r ? (r.post_notes || '') : ''}</textarea>
      </div>
    `;
  }

  if (attrType === 'projects') {
    return `
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Project Name *</label>
        <input type="text" id="field_title" required value="${titleVal}" placeholder="e.g. Hospital ER Queue Optimization Model"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Objective & Scope</label>
        <textarea id="field_description" rows="2" placeholder="Primary business problem and methodology"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">${descVal}</textarea>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Date</label>
          <input type="date" id="field_start_date" value="${startVal}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Planned End Date</label>
          <input type="date" id="field_planned_end_date" value="${endVal}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
          <p class="text-[10px] text-amber-600 mt-0.5">Required to avoid Yellow timeline status</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Current Status</label>
          <select id="field_current_status" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
            <option value="In progress" ${statusVal === 'In progress' ? 'selected' : ''}>In progress</option>
            <option value="Not started" ${statusVal === 'Not started' ? 'selected' : ''}>Not started</option>
            <option value="Completed" ${statusVal === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Blocked" ${statusVal === 'Blocked' ? 'selected' : ''}>Blocked</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Weekly Progress Update</label>
        <textarea id="field_progress_update" rows="2" placeholder="Milestones completed this week and immediate next deliverables"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">${updateVal}</textarea>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Evidence Link (GitHub, Drive, Deck, or Document)</label>
        <input type="url" id="field_evidence_url" value="${evVal}" placeholder="https://github.com/... or https://drive.google.com/..."
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        <p class="text-[10px] text-slate-400 mt-0.5">Mandatory before project can be verified as Completed</p>
      </div>
    `;
  }

  if (attrType === 'competitions') {
    const isNoComp = r ? r.is_no_competition_declaration : false;
    return `
      <div class="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-3 flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-amber-900 block">No suitable competition available this week?</span>
          <span class="text-[11px] text-amber-700">Submitting this declaration satisfies weekly reporting compliance.</span>
        </div>
        <input type="checkbox" id="field_is_no_competition" onchange="toggleNoCompetition(this.checked)" ${isNoComp ? 'checked' : ''}
          class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
      </div>

      <div id="competitionFieldsGroup" class="${isNoComp ? 'hidden' : 'space-y-4'}">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Competition Name *</label>
            <input type="text" id="field_title" value="${titleVal}" placeholder="e.g. Tata Business Leadership Challenge"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Organizer *</label>
            <input type="text" id="field_organizer" value="${r ? (r.organizer || '') : ''}" placeholder="e.g. Tata Sons / Unstop"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Registration Status</label>
            <select id="field_registration_status" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
              <option value="Registered">Registered</option>
              <option value="Invited">Invited</option>
              <option value="Shortlisted">Shortlisted</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Stage</label>
            <select id="field_competition_stage" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
              <option value="Registered">Registered</option>
              <option value="Submitted">Submitted</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Won">Won</option>
              <option value="Eliminated">Eliminated</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Submission Deadline</label>
            <input type="date" id="field_competition_deadline" value="${r && r.competition_deadline ? r.competition_deadline : ''}"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Next Steps & Strategy *</label>
          <textarea id="field_next_steps" rows="2" placeholder="Next round preparation, team alignment, or submission review"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">${r ? (r.next_steps || '') : ''}</textarea>
        </div>
      </div>
    `;
  }

  if (attrType === 'activities') {
    return `
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Activity / Responsibility *</label>
        <input type="text" id="field_title" required value="${titleVal}" placeholder="e.g. Placement Committee Prep Club"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Your Role *</label>
          <input type="text" id="field_activity_role" required value="${r ? (r.activity_role || '') : ''}" placeholder="e.g. Student Coordinator / Core Member"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Current Status</label>
          <select id="field_current_status" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
            <option value="In progress" ${statusVal === 'In progress' ? 'selected' : ''}>In progress</option>
            <option value="Not started" ${statusVal === 'Not started' ? 'selected' : ''}>Not started</option>
            <option value="Completed" ${statusVal === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Date</label>
          <input type="date" id="field_start_date" value="${startVal}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Planned End Date</label>
          <input type="date" id="field_planned_end_date" value="${endVal}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Meaningful Contribution Details *</label>
        <textarea id="field_contribution" rows="2" placeholder="Specific deliverables or campus impact (attendance alone does not qualify)"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">${r ? (r.contribution || '') : ''}</textarea>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Evidence URL (Drive link, event proof, or report)</label>
        <input type="url" id="field_evidence_url" value="${evVal}" placeholder="https://..."
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
      </div>
    `;
  }

  if (attrType === 'certifications') {
    return `
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Certification Name *</label>
        <input type="text" id="field_title" required value="${titleVal}" placeholder="e.g. Financial Modeling & Valuation Analyst (FMVA)"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Platform / Provider *</label>
          <input type="text" id="field_provider" required value="${r ? (r.provider || '') : ''}" placeholder="e.g. Coursera / CFI / Wharton Online"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
          <select id="field_current_status" class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
            <option value="In progress" ${statusVal === 'In progress' ? 'selected' : ''}>In progress</option>
            <option value="Completed" ${statusVal === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Not started" ${statusVal === 'Not started' ? 'selected' : ''}>Not started</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Date</label>
          <input type="date" id="field_start_date" value="${startVal}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Planned End Date</label>
          <input type="date" id="field_planned_end_date" value="${endVal}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Actual Completion Date</label>
          <input type="date" id="field_actual_completion_date" value="${actualVal}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Verifiable Certificate URL (Mandatory upon completion) *</label>
        <input type="url" id="field_certificate_url" value="${r ? (r.certificate_url || '') : ''}" placeholder="https://coursera.org/verify/... or https://credentials.cfi.org/..."
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
      </div>
    `;
  }

  if (attrType === 'networking') {
    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Contact Name *</label>
          <input type="text" id="field_contact_name" required value="${r ? (r.contact_name || '') : ''}" placeholder="e.g. Vikram Seth"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Professional Role *</label>
          <input type="text" id="field_contact_role" required value="${r ? (r.contact_role || '') : ''}" placeholder="e.g. VP Investment Banking"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Organization *</label>
          <input type="text" id="field_organization" required value="${r ? (r.organization || '') : ''}" placeholder="e.g. Barclays / Swiggy / McKinsey"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Conversation Date *</label>
          <input type="date" id="field_conversation_date" required value="${r && r.conversation_date ? r.conversation_date : ''}"
            class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Key Learning & Discussion Takeaways *</label>
        <textarea id="field_key_learning" rows="3" required placeholder="Structured notes on industry trends, hiring insights, or strategic advice"
          class="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">${r ? (r.key_learning || '') : ''}</textarea>
        <p class="text-[10px] text-slate-400 mt-0.5">Simple greetings or LinkedIn connection requests do not qualify</p>
      </div>
    `;
  }

  return '';
}

function toggleNoCompetition(isChecked) {
  const group = document.getElementById('competitionFieldsGroup');
  if (isChecked) {
    group.classList.add('hidden');
  } else {
    group.classList.remove('hidden');
  }
}

async function submitRecord(isDraft = false) {
  const errorBox = document.getElementById('formErrorBox');
  const errorMsg = document.getElementById('formErrorMsg');
  errorBox.classList.add('hidden');

  const recordId = document.getElementById('formRecordId').value;
  const attrType = document.getElementById('formAttrType').value;
  const periodId = document.getElementById('formPeriodId').value;

  const payload = {
    attribute_type: attrType,
    period_id: periodId ? parseInt(periodId) : null,
    is_draft: isDraft
  };

  // Extract fields based on attribute
  if (attrType === 'linkedin') {
    payload.title = document.getElementById('field_title')?.value.trim();
    payload.publication_date = document.getElementById('field_publication_date')?.value || null;
    payload.post_url = document.getElementById('field_post_url')?.value.trim() || null;
    payload.post_notes = document.getElementById('field_post_notes')?.value.trim() || null;
    payload.current_status = 'Completed';

    if (!payload.title || !payload.post_url) {
      showFormError('Post title and live published URL are required.');
      return;
    }
  } else if (attrType === 'projects') {
    payload.title = document.getElementById('field_title')?.value.trim();
    payload.description = document.getElementById('field_description')?.value.trim() || null;
    payload.start_date = document.getElementById('field_start_date')?.value || null;
    payload.planned_end_date = document.getElementById('field_planned_end_date')?.value || null;
    payload.current_status = document.getElementById('field_current_status')?.value || 'In progress';
    payload.progress_update = document.getElementById('field_progress_update')?.value.trim() || null;
    payload.evidence_url = document.getElementById('field_evidence_url')?.value.trim() || null;

    if (!payload.title) {
      showFormError('Project title is required.');
      return;
    }
    if (payload.start_date && payload.planned_end_date && payload.planned_end_date < payload.start_date) {
      showFormError('Planned end date cannot precede start date.');
      return;
    }
    if (payload.current_status === 'Completed' && !payload.evidence_url && !isDraft) {
      showFormError('Completed projects require verifiable evidence link before submission.');
      return;
    }
  } else if (attrType === 'competitions') {
    const isNoComp = document.getElementById('field_is_no_competition')?.checked;
    payload.is_no_competition_declaration = isNoComp;
    if (isNoComp) {
      payload.title = 'No suitable competition available this week';
      payload.current_status = 'Completed';
    } else {
      payload.title = document.getElementById('field_title')?.value.trim();
      payload.organizer = document.getElementById('field_organizer')?.value.trim() || null;
      payload.registration_status = document.getElementById('field_registration_status')?.value;
      payload.competition_stage = document.getElementById('field_competition_stage')?.value;
      payload.competition_deadline = document.getElementById('field_competition_deadline')?.value || null;
      payload.next_steps = document.getElementById('field_next_steps')?.value.trim() || null;
      payload.current_status = payload.competition_stage === 'Won' || payload.competition_stage === 'Completed' ? 'Completed' : 'In progress';

      if (!payload.title || !payload.next_steps) {
        showFormError('Competition name and next steps strategy are required.');
        return;
      }
    }
  } else if (attrType === 'activities') {
    payload.title = document.getElementById('field_title')?.value.trim();
    payload.activity_role = document.getElementById('field_activity_role')?.value.trim() || null;
    payload.current_status = document.getElementById('field_current_status')?.value || 'In progress';
    payload.start_date = document.getElementById('field_start_date')?.value || null;
    payload.planned_end_date = document.getElementById('field_planned_end_date')?.value || null;
    payload.contribution = document.getElementById('field_contribution')?.value.trim() || null;
    payload.evidence_url = document.getElementById('field_evidence_url')?.value.trim() || null;

    if (!payload.title || !payload.contribution) {
      showFormError('Activity title and contribution details are required.');
      return;
    }
    if (payload.start_date && payload.planned_end_date && payload.planned_end_date < payload.start_date) {
      showFormError('Planned end date cannot precede start date.');
      return;
    }
  } else if (attrType === 'certifications') {
    payload.title = document.getElementById('field_title')?.value.trim();
    payload.provider = document.getElementById('field_provider')?.value.trim() || null;
    payload.current_status = document.getElementById('field_current_status')?.value || 'In progress';
    payload.start_date = document.getElementById('field_start_date')?.value || null;
    payload.planned_end_date = document.getElementById('field_planned_end_date')?.value || null;
    payload.actual_completion_date = document.getElementById('field_actual_completion_date')?.value || null;
    payload.certificate_url = document.getElementById('field_certificate_url')?.value.trim() || null;

    if (!payload.title || !payload.provider) {
      showFormError('Certification name and platform provider are required.');
      return;
    }
    if (payload.current_status === 'Completed' && !payload.certificate_url && !isDraft) {
      showFormError('Completed certifications require a verifiable certificate link.');
      return;
    }
  } else if (attrType === 'networking') {
    payload.contact_name = document.getElementById('field_contact_name')?.value.trim();
    payload.contact_role = document.getElementById('field_contact_role')?.value.trim();
    payload.organization = document.getElementById('field_organization')?.value.trim();
    payload.conversation_date = document.getElementById('field_conversation_date')?.value || null;
    payload.key_learning = document.getElementById('field_key_learning')?.value.trim();
    payload.title = `Conversation with ${payload.contact_name} (${payload.organization})`;
    payload.current_status = 'Completed';

    if (!payload.contact_name || !payload.contact_role || !payload.organization || !payload.key_learning) {
      showFormError('All conversation details including key learning are required.');
      return;
    }
  }

  try {
    if (recordId) {
      await API.updateRecord(recordId, payload);
    } else {
      await API.createRecord(payload);
    }

    closeEntryModal();
    // Refresh week evaluations
    if (selectedPeriodId) {
      await loadWeekAttributes(selectedPeriodId);
      await loadPeriodsOverview(currentYear, currentMonth);
    }
  } catch (err) {
    showFormError(err.message || 'Failed to save record.');
  }
}

function showFormError(msg) {
  const errorBox = document.getElementById('formErrorBox');
  const errorMsg = document.getElementById('formErrorMsg');
  errorMsg.textContent = msg;
  errorBox.classList.remove('hidden');
}

// Records List Modal
async function viewAttributeRecords(attrKey, attrName) {
  activeAttributeType = attrKey;
  document.getElementById('recordsListTitle').textContent = `${attrName} Records`;
  document.getElementById('recordsListSubtitle').textContent = `Saved entries for this review period`;

  try {
    const records = await API.getMyRecords(selectedPeriodId, attrKey);
    const container = document.getElementById('recordsListContainer');
    container.innerHTML = '';

    if (records.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-xs text-slate-400">No records submitted yet for this period. Click "Add New Record" to record progress.</div>`;
    } else {
      records.forEach(r => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between';
        
        let subText = r.current_status;
        if (r.planned_end_date) subText += ` · Planned end: ${r.planned_end_date}`;
        if (r.post_url) subText += ` · <a href="${r.post_url}" target="_blank" class="text-blue-600 underline">View Post</a>`;
        if (r.evidence_url) subText += ` · <a href="${r.evidence_url}" target="_blank" class="text-blue-600 underline">Proof Link</a>`;

        item.innerHTML = `
          <div>
            <div class="font-bold text-xs text-slate-800">${r.title}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">${subText}</div>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="editRecordFromList(${r.id})" class="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button onclick="deleteRecordItem(${r.id})" class="px-2.5 py-1 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;
        container.appendChild(item);
      });
    }

    document.getElementById('recordsListModal').classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load records list:', err);
  }
}

function closeRecordsListModal() {
  document.getElementById('recordsListModal').classList.add('hidden');
}

function openEntryFromList() {
  closeRecordsListModal();
  openEntryModal(activeAttributeType, activeAttributeType.toUpperCase());
}

async function editRecordFromList(recordId) {
  closeRecordsListModal();
  try {
    const records = await API.getMyRecords(null, null);
    const r = records.find(item => item.id === recordId);
    if (r) {
      openEntryModal(r.attribute_type, r.attribute_type.toUpperCase(), r);
    }
  } catch (err) {
    console.error('Failed to open record for editing:', err);
  }
}

async function deleteRecordItem(recordId) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    await API.deleteRecord(recordId);
    await viewAttributeRecords(activeAttributeType, activeAttributeType.toUpperCase());
    if (selectedPeriodId) {
      await loadWeekAttributes(selectedPeriodId);
      await loadPeriodsOverview(currentYear, currentMonth);
    }
  } catch (err) {
    alert(err.message || 'Could not delete record.');
  }
}

// History Modal
async function openHistoryModal() {
  try {
    const history = await API.getStudentHistory();
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    history.forEach(h => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50 border-b border-slate-100';

      let statusBadge = 'badge-gray';
      if (h.classification === 'Fully compliant') statusBadge = 'badge-green';
      else if (h.classification === 'Partially compliant') statusBadge = 'badge-yellow';
      else if (h.classification === 'No targets met') statusBadge = 'badge-red';

      const renderAttrDot = (attr) => {
        const stat = attr ? attr.status : 'gray';
        let bg = 'bg-slate-300';
        if (stat === 'green') bg = 'bg-emerald-500';
        else if (stat === 'yellow') bg = 'bg-amber-500';
        else if (stat === 'red') bg = 'bg-red-500';
        return `<span class="inline-block w-2.5 h-2.5 rounded-full ${bg} mr-1.5" title="${attr ? attr.reason : ''}"></span><span class="capitalize">${stat}</span>`;
      };

      row.innerHTML = `
        <td class="py-2.5 px-3 font-semibold text-slate-800">${h.period_title}</td>
        <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}">${h.classification}</span></td>
        <td class="py-2.5 px-3">${renderAttrDot(h.attributes.linkedin)}</td>
        <td class="py-2.5 px-3">${renderAttrDot(h.attributes.projects)}</td>
        <td class="py-2.5 px-3">${renderAttrDot(h.attributes.competitions)}</td>
        <td class="py-2.5 px-3">${renderAttrDot(h.attributes.activities)}</td>
        <td class="py-2.5 px-3">${renderAttrDot(h.attributes.certifications)}</td>
        <td class="py-2.5 px-3">${renderAttrDot(h.attributes.networking)}</td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById('historyModal').classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load history:', err);
  }
}

function closeHistoryModal() {
  document.getElementById('historyModal').classList.add('hidden');
}
