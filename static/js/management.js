// HSB Student Development Program — Management Dashboard JS

let selectedPeriodId = null;
let currentSummary = null;
let currentStudentRoster = [];
let currentDrilldownStudentId = null;
let currentDrilldownData = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.isAuthenticated()) {
    window.location.href = '/';
    return;
  }

  const user = API.getUser();
  if (user && user.role === 'student') {
    alert('Student account detected. Redirecting to Student Portal.');
    window.location.href = '/student';
    return;
  }

  if (user && user.full_name) {
    document.getElementById('mgmtUserName').textContent = user.full_name;
  }

  await loadPeriodsList();
  await refreshDashboard();
});

async function loadPeriodsList() {
  try {
    const periods = await API.getPeriods(2026, 10);
    const selector = document.getElementById('periodSelector');
    selector.innerHTML = '';

    periods.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.title} (${p.status.toUpperCase()})`;
      if (p.status === 'open' || p.week_number === 3) {
        opt.selected = true;
        selectedPeriodId = p.id;
      }
      selector.appendChild(opt);
    });

    if (!selectedPeriodId && periods.length > 0) {
      selectedPeriodId = periods[0].id;
    }
  } catch (err) {
    console.error('Failed to load periods:', err);
  }
}

async function onPeriodChange() {
  selectedPeriodId = document.getElementById('periodSelector').value;
  await refreshDashboard();
}

async function refreshDashboard() {
  const mentor = document.getElementById('mentorFilter').value;
  try {
    const summary = await API.getBatchOverview(selectedPeriodId, mentor);
    currentSummary = summary;

    // 1. Update Metrics Cards
    const m = summary.metrics;
    document.getElementById('statFullyCompliant').textContent = m.fully_compliant_count;
    document.getElementById('statPartiallyCompliant').textContent = m.partially_compliant_count;
    document.getElementById('statNoTargetsMet').textContent = m.no_targets_met_count;
    document.getElementById('statAssessed').textContent = `${m.assessed_count} / ${m.total_cohort}`;
    document.getElementById('statCompliancePct').textContent = `${m.compliance_percentage}%`;
    document.getElementById('statAwaiting').textContent = m.awaiting_assessment_count;

    // 2. Render Attribute Distribution Bars
    renderAttributeDistribution(summary.attribute_distribution, m.assessed_count);

    // 3. Render Follow-Up Queue
    renderFollowUpQueue(summary);

    // 4. Render Overdue Register
    renderOverdueRegister(summary.overdue_register);

    // 5. Render Initiation Register
    renderInitiationRegister(summary.initiation_register);

    // 6. Load Student Roster Table
    await loadStudentRoster();

    // 7. Load Follow-up Actions
    await loadFollowUpsTable();
  } catch (err) {
    console.error('Failed to refresh dashboard:', err);
  }
}

function renderAttributeDistribution(dist, totalAssessed) {
  const container = document.getElementById('attributeDistributionBars');
  container.innerHTML = '';

  const names = {
    linkedin: 'LinkedIn Presence (2 posts/mo)',
    projects: 'Projects (Timeline & Progress)',
    competitions: 'Competitions (Participation update)',
    activities: 'Activities (Timeline & Contribution)',
    certifications: 'Certifications (Target & Timeline)',
    networking: 'Networking (2 conversations/wk)'
  };

  for (const [key, counts] of Object.entries(dist)) {
    const label = names[key] || key.toUpperCase();
    const g = counts.green || 0;
    const y = counts.yellow || 0;
    const r = counts.red || 0;
    const total = g + y + r || totalAssessed || 1;

    const gPct = Math.round((g / total) * 100);
    const yPct = Math.round((y / total) * 100);
    const rPct = Math.round((r / total) * 100);

    const row = document.createElement('div');
    row.className = 'space-y-1';
    row.innerHTML = `
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-slate-800">${label}</span>
        <div class="space-x-2 font-medium">
          <span class="text-emerald-700 font-bold">${g} Green</span>
          <span class="text-amber-700 font-bold">${y} Yellow</span>
          <span class="text-red-700 font-bold">${r} Red</span>
        </div>
      </div>
      <div class="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
        <div style="width: ${gPct}%" class="bg-emerald-500" title="Green: ${g} (${gPct}%)"></div>
        <div style="width: ${yPct}%" class="bg-amber-400" title="Yellow: ${y} (${yPct}%)"></div>
        <div style="width: ${rPct}%" class="bg-red-500" title="Red: ${r} (${rPct}%)"></div>
      </div>
    `;
    container.appendChild(row);
  }
}

function renderFollowUpQueue(summary) {
  const container = document.getElementById('followUpListContainer');
  container.innerHTML = '';

  const needingFollowUp = [
    ...summary.no_targets_met_students,
    ...summary.partially_compliant_students
  ];

  document.getElementById('followUpCountBadge').textContent = needingFollowUp.length;

  if (needingFollowUp.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-slate-400">All assessed students are currently fully compliant!</div>`;
    return;
  }

  needingFollowUp.forEach(st => {
    const item = document.createElement('div');
    const badgeClass = st.classification === 'No targets met' ? 'badge-red' : 'badge-yellow';

    item.className = 'p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition';
    item.onclick = () => openStudentDrilldown(st.student_id);

    item.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <span class="font-bold text-slate-800">${st.student_name} (${st.student_code})</span>
        <span class="px-2 py-0.2 rounded-full text-[10px] font-bold ${badgeClass}">${st.classification}</span>
      </div>
      <div class="text-[11px] text-slate-600 line-clamp-1">
        <i class="fa-solid fa-triangle-exclamation text-amber-500 mr-1"></i> ${st.compliance_reason}
      </div>
    `;
    container.appendChild(item);
  });
}

function renderOverdueRegister(overdueItems) {
  const tbody = document.getElementById('overdueTableBody');
  tbody.innerHTML = '';
  document.getElementById('overdueBadge').textContent = overdueItems.length;

  if (overdueItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">No overdue tasks recorded in this review period.</td></tr>`;
    return;
  }

  overdueItems.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100';
    tr.innerHTML = `
      <td class="py-2.5 px-3 font-bold text-slate-800">${item.student_code}</td>
      <td class="py-2.5 px-3 font-semibold text-slate-800">${item.student_name}</td>
      <td class="py-2.5 px-3 uppercase text-[11px] font-bold text-slate-600">${item.attribute}</td>
      <td class="py-2.5 px-3 font-medium text-slate-900">${item.record_title}</td>
      <td class="py-2.5 px-3 font-bold text-red-600"><span class="px-2 py-0.5 rounded badge-red">${item.days_overdue} days late</span></td>
      <td class="py-2.5 px-3 text-slate-600">${item.reason}</td>
      <td class="py-2.5 px-3 text-right">
        <button onclick="openStudentDrilldown(${item.student_id})" class="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200">
          Inspect & Revise
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderInitiationRegister(initiationItems) {
  const tbody = document.getElementById('initiationTableBody');
  tbody.innerHTML = '';

  if (initiationItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">All scheduled developmental activities are properly initiated or scheduled.</td></tr>`;
    return;
  }

  initiationItems.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100';
    tr.innerHTML = `
      <td class="py-2.5 px-3 font-bold text-slate-800">${item.student_code}</td>
      <td class="py-2.5 px-3 font-semibold text-slate-800">${item.student_name}</td>
      <td class="py-2.5 px-3 uppercase text-[11px] font-bold text-slate-600">${item.attribute}</td>
      <td class="py-2.5 px-3 font-medium text-slate-900">${item.record_title}</td>
      <td class="py-2.5 px-3 font-semibold text-amber-700">${item.reason}</td>
      <td class="py-2.5 px-3 text-right">
        <button onclick="openStudentDrilldown(${item.student_id})" class="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200">
          Inspect Profile
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadStudentRoster() {
  const search = document.getElementById('searchInput').value.trim();
  const classification = document.getElementById('classificationFilter').value;
  const attribute = document.getElementById('attrFilterName').value;
  const attributeStatus = document.getElementById('attrFilterStatus').value;
  const mentor = document.getElementById('mentorFilter').value;
  const sortBy = document.getElementById('sortFilter').value;

  try {
    const res = await API.getManagementStudents({
      period_id: selectedPeriodId,
      classification,
      attribute,
      attribute_status: attributeStatus,
      mentor,
      search,
      sort_by: sortBy
    });

    currentStudentRoster = res.students;
    renderRosterTable(res.students);
  } catch (err) {
    console.error('Failed to load roster:', err);
  }
}

function applyFilters() {
  loadStudentRoster();
}

function filterByClassification(cls) {
  document.getElementById('classificationFilter').value = cls;
  switchTab('roster');
  loadStudentRoster();
}

function renderRosterTable(students) {
  const tbody = document.getElementById('studentRosterTableBody');
  tbody.innerHTML = '';

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="py-8 text-center text-slate-400">No students match the selected filter criteria.</td></tr>`;
    return;
  }

  students.forEach(st => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    let clsBadge = 'badge-gray';
    if (st.classification === 'Fully compliant') clsBadge = 'badge-green';
    else if (st.classification === 'Partially compliant') clsBadge = 'badge-yellow';
    else if (st.classification === 'No targets met') clsBadge = 'badge-red';

    const renderDot = (attr) => {
      const s = attr ? attr.status : 'gray';
      let bg = 'bg-slate-300';
      if (s === 'green') bg = 'bg-emerald-500';
      else if (s === 'yellow') bg = 'bg-amber-500';
      else if (s === 'red') bg = 'bg-red-500';
      return `<div class="flex justify-center" title="${attr ? attr.reason : ''}"><span class="w-3 h-3 rounded-full ${bg} inline-block shadow-sm"></span></div>`;
    };

    tr.innerHTML = `
      <td class="py-2.5 px-3">
        <div class="font-bold text-slate-900">${st.student_name}</div>
        <div class="text-[10px] text-slate-500">${st.student_code}</div>
      </td>
      <td class="py-2.5 px-3 text-slate-600">${st.mentor_name || '—'}</td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${clsBadge}">${st.classification}</span>
      </td>
      <td class="py-2.5 px-2 text-center">${renderDot(st.attributes.linkedin)}</td>
      <td class="py-2.5 px-2 text-center">${renderDot(st.attributes.projects)}</td>
      <td class="py-2.5 px-2 text-center">${renderDot(st.attributes.competitions)}</td>
      <td class="py-2.5 px-2 text-center">${renderDot(st.attributes.activities)}</td>
      <td class="py-2.5 px-2 text-center">${renderDot(st.attributes.certifications)}</td>
      <td class="py-2.5 px-2 text-center">${renderDot(st.attributes.networking)}</td>
      <td class="py-2.5 px-3 text-slate-600 max-w-xs truncate" title="${st.compliance_reason}">${st.compliance_reason}</td>
      <td class="py-2.5 px-3 text-right">
        <button onclick="openStudentDrilldown(${st.student_id})" class="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition">
          Inspect
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Student Drilldown Modal (BR-UI-08, BR-UI-09)
async function openStudentDrilldown(studentId) {
  currentDrilldownStudentId = studentId;
  try {
    const data = await API.getStudentDrilldown(studentId, selectedPeriodId);
    currentDrilldownData = data;

    // Header info
    document.getElementById('drillStudentName').textContent = data.student.name;
    document.getElementById('drillStudentMeta').textContent = `${data.student.student_id} · ${data.student.cohort} · Mentor: ${data.student.mentor_name || 'Placement Office'}`;

    const pill = document.getElementById('drillOverallPill');
    pill.textContent = data.evaluation.classification;
    if (data.evaluation.classification === 'Fully compliant') pill.className = 'px-3 py-1 rounded-full text-xs font-bold badge-green';
    else if (data.evaluation.classification === 'Partially compliant') pill.className = 'px-3 py-1 rounded-full text-xs font-bold badge-yellow';
    else if (data.evaluation.classification === 'No targets met') pill.className = 'px-3 py-1 rounded-full text-xs font-bold badge-red';
    else pill.className = 'px-3 py-1 rounded-full text-xs font-bold badge-gray';

    // 6 Attribute Overview Cards
    renderDrillAttributeCards(data.evaluation.attributes);

    // Gantt Timeline items
    renderDrillTimeline(data.timeline_items);

    // Revisions list
    renderDrillRevisions(data.revisions);

    // Follow-ups list
    renderDrillFollowUps(data.follow_ups);

    document.getElementById('drilldownModal').classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load student drilldown:', err);
  }
}

function closeDrilldownModal() {
  document.getElementById('drilldownModal').classList.add('hidden');
}

function renderDrillAttributeCards(attributes) {
  const container = document.getElementById('drillAttributeCards');
  container.innerHTML = '';

  for (const [k, v] of Object.entries(attributes)) {
    let bg = 'border-slate-200';
    let statBadge = 'badge-gray';
    if (v.status === 'green') { bg = 'border-emerald-200 bg-emerald-50/30'; statBadge = 'badge-green'; }
    else if (v.status === 'yellow') { bg = 'border-amber-200 bg-amber-50/30'; statBadge = 'badge-yellow'; }
    else if (v.status === 'red') { bg = 'border-red-200 bg-red-50/30'; statBadge = 'badge-red'; }

    const card = document.createElement('div');
    card.className = `p-2.5 rounded-lg border ${bg} text-xs flex flex-col justify-between`;
    card.innerHTML = `
      <div>
        <div class="font-bold text-slate-800 truncate">${v.name}</div>
        <div class="text-[10px] text-slate-500 mt-0.5">${v.progress_display || v.target_achievement || ''}</div>
      </div>
      <div class="mt-2">
        <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${statBadge}">${v.status.toUpperCase()}</span>
      </div>
    `;
    container.appendChild(card);
  }
}

function renderDrillTimeline(items) {
  const container = document.getElementById('drillTimelineContainer');
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-400 py-3 text-center">No active project, activity, or certification timeline recorded.</div>`;
    return;
  }

  items.forEach(item => {
    let barColor = 'gantt-bar-yellow';
    if (item.status === 'green') barColor = 'gantt-bar-green';
    else if (item.status === 'red') barColor = 'gantt-bar-red';

    const div = document.createElement('div');
    div.className = 'bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2';

    let evidenceHtml = '';
    if (item.evidence_url) {
      evidenceHtml = `<a href="${item.evidence_url}" target="_blank" class="text-blue-600 underline text-xs font-semibold"><i class="fa-solid fa-arrow-up-right-from-square mr-1"></i>View Evidence Proof</a>`;
    }

    div.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <div class="font-bold text-xs text-slate-900">${item.title} <span class="uppercase text-[10px] text-slate-400">(${item.attribute_type})</span></div>
          <div class="text-[11px] text-slate-500">
            Start: ${item.start_date || 'None'} · Planned End: <strong class="text-slate-700">${item.planned_end_date || 'Missing (Yellow)'}</strong>
            ${item.original_planned_end_date && item.original_planned_end_date !== item.planned_end_date ? `· <span class="text-amber-700 font-medium">(Original: ${item.original_planned_end_date})</span>` : ''}
          </div>
        </div>
        <div class="flex items-center space-x-2">
          ${item.days_overdue > 0 ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold badge-red">${item.days_overdue}d Overdue</span>` : ''}
          <button onclick="openDeadlineModal(${item.record_id}, '${escapeQuote(item.title)}', '${item.planned_end_date || ''}')"
            class="px-2 py-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200">
            <i class="fa-solid fa-calendar-plus mr-1"></i>Revise Deadline
          </button>
        </div>
      </div>

      <!-- Timeline Bar Visualization -->
      <div class="w-full h-2 rounded-full ${barColor} shadow-inner"></div>

      <div class="flex items-center justify-between text-[11px] text-slate-600">
        <div><i class="fa-solid fa-circle-info mr-1 text-slate-400"></i> ${item.reason}</div>
        <div>${evidenceHtml}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderDrillRevisions(revisions) {
  const container = document.getElementById('drillRevisionsList');
  container.innerHTML = '';
  if (!revisions || revisions.length === 0) {
    container.innerHTML = `<div class="text-slate-400 py-2">No deadline revisions recorded. Original timelines active.</div>`;
    return;
  }
  revisions.forEach(r => {
    const item = document.createElement('div');
    item.className = 'p-2 bg-slate-50 rounded border border-slate-200';
    item.innerHTML = `
      <div class="flex justify-between font-bold text-slate-800">
        <span>Extended to: ${r.new_deadline}</span>
        <span class="text-slate-400 text-[10px]">${r.old_deadline || 'None'} &rarr; ${r.new_deadline}</span>
      </div>
      <div class="text-[11px] text-slate-600 mt-0.5">Approved by: ${r.approver_name}</div>
      <div class="text-[11px] text-slate-500 italic mt-0.5">"${r.reason}"</div>
    `;
    container.appendChild(item);
  });
}

function renderDrillFollowUps(followUps) {
  const container = document.getElementById('drillFollowUpsList');
  container.innerHTML = '';
  if (!followUps || followUps.length === 0) {
    container.innerHTML = `<div class="text-slate-400 py-2">No follow-ups recorded for this student.</div>`;
    return;
  }
  followUps.forEach(fu => {
    const item = document.createElement('div');
    item.className = 'p-2 bg-slate-50 rounded border border-slate-200 space-y-1';
    item.innerHTML = `
      <div class="flex justify-between font-bold text-slate-800">
        <span class="uppercase text-[10px] text-blue-800 font-extrabold">${fu.attribute_type || 'General'}</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] ${fu.resolution_status === 'Resolved' ? 'badge-green' : 'badge-yellow'}">${fu.resolution_status}</span>
      </div>
      <div class="text-[11px] text-slate-700"><strong>Action:</strong> ${fu.action_required}</div>
      <div class="text-[10px] text-slate-500">Owner: ${fu.assigned_to || fu.reviewer_name} · Next Review: ${fu.next_review_date || 'Pending'}</div>
    `;
    container.appendChild(item);
  });
}

// Deadline Revision Modal (BR-12, BR-UI-11)
function openDeadlineModal(recordId, recordTitle, oldDeadline) {
  document.getElementById('revRecordId').value = recordId;
  document.getElementById('revRecordTitle').value = recordTitle;
  document.getElementById('revOldDeadline').value = oldDeadline || 'None';
  document.getElementById('revNewDeadline').value = '';
  document.getElementById('revReason').value = '';
  document.getElementById('deadlineModal').classList.remove('hidden');
}

function closeDeadlineModal() {
  document.getElementById('deadlineModal').classList.add('hidden');
}

async function submitDeadlineRevision(e) {
  e.preventDefault();
  const recordId = document.getElementById('revRecordId').value;
  const newDeadline = document.getElementById('revNewDeadline').value;
  const reason = document.getElementById('revReason').value.trim();

  if (!newDeadline || !reason) {
    alert('Please fill in both the approved new deadline and the justification reason.');
    return;
  }

  try {
    await API.approveDeadlineRevision(recordId, newDeadline, reason);
    closeDeadlineModal();
    alert('Deadline revision approved and logged in system audit history.');
    if (currentDrilldownStudentId) {
      await openStudentDrilldown(currentDrilldownStudentId);
    }
    await refreshDashboard();
  } catch (err) {
    alert(err.message || 'Failed to approve deadline revision.');
  }
}

// Manual Status Override Modal (BR-UI-11)
function openManualOverrideModal() {
  if (!currentDrilldownData) return;
  const select = document.getElementById('ovRecordSelect');
  select.innerHTML = '';

  currentDrilldownData.records.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.title} (${r.attribute_type.toUpperCase()}) - Current: ${r.current_status}`;
    select.appendChild(opt);
  });

  document.getElementById('ovReason').value = '';
  document.getElementById('overrideModal').classList.remove('hidden');
}

function closeOverrideModal() {
  document.getElementById('overrideModal').classList.add('hidden');
}

async function submitManualOverride(e) {
  e.preventDefault();
  const recordId = document.getElementById('ovRecordSelect').value;
  const status = document.getElementById('ovStatusSelect').value;
  const reason = document.getElementById('ovReason').value.trim();

  if (!reason) {
    alert('A mandatory reason is required for any authorized status override.');
    return;
  }

  try {
    await API.manualStatusOverride(recordId, status, reason);
    closeOverrideModal();
    alert('Manual override recorded and logged with timestamp.');
    if (currentDrilldownStudentId) {
      await openStudentDrilldown(currentDrilldownStudentId);
    }
    await refreshDashboard();
  } catch (err) {
    alert(err.message || 'Failed to record manual status override.');
  }
}

// Follow-ups Table
async function loadFollowUpsTable() {
  try {
    const followUps = await API.getFollowUps();
    const tbody = document.getElementById('followUpsTableBody');
    tbody.innerHTML = '';

    if (followUps.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="py-6 text-center text-slate-400">No active follow-up actions recorded.</td></tr>`;
      return;
    }

    followUps.forEach(fu => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 border-b border-slate-100';

      const isResolved = fu.resolution_status === 'Resolved';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-bold text-slate-800">Student #${fu.student_id}</td>
        <td class="py-2.5 px-3 uppercase text-[10px] font-bold text-blue-900">${fu.attribute_type || 'General'}</td>
        <td class="py-2.5 px-3 text-slate-700">${fu.comment}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-900">${fu.action_required}</td>
        <td class="py-2.5 px-3 text-slate-600">${fu.assigned_to || fu.reviewer_name}</td>
        <td class="py-2.5 px-3 text-slate-600">${fu.next_review_date || '—'}</td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isResolved ? 'badge-green' : 'badge-yellow'}">${fu.resolution_status}</span>
        </td>
        <td class="py-2.5 px-3 text-right">
          ${!isResolved ? `
            <button onclick="markFollowUpResolved(${fu.id})" class="px-2.5 py-1 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300 font-semibold">
              Mark Resolved
            </button>
          ` : '<span class="text-emerald-600 font-bold text-xs"><i class="fa-solid fa-check"></i> Resolved</span>'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load follow-ups table:', err);
  }
}

async function markFollowUpResolved(fuId) {
  try {
    await API.updateFollowUp(fuId, { resolution_status: 'Resolved' });
    await loadFollowUpsTable();
  } catch (err) {
    alert(err.message || 'Failed to update follow-up.');
  }
}

function openFollowUpForDrilldown() {
  if (!currentDrilldownData) return;
  document.getElementById('fuStudentId').value = currentDrilldownData.student.id;
  document.getElementById('fuStudentNameDisplay').value = `${currentDrilldownData.student.name} (${currentDrilldownData.student.student_id})`;
  document.getElementById('fuComment').value = '';
  document.getElementById('fuActionRequired').value = '';
  document.getElementById('fuAssignedTo').value = currentDrilldownData.student.mentor_name || '';
  document.getElementById('fuNextReviewDate').value = '';
  document.getElementById('followUpModal').classList.remove('hidden');
}

function openNewFollowUpModal() {
  if (currentStudentRoster.length > 0) {
    const first = currentStudentRoster[0];
    document.getElementById('fuStudentId').value = first.student_id;
    document.getElementById('fuStudentNameDisplay').value = `${first.student_name} (${first.student_code})`;
  }
  document.getElementById('fuComment').value = '';
  document.getElementById('fuActionRequired').value = '';
  document.getElementById('fuNextReviewDate').value = '';
  document.getElementById('followUpModal').classList.remove('hidden');
}

function closeFollowUpModal() {
  document.getElementById('followUpModal').classList.add('hidden');
}

async function submitFollowUp(e) {
  e.preventDefault();
  const studentId = parseInt(document.getElementById('fuStudentId').value);
  const attributeType = document.getElementById('fuAttributeType').value;
  const comment = document.getElementById('fuComment').value.trim();
  const actionRequired = document.getElementById('fuActionRequired').value.trim();
  const assignedTo = document.getElementById('fuAssignedTo').value.trim();
  const nextReviewDate = document.getElementById('fuNextReviewDate').value || null;

  try {
    await API.createFollowUp({
      student_id: studentId,
      attribute_type: attributeType,
      comment,
      action_required: actionRequired,
      assigned_to: assignedTo,
      next_review_date: nextReviewDate
    });
    closeFollowUpModal();
    if (currentDrilldownStudentId) {
      await openStudentDrilldown(currentDrilldownStudentId);
    }
    await loadFollowUpsTable();
    await refreshDashboard();
  } catch (err) {
    alert(err.message || 'Failed to create follow-up.');
  }
}

// Audit Log Modal (FR-16)
async function openAuditModal() {
  try {
    const logs = await API.getAuditLogs(100);
    const tbody = document.getElementById('auditTableBody');
    tbody.innerHTML = '';

    logs.forEach(l => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 border-b border-slate-100';
      tr.innerHTML = `
        <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">${l.timestamp.replace('T', ' ').slice(0, 19)}</td>
        <td class="py-2.5 px-3 font-bold text-slate-800">${l.actor_name}</td>
        <td class="py-2.5 px-3"><span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${l.actor_role}</span></td>
        <td class="py-2.5 px-3 font-semibold text-blue-900">${l.action}</td>
        <td class="py-2.5 px-3 uppercase text-[10px] text-slate-600">${l.entity_type} #${l.entity_id || ''}</td>
        <td class="py-2.5 px-3 text-slate-600">${l.reason || l.before_val + ' -> ' + l.after_val}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('auditModal').classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load audit logs:', err);
  }
}

function closeAuditModal() {
  document.getElementById('auditModal').classList.add('hidden');
}

// Excel Export (BR-UI-12, FR-15)
function downloadExcelReport() {
  const mentor = document.getElementById('mentorFilter').value;
  const url = API.getExcelExportUrl(selectedPeriodId, mentor);
  window.open(url, '_blank');
}

// Tab Switching
function switchTab(tabName) {
  const tabs = ['roster', 'overdue', 'initiation', 'followups'];
  tabs.forEach(t => {
    const content = document.getElementById(`tab-content-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tabName) {
      content.classList.remove('hidden');
      btn.className = 'py-3 px-4 border-b-2 border-blue-900 text-blue-900 flex items-center space-x-2 font-bold';
    } else {
      content.classList.add('hidden');
      btn.className = 'py-3 px-4 border-b-2 border-transparent text-slate-600 hover:text-slate-900 flex items-center space-x-2';
    }
  });
}

function escapeQuote(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
