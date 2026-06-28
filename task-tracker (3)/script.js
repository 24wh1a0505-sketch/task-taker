/**
 * Simple Task Tracker Web Application
 * Vanilla HTML, CSS, & JS with LocalStorage Persistence
 */

// Application State
let tasks = [];
let editingTaskId = null;
let deletingTaskId = null;

// DOM Elements
const taskForm = document.getElementById('task-form');
const formTitle = document.getElementById('form-title');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskStatusInput = document.getElementById('task-status');
const taskDueDateInput = document.getElementById('task-due-date');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const filterTabs = document.querySelectorAll('.filter-tab');
const tasksGrid = document.getElementById('tasks-grid');

// Counters
const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const progressCountEl = document.getElementById('progress-count');
const completedCountEl = document.getElementById('completed-count');

// Modal Elements
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// Toast Container
const toastContainer = document.getElementById('toast-container');

// SVG Icons Constants
const ICONS = {
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  delete: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
  clipboard: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  setupEventListeners();
  renderApp();
  
  // Set default due date to today + 1 day
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  taskDueDateInput.value = tomorrow.toISOString().split('T')[0];
});

// Load tasks from LocalStorage
function loadTasks() {
  const storedTasks = localStorage.getItem('tasks');
  if (storedTasks) {
    try {
      tasks = JSON.parse(storedTasks);
    } catch (e) {
      console.error('Error parsing tasks from localStorage', e);
      tasks = [];
    }
  } else {
    // Inject some polished seed tasks for first-time premium feel
    tasks = [
      {
        id: 'seed-1',
        title: 'Design Task Tracker UI mockup',
        description: 'Design the layout grid and mobile responsiveness for the dashboard using modern custom CSS styling variables.',
        status: 'completed',
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        createdDate: new Date(Date.now() - 172800000).toLocaleString() // 2 days ago
      },
      {
        id: 'seed-2',
        title: 'Implement LocalStorage operations',
        description: 'Code persistent browser storage logic, dynamic list updates, search indexes, filters, and stats counters.',
        status: 'progress',
        dueDate: new Date().toISOString().split('T')[0], // Today
        createdDate: new Date(Date.now() - 86400000).toLocaleString() // Yesterday
      },
      {
        id: 'seed-3',
        title: 'Write project developer overview',
        description: 'Document architecture, design decisions, and lightweight file structure constraints within index.html.',
        status: 'pending',
        dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 days later
        createdDate: new Date().toLocaleString()
      }
    ];
    saveTasksToStorage();
  }
}

// Save tasks to LocalStorage
function saveTasksToStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Setup Event Listeners
function setupEventListeners() {
  // Form submission
  taskForm.addEventListener('submit', handleFormSubmit);
  
  // Cancel Edit action
  cancelBtn.addEventListener('click', exitEditMode);
  
  // Search & Filter & Sort inputs
  searchInput.addEventListener('input', renderApp);
  sortSelect.addEventListener('change', renderApp);
  
  // Filter tabs click handlers
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderApp();
    });
  });
  
  // Confirm Delete Modal Actions
  confirmDeleteBtn.addEventListener('click', executeDeleteTask);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  
  // Close modal when clicking overlay
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });
}

// Render Complete Application View
function renderApp() {
  renderStats();
  renderTaskList();
}

// Render Dashboard Counters
function renderStats() {
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const progress = tasks.filter(t => t.status === 'progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  
  totalCountEl.textContent = total;
  pendingCountEl.textContent = pending;
  progressCountEl.textContent = progress;
  completedCountEl.textContent = completed;
}

// Get Active Filter Value
function getActiveFilter() {
  const activeTab = document.querySelector('.filter-tab.active');
  return activeTab ? activeTab.getAttribute('data-filter') : 'all';
}

// Render Tasks Grid/List based on Filters, Search, and Sort
function renderTaskList() {
  const filter = getActiveFilter();
  const searchVal = searchInput.value.trim().toLowerCase();
  const sortBy = sortSelect.value;
  
  // Filter tasks
  let processedTasks = tasks.filter(task => {
    // Status Filter Check
    const matchesFilter = filter === 'all' || task.status === filter;
    
    // Search Check (search by title)
    const matchesSearch = task.title.toLowerCase().includes(searchVal);
    
    return matchesFilter && matchesSearch;
  });
  
  // Sort tasks
  processedTasks.sort((a, b) => {
    if (sortBy === 'newest') {
      // Parse dates or fallback
      const dateA = new Date(a.createdDate).getTime() || 0;
      const dateB = new Date(b.createdDate).getTime() || 0;
      return dateB - dateA; // Descending
    } else if (sortBy === 'oldest') {
      const dateA = new Date(a.createdDate).getTime() || 0;
      const dateB = new Date(b.createdDate).getTime() || 0;
      return dateA - dateB; // Ascending
    } else if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
  
  // Empty State Check
  if (processedTasks.length === 0) {
    tasksGrid.innerHTML = `
      <div id="tasks-empty-state" class="empty-state">
        <div class="empty-icon">${ICONS.clipboard}</div>
        <h3>No tasks found</h3>
        <p>${searchVal || filter !== 'all' ? 'Try adjusting your filters, search term, or create a brand new task to get started.' : 'Your workspace is beautifully clear. Add a task on the left to start mapping your goals.'}</p>
      </div>
    `;
    return;
  }
  
  // Render cards
  tasksGrid.innerHTML = processedTasks.map(task => {
    const formattedDueDate = task.dueDate ? formatDate(task.dueDate) : 'No due date';
    const statusLabel = task.status === 'pending' ? 'Pending' : task.status === 'progress' ? 'In Progress' : 'Completed';
    
    return `
      <div id="task-card-${task.id}" class="task-card ${task.status}">
        <div class="task-card-header">
          <h4 class="task-card-title">${escapeHTML(task.title)}</h4>
          <span class="status-badge ${task.status}">${statusLabel}</span>
        </div>
        
        <div class="task-card-body">
          <p class="task-card-desc">${escapeHTML(task.description)}</p>
          
          <div class="task-card-meta">
            <div class="meta-item">
              ${ICONS.calendar}
              <span><strong>Due:</strong> ${formattedDueDate}</span>
            </div>
            <div class="meta-item">
              ${ICONS.clock}
              <span><strong>Created:</strong> ${task.createdDate}</span>
            </div>
          </div>
        </div>
        
        <div class="task-card-actions">
          <button id="btn-edit-${task.id}" class="btn-icon" onclick="enterEditMode('${task.id}')" title="Edit Task">
            ${ICONS.edit}
          </button>
          <button id="btn-delete-${task.id}" class="btn-icon delete" onclick="triggerDeleteTask('${task.id}')" title="Delete Task">
            ${ICONS.delete}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Form Submission (Add or Update)
function handleFormSubmit(e) {
  e.preventDefault();
  
  // Validate Fields
  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();
  const status = taskStatusInput.value;
  const dueDate = taskDueDateInput.value;
  
  let isValid = true;
  
  // Validate Title
  if (!title) {
    taskTitleInput.parentElement.classList.add('invalid');
    isValid = false;
  } else {
    taskTitleInput.parentElement.classList.remove('invalid');
  }
  
  // Validate Description
  if (!desc) {
    taskDescInput.parentElement.classList.add('invalid');
    isValid = false;
  } else {
    taskDescInput.parentElement.classList.remove('invalid');
  }
  
  if (!isValid) {
    showToast('Please correct validation errors first.', 'error');
    return;
  }
  
  if (editingTaskId) {
    // Edit Mode: Update Existing
    const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].title = title;
      tasks[taskIndex].description = desc;
      tasks[taskIndex].status = status;
      tasks[taskIndex].dueDate = dueDate;
      
      saveTasksToStorage();
      showToast('Task updated successfully!', 'success');
      exitEditMode();
    } else {
      showToast('Error editing task. Task not found.', 'error');
    }
  } else {
    // Create Mode: Add New
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title,
      description: desc,
      status,
      dueDate,
      createdDate: new Date().toLocaleString()
    };
    
    tasks.push(newTask);
    saveTasksToStorage();
    showToast('Task created successfully!', 'success');
    resetForm();
  }
  
  renderApp();
}

// Reset Form Inputs
function resetForm() {
  taskForm.reset();
  
  // Set default due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  taskDueDateInput.value = tomorrow.toISOString().split('T')[0];
  
  // Clear any validation classes
  taskTitleInput.parentElement.classList.remove('invalid');
  taskDescInput.parentElement.classList.remove('invalid');
}

// Edit Mode Activation
window.enterEditMode = function(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  editingTaskId = taskId;
  
  // Highlight active editing state on UI
  formTitle.innerHTML = `${ICONS.edit} Edit Task`;
  submitBtn.innerHTML = `Save Changes`;
  cancelBtn.style.display = 'flex';
  
  // Populate Fields
  taskTitleInput.value = task.title;
  taskDescInput.value = task.description;
  taskStatusInput.value = task.status;
  taskDueDateInput.value = task.dueDate;
  
  // Clear any existing validation states
  taskTitleInput.parentElement.classList.remove('invalid');
  taskDescInput.parentElement.classList.remove('invalid');
  
  // Smooth scroll sidebar into view on mobile screens
  if (window.innerWidth <= 968) {
    taskForm.scrollIntoView({ behavior: 'smooth' });
  }
};

// Exit Edit Mode
function exitEditMode() {
  editingTaskId = null;
  formTitle.innerHTML = `${ICONS.plus} Create New Task`;
  submitBtn.innerHTML = `${ICONS.plus} Add Task`;
  cancelBtn.style.display = 'none';
  resetForm();
}

// Delete Mode Confirmation Flow
window.triggerDeleteTask = function(taskId) {
  deletingTaskId = taskId;
  deleteModal.classList.add('active');
};

function executeDeleteTask() {
  if (!deletingTaskId) return;
  
  const taskIndex = tasks.findIndex(t => t.id === deletingTaskId);
  if (taskIndex !== -1) {
    // If currently editing the task being deleted, exit edit mode
    if (editingTaskId === deletingTaskId) {
      exitEditMode();
    }
    
    tasks.splice(taskIndex, 1);
    saveTasksToStorage();
    showToast('Task deleted successfully.', 'info');
  }
  
  closeDeleteModal();
  renderApp();
}

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  deletingTaskId = null;
}

// Custom Toast Alerts System
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.id = `toast-${Date.now()}`;
  toast.innerHTML = `
    ${ICONS.info}
    <span>${escapeHTML(message)}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger slide-in
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);
  
  // Exit fade-out transition
  setTimeout(() => {
    toast.classList.add('fade-out');
    // Remove element completely
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3500);
}

// Helpers
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Support safe local format (e.g. Jun 28, 2026)
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
