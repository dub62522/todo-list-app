// Todo list: tasks live in memory and are mirrored to localStorage on every change.
(function () {
  'use strict';

  const STORAGE_KEY = 'todo-list-app.tasks';

  const form = document.getElementById('new-task-form');
  const input = document.getElementById('new-task-input');
  const list = document.getElementById('task-list');
  const emptyMessage = document.getElementById('empty-message');
  const count = document.getElementById('count');
  const clearCompleted = document.getElementById('clear-completed');
  const filterButtons = document.querySelectorAll('[data-filter]');

  let tasks = loadTasks();
  let filter = 'all';

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (err) {
      // Corrupt data or storage blocked (e.g. private mode): start empty.
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      // Storage full or blocked: the app keeps working for this session.
    }
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addTask(text) {
    tasks.push({ id: makeId(), text: text, completed: false });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find(function (t) { return t.id === id; });
    if (task) task.completed = !task.completed;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks();
    render();
  }

  function visibleTasks() {
    if (filter === 'active') return tasks.filter(function (t) { return !t.completed; });
    if (filter === 'completed') return tasks.filter(function (t) { return t.completed; });
    return tasks;
  }

  function renderTask(task) {
    const li = document.createElement('li');
    li.className = 'task' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" as done');

    // textContent (not innerHTML) so task text can never inject markup.
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete';
    del.textContent = '×';
    del.setAttribute('aria-label', 'Delete "' + task.text + '"');

    li.append(checkbox, text, del);
    return li;
  }

  function render() {
    const shown = visibleTasks();
    list.replaceChildren.apply(list, shown.map(renderTask));

    const remaining = tasks.filter(function (t) { return !t.completed; }).length;
    count.textContent = remaining + (remaining === 1 ? ' task left' : ' tasks left');
    clearCompleted.disabled = remaining === tasks.length;

    if (shown.length === 0) {
      emptyMessage.textContent = tasks.length === 0
        ? 'No tasks yet. Add one above.'
        : 'Nothing to show for this filter.';
      emptyMessage.hidden = false;
    } else {
      emptyMessage.hidden = true;
    }

    filterButtons.forEach(function (btn) {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTask(text);
    input.value = '';
    input.focus();
  });

  // One listener on the list handles every task's checkbox and delete button.
  list.addEventListener('change', function (event) {
    if (event.target.matches('input[type="checkbox"]')) {
      toggleTask(event.target.closest('.task').dataset.id);
    }
  });

  list.addEventListener('click', function (event) {
    if (event.target.matches('.delete')) {
      deleteTask(event.target.closest('.task').dataset.id);
    }
  });

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filter = btn.dataset.filter;
      render();
    });
  });

  clearCompleted.addEventListener('click', function () {
    tasks = tasks.filter(function (t) { return !t.completed; });
    saveTasks();
    render();
  });

  // Keep multiple open tabs in sync.
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) {
      tasks = loadTasks();
      render();
    }
  });

  render();
})();
