/* ================================================================
   StudyMate Lite — script.js
   Handles data management, rendering, CRUD, filters, validation,
   and localStorage persistence.
   ================================================================ */

/* ----------------------------------------------------------------
   CONSTANTS & STATE
   ---------------------------------------------------------------- */
const STORAGE_KEY = 'studymate_assignments';

// Current active filter: 'all' | 'active' | 'completed'
let currentFilter = 'all';

// Current search query (lowercased for comparison)
let currentSearch = '';

// Current sort order: 'nearest' | 'farthest'
let currentSort = 'nearest';

// ID of the assignment pending deletion (set when dialog opens)
let pendingDeleteId = null;

/* ----------------------------------------------------------------
   DOM REFERENCES
   ---------------------------------------------------------------- */
const form            = document.getElementById('assignment-form');
const fieldTitle      = document.getElementById('field-title');
const fieldCourse     = document.getElementById('field-course');
const fieldDue        = document.getElementById('field-due');
const fieldPriority   = document.getElementById('field-priority');
const editIdField     = document.getElementById('edit-id');
const formHeading     = document.getElementById('form-heading');
const btnSubmit       = document.getElementById('btn-submit');
const btnCancel       = document.getElementById('btn-cancel');

const listEl          = document.getElementById('assignment-list');
const emptyState      = document.getElementById('empty-state');
const emptyMessage    = document.getElementById('empty-message');

const statTotal       = document.getElementById('stat-total');
const statActive      = document.getElementById('stat-active');
const statCompleted   = document.getElementById('stat-completed');

const tabButtons      = document.querySelectorAll('.tab-btn');

const confirmDialog   = document.getElementById('confirm-dialog');
const btnConfirmDel   = document.getElementById('btn-confirm-delete');
const btnCancelDel    = document.getElementById('btn-cancel-delete');

const searchInput     = document.getElementById('search-input');
const sortSelect      = document.getElementById('sort-select');

/* ----------------------------------------------------------------
   LOCAL STORAGE HELPERS
   ---------------------------------------------------------------- */

/** Load all assignments from localStorage. Returns an array. */
function loadAssignments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/** Persist the assignments array to localStorage. */
function saveAssignments(assignments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

/* ----------------------------------------------------------------
   UNIQUE ID GENERATOR
   ---------------------------------------------------------------- */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ----------------------------------------------------------------
   VALIDATION
   Returns true if valid; shows inline errors if not.
   ---------------------------------------------------------------- */
function validateForm() {
  let valid = true;

  // Clear previous errors
  clearErrors();

  if (!fieldTitle.value.trim()) {
    showError('err-title', fieldTitle, 'Title is required.');
    valid = false;
  }

  if (!fieldCourse.value.trim()) {
    showError('err-course', fieldCourse, 'Course is required.');
    valid = false;
  }

  if (!fieldDue.value) {
    showError('err-due', fieldDue, 'Due date is required.');
    valid = false;
  }

  if (!fieldPriority.value) {
    showError('err-priority', fieldPriority, 'Please select a priority.');
    valid = false;
  }

  return valid;
}

function showError(spanId, inputEl, message) {
  document.getElementById(spanId).textContent = message;
  inputEl.classList.add('is-invalid');
}

function clearErrors() {
  ['err-title', 'err-course', 'err-due', 'err-priority'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  [fieldTitle, fieldCourse, fieldDue, fieldPriority].forEach(el => {
    el.classList.remove('is-invalid');
  });
}

/* ----------------------------------------------------------------
   FORM — ADD & EDIT
   ---------------------------------------------------------------- */

/** Handle form submission: create new or update existing assignment. */
form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!validateForm()) return;

  const assignments = loadAssignments();
  const id = editIdField.value;

  if (id) {
    // --- UPDATE existing assignment ---
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
      assignments[index].title    = fieldTitle.value.trim();
      assignments[index].course   = fieldCourse.value.trim();
      assignments[index].due      = fieldDue.value;
      assignments[index].priority = fieldPriority.value;
      // Status is not reset on edit — preserve existing status
    }
  } else {
    // --- CREATE new assignment ---
    assignments.push({
      id:       generateId(),
      title:    fieldTitle.value.trim(),
      course:   fieldCourse.value.trim(),
      due:      fieldDue.value,
      priority: fieldPriority.value,
      status:   'active',           // new assignments start as active
      createdAt: Date.now()
    });
  }

  saveAssignments(assignments);
  resetForm();
  render();
});

/** Put an assignment's values into the form for editing. */
function beginEdit(id) {
  const assignments = loadAssignments();
  const assignment = assignments.find(a => a.id === id);
  if (!assignment) return;

  editIdField.value      = assignment.id;
  fieldTitle.value       = assignment.title;
  fieldCourse.value      = assignment.course;
  fieldDue.value         = assignment.due;
  fieldPriority.value    = assignment.priority;

  formHeading.textContent  = 'Edit Assignment';
  btnSubmit.textContent    = 'Save Changes';
  btnCancel.hidden         = false;

  // Scroll the form into view on mobile
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Clear the form and return it to "add" mode. */
function resetForm() {
  form.reset();
  editIdField.value        = '';
  formHeading.textContent  = 'Add New Assignment';
  btnSubmit.textContent    = 'Add Assignment';
  btnCancel.hidden         = true;
  clearErrors();
}

// Cancel editing
btnCancel.addEventListener('click', resetForm);

/* ----------------------------------------------------------------
   DELETE WITH CONFIRMATION
   ---------------------------------------------------------------- */

/** Open the native dialog and remember which assignment to delete. */
function requestDelete(id) {
  pendingDeleteId = id;
  confirmDialog.showModal();
}

// Confirmed — proceed with deletion
btnConfirmDel.addEventListener('click', function () {
  if (!pendingDeleteId) return;

  let assignments = loadAssignments();
  assignments = assignments.filter(a => a.id !== pendingDeleteId);
  saveAssignments(assignments);

  // If the deleted item was being edited, reset the form
  if (editIdField.value === pendingDeleteId) resetForm();

  pendingDeleteId = null;
  confirmDialog.close();
  render();
});

// Cancelled — close dialog without deleting
btnCancelDel.addEventListener('click', function () {
  pendingDeleteId = null;
  confirmDialog.close();
});

/* ----------------------------------------------------------------
   STATUS TOGGLE
   ---------------------------------------------------------------- */

/** Toggle an assignment between 'active' and 'completed'. */
function toggleStatus(id) {
  const assignments = loadAssignments();
  const assignment = assignments.find(a => a.id === id);
  if (!assignment) return;

  assignment.status = assignment.status === 'active' ? 'completed' : 'active';
  saveAssignments(assignments);
  render();
}

/* ----------------------------------------------------------------
   FILTER TABS
   ---------------------------------------------------------------- */
tabButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    currentFilter = this.dataset.filter;

    // Update tab appearance and ARIA attributes
    tabButtons.forEach(t => {
      t.classList.remove('tab-btn--active');
      t.setAttribute('aria-selected', 'false');
    });
    this.classList.add('tab-btn--active');
    this.setAttribute('aria-selected', 'true');

    render();
  });
});

/* ----------------------------------------------------------------
   SEARCH
   ---------------------------------------------------------------- */

// Re-render on every keystroke — no duplicated data, just re-filters
searchInput.addEventListener('input', function () {
  currentSearch = this.value.trim().toLowerCase();
  render();
});

/* ----------------------------------------------------------------
   SEARCH CLEAR — keep currentSearch in sync if the browser's
   native × button clears the field without firing 'input'
   ---------------------------------------------------------------- */
searchInput.addEventListener('search', function () {
  currentSearch = this.value.trim().toLowerCase();
  render();
});

/* ----------------------------------------------------------------
   SORT
   ---------------------------------------------------------------- */

// Re-render immediately when the user picks a different sort order
sortSelect.addEventListener('change', function () {
  currentSort = this.value;
  render();
});

/* ----------------------------------------------------------------
   STATISTICS
   ---------------------------------------------------------------- */

/** Update the three stat counters above the form. */
function updateStats(assignments) {
  const total     = assignments.length;
  const completed = assignments.filter(a => a.status === 'completed').length;
  const active    = total - completed;

  statTotal.textContent     = total;
  statActive.textContent    = active;
  statCompleted.textContent = completed;
}

/* ----------------------------------------------------------------
   SAFE TEXT RENDERING
   Prevents XSS by escaping HTML special characters.
   ---------------------------------------------------------------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/** Escape a string for use inside an HTML attribute value (double-quoted). */
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

/* ----------------------------------------------------------------
   DATE HELPERS
   ---------------------------------------------------------------- */

/** Format a YYYY-MM-DD string as "Mon DD, YYYY". */
function formatDate(dateStr) {
  // Append T00:00 to avoid timezone-offset shifting the date
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Return true if the due date (YYYY-MM-DD) is before today. */
function isOverdue(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00');
  return due < today;
}

/* ----------------------------------------------------------------
   RENDER — Build the assignment list from state
   ---------------------------------------------------------------- */

/** Filter, search, sort, build cards, and update stats. Called after every state change. */
function render() {
  const assignments = loadAssignments();

  // Stats always reflect the full dataset, unaffected by search or sort
  updateStats(assignments);

  // 1. Status filter
  let visible = assignments.filter(a => {
    if (currentFilter === 'active')    return a.status === 'active';
    if (currentFilter === 'completed') return a.status === 'completed';
    return true; // 'all'
  });

  // 2. Search filter — match title or course, case-insensitive
  if (currentSearch) {
    visible = visible.filter(a =>
      a.title.toLowerCase().includes(currentSearch) ||
      a.course.toLowerCase().includes(currentSearch)
    );
  }

  // 3. Sort by due date
  visible = visible.slice().sort((a, b) => {
    const diff = a.due.localeCompare(b.due); // YYYY-MM-DD strings sort correctly
    return currentSort === 'nearest' ? diff : -diff;
  });

  // Clear and rebuild the list
  listEl.innerHTML = '';

  if (visible.length === 0) {
    emptyState.hidden = false;
    // Contextual empty-state message depending on what's active
    if (currentSearch) {
      // Show the user's original typed text (searchInput.value), not the lowercased copy
      emptyMessage.textContent = `No assignments match "${searchInput.value.trim()}".`;
    } else if (currentFilter === 'active') {
      emptyMessage.textContent = 'No active assignments. Great work!';
    } else if (currentFilter === 'completed') {
      emptyMessage.textContent = 'No completed assignments yet.';
    } else {
      emptyMessage.textContent = 'No assignments yet. Add one above!';
    }
    return;
  }

  emptyState.hidden = true;

  visible.forEach(a => {
    const li = document.createElement('li');
    li.className = buildCardClass(a);
    li.setAttribute('data-id', a.id);
    li.innerHTML = buildCardHTML(a);
    listEl.appendChild(li);
  });
}

/** Build the CSS class string for a card element. */
function buildCardClass(a) {
  const priorityClass = a.status === 'active'
    ? `assignment-card--${a.priority.toLowerCase()}`
    : '';
  const completedClass = a.status === 'completed' ? 'assignment-card--completed' : '';
  return `assignment-card ${priorityClass} ${completedClass}`.trim();
}

/** Build the inner HTML for an assignment card. */
function buildCardHTML(a) {
  const overdue   = a.status === 'active' && isOverdue(a.due);
  const dueCls    = overdue ? ' due-overdue' : '';
  const dueLabel  = overdue ? '⚠ Overdue · ' : '';

  const statusLabel  = a.status === 'completed' ? 'Mark Active' : 'Mark Complete';
  const statusBadge  = a.status === 'completed'
    ? '<span class="badge badge--status-completed">Completed</span>'
    : '<span class="badge badge--status-active">Active</span>';

  return `
    <div class="card-body">
      <div class="card-header">
        <span class="card-title">${escapeHtml(a.title)}</span>
        <span class="badge badge--${a.priority.toLowerCase()}">${escapeHtml(a.priority)}</span>
        ${statusBadge}
      </div>
      <div class="card-meta">
        <span class="card-meta-item">📖 ${escapeHtml(a.course)}</span>
        <span class="card-meta-item${dueCls}">🗓 ${dueLabel}${formatDate(a.due)}</span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn btn--icon"
              onclick="toggleStatus('${a.id}')"
              aria-label="${escapeAttr(statusLabel)}: ${escapeAttr(a.title)}"
              title="${escapeAttr(statusLabel)}">
        ${a.status === 'completed' ? '↩ Undo' : '✓ Done'}
      </button>
      <button class="btn btn--icon"
              onclick="beginEdit('${a.id}')"
              aria-label="Edit ${escapeAttr(a.title)}"
              title="Edit">
        ✏ Edit
      </button>
      <button class="btn btn--icon"
              onclick="requestDelete('${a.id}')"
              aria-label="Delete ${escapeAttr(a.title)}"
              title="Delete"
              style="color:var(--color-danger);border-color:var(--color-danger)">
        🗑 Delete
      </button>
    </div>
  `;
}

/* ----------------------------------------------------------------
   INITIALISE
   ---------------------------------------------------------------- */

/** Seed sample data only on the very first visit (localStorage is empty). */
function maybeSeedSampleData() {
  if (loadAssignments().length > 0) return;

  const today = new Date();
  const addDays = n => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const samples = [
    { id: generateId(), title: 'Literature Review', course: 'Research Methods', due: addDays(5),  priority: 'High',   status: 'active',    createdAt: Date.now() },
    { id: generateId(), title: 'Lab Report — Titration', course: 'Chemistry 201', due: addDays(2),  priority: 'High',   status: 'active',    createdAt: Date.now() },
    { id: generateId(), title: 'Case Study Presentation', course: 'Business Strategy', due: addDays(10), priority: 'Medium', status: 'active',    createdAt: Date.now() },
    { id: generateId(), title: 'Weekly Problem Set', course: 'Calculus II',       due: addDays(-1), priority: 'Medium', status: 'active',    createdAt: Date.now() },
    { id: generateId(), title: 'Reading Summary', course: 'World History',       due: addDays(7),  priority: 'Low',    status: 'completed', createdAt: Date.now() },
  ];

  saveAssignments(samples);
}

// Boot sequence
maybeSeedSampleData();
render();
