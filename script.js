// Select elements
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const searchInput = document.getElementById('searchInput');

const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const themeSelect = document.getElementById('themeSelect');

const darkModeToggle = document.getElementById('darkModeToggle');

// AI Chatbot elements
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatDisplay = document.getElementById('chatDisplay');

let tasks = [];
let filter = 'all';

// Load tasks from localStorage
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  if (saved) tasks = JSON.parse(saved);
}
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Generate unique ID for tasks
function generateId() {
  return Date.now() + Math.random().toString(16).slice(2);
}

// Capitalize first letter utility
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Create task li element
function createTaskElement(task) {
  const li = document.createElement('li');
  li.draggable = true;
  li.dataset.id = task.id;
  li.classList.toggle('completed', task.completed);

  // Check button toggle complete
  const checkBtn = document.createElement('button');
  checkBtn.classList.add('check-btn');
  checkBtn.setAttribute('aria-label', task.completed ? 'Mark task as incomplete' : 'Mark task as complete');
  checkBtn.addEventListener('click', () => {
    toggleComplete(task.id);
  });
  li.appendChild(checkBtn);

  // Task text or edit input
  const taskText = document.createElement('div');
  taskText.classList.add('task-text');
  if (task.editing) taskText.classList.add('editing');

  if (task.editing) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.setAttribute('aria-label', 'Edit task');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') finishEditing(task.id, input.value.trim());
      else if (e.key === 'Escape') cancelEditing(task.id);
    });
    input.addEventListener('blur', () => finishEditing(task.id, input.value.trim()));
    taskText.appendChild(input);
    setTimeout(() => input.focus(), 0);
  } else {
    taskText.textContent = task.text;
    taskText.title = task.text;
    taskText.tabIndex = 0;
    taskText.addEventListener('dblclick', () => enableEditing(task.id));
    taskText.addEventListener('keydown', e => {
      if (e.key === 'Enter') enableEditing(task.id);
    });
  }
  li.appendChild(taskText);

  // Priority tag
  const priorityTag = document.createElement('span');
  priorityTag.classList.add('priority-tag');
  priorityTag.classList.add(`priority-${task.priority}`);
  priorityTag.textContent = capitalize(task.priority);
  priorityTag.title = `Priority: ${capitalize(task.priority)}`;
  li.appendChild(priorityTag);

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.classList.add('edit-btn');
  editBtn.innerHTML = '✏️';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.addEventListener('click', () => enableEditing(task.id));
  li.appendChild(editBtn);

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.innerHTML = '❌';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  li.appendChild(deleteBtn);

  return li;
}

// Render tasks with current filter and search
function renderTasks() {
  taskList.innerHTML = '';

  let filtered = tasks;

  if (filter === 'active') filtered = filtered.filter(t => !t.completed);
  else if (filter === 'completed') filtered = filtered.filter(t => t.completed);

  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter(t => t.text.toLowerCase().includes(searchTerm));
  }

  filtered.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });

  addDragAndDropListeners();
}

// Add new task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  const priority = prioritySelect.value;
  tasks.push({ id: generateId(), text, completed: false, priority, editing: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

// Toggle task completion
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Enable editing
function enableEditing(id) {
  tasks.forEach(t => (t.editing = false));
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.editing = true;
  renderTasks();
}

// Finish editing
function finishEditing(id, newText) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  if (newText) task.text = newText;
  task.editing = false;
  saveTasks();
  renderTasks();
}

// Cancel editing
function cancelEditing(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.editing = false;
  renderTasks();
}

// Filter buttons
filterButtons.forEach(btn =>
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    renderTasks();
  })
);

// Clear completed tasks
clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
});

// Add task on button or enter key
addTaskBtn.addEventListener('click', () => addTask());
taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});

// Search input event
searchInput.addEventListener('input', () => renderTasks());

// Dark mode toggle (for backward compatibility with just dark mode)
darkModeToggle.addEventListener('click', () => {
  const body = document.body;
  if (body.classList.contains('dark')) {
    applyTheme('light');
    themeSelect.value = 'light';
  } else {
    applyTheme('dark');
    themeSelect.value = 'dark';
  }
  localStorage.setItem('theme', themeSelect.value);
});

// Profile modal open/close handlers
profileBtn.addEventListener('click', () => {
  profileModal.setAttribute('aria-hidden', 'false');
  themeSelect.focus();
});

modalCloseBtn.addEventListener('click', () => {
  profileModal.setAttribute('aria-hidden', 'true');
});

profileModal.addEventListener('click', e => {
  if (e.target === profileModal) {
    profileModal.setAttribute('aria-hidden', 'true');
  }
});

// Theme selection and application
function applyTheme(theme) {
  const themes = ['light', 'dark', 'solarized', 'highContrast'];
  document.body.classList.remove(...themes);
  if (themes.includes(theme)) {
    document.body.classList.add(theme);
  } else {
    document.body.classList.add('light');
  }
}

themeSelect.addEventListener('change', () => {
  const selected = themeSelect.value;
  applyTheme(selected);
  localStorage.setItem('theme', selected);
});

function loadTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  themeSelect.value = saved;
  applyTheme(saved);
}

// Initialize tasks and theme
function init() {
  loadTasks();
  loadTheme();
  renderTasks();
}

init();

// Drag and Drop Setup
let dragSrcEl = null;

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  this.classList.add('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter() {
  this.classList.add('over');
}

function handleDragLeave() {
  this.classList.remove('over');
}

function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();

  if (dragSrcEl !== this) {
    const srcId = dragSrcEl.dataset.id;
    const targetId = this.dataset.id;

    const srcIndex = tasks.findIndex(t => t.id === srcId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);

    tasks.splice(targetIndex, 0, tasks.splice(srcIndex, 1)[0]);

    saveTasks();
    renderTasks();
  }
  return false;
}

function handleDragEnd() {
  this.classList.remove('dragging');
  const items = [...taskList.querySelectorAll('li')];
  items.forEach(item => item.classList.remove('over'));
}

function addDragAndDropListeners() {
  const items = [...taskList.querySelectorAll('li')];
  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
}

// AI Chatbot simulation (replace with real Perplexity AI API integration)
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  appendMessage('user-msg', userMsg);
  chatInput.value = '';

  appendMessage('bot-msg', 'Thinking...');
  chatDisplay.scrollTop = chatDisplay.scrollHeight;

  // Simulate AI response delay
  setTimeout(() => {
    const thinkingMsg = [...chatDisplay.querySelectorAll('.bot-msg')]
      .find(msg => msg.textContent === 'Thinking...');
    if (thinkingMsg) thinkingMsg.remove();

    // Example simulated response
    appendMessage('bot-msg', `Simulated AI reply: "${userMsg}"`);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }, 1500);
});

function appendMessage(className, text) {
  const div = document.createElement('div');
  div.classList.add(className);
  div.textContent = text;
  chatDisplay.appendChild(div);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}
