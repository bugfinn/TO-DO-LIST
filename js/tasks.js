import { saveTasksToStorage } from './storage.js';
// Creates a new task and adds it to the DOM and allTasks array
export function addTask(
  allTasks,
  taskInput,
  tasksContainer,
  currentView = 'home'
) {
  const taskText = taskInput.value.trim();

  if (taskText !== '') {
    // Clear the container first (this removes the "no tasks" message)
    if (allTasks.length === 0) {
      tasksContainer.innerHTML = '';
    }

    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    const isImportant = currentView === 'important';

    taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox">
            <span class="task-text">${taskText}</span>
            <i class="fa-regular fa-star star-icon"></i>
            <i class="fas fa-trash-alt delete-icon"></i>
        `;
    if (isImportant) {
      const starIcon = taskItem.querySelector('.star-icon');
      starIcon.className = 'fas fa-star star-icon';
      starIcon.style.color = '#ffc107';
    }
    tasksContainer.appendChild(taskItem);

    // Also store in array for "All Task" functionality
    const taskId = Date.now(); // defined the task id

    // Add taskId to DOM element for event delegation
    taskItem.dataset.taskId = taskId;

    allTasks.push({
      id: taskId, // a unique id
      completed: false, // to track completed task
      important: isImportant,
      text: taskText,
      element: taskItem,
    });

    taskInput.value = ''; // Clear input
    saveTasksToStorage(allTasks);
  }
}

export function toggleTaskComplete(
  taskId,
  allTasks,
  currentView,
  refreshCurrentView
) {
  // Find the task in allTasks array
  const task = allTasks.find((t) => t.id === taskId);
  if (task) {
    // finding the  task in allTasks array
    task.completed = !task.completed;

    //update the visual styling
    const taskText = task.element.querySelector('.task-text');
    if (task.completed) {
      taskText.style.textDecoration = 'line-through';
      taskText.style.color = '#888';
    } else {
      taskText.style.textDecoration = 'none';
      taskText.style.color = '';
    }

    // Only refresh view for specific views that need filtering
    if (currentView === 'important' || currentView === 'completed') {
      refreshCurrentView();
    }
    // Don't refresh home view or allTasks view - let tasks stay visible
  }
  saveTasksToStorage(allTasks);
}

export function toggleTaskImportant(
  taskId,
  allTasks,
  currentView,
  refreshCurrentView
) {
  const task = allTasks.find((t) => t.id === taskId);
  if (task) {
    task.important = !task.important;

    // Update star icon visual
    const starIcon = task.element.querySelector('.star-icon');
    if (task.important) {
      starIcon.className = 'fas fa-star star-icon';
      starIcon.style.color = '#ffc107';
    } else {
      starIcon.className = 'fa-regular fa-star star-icon';
      starIcon.style.color = '#ccc';
    }

    saveTasksToStorage(allTasks);

    // Refresh current view if needed
    if (currentView === 'important') {
      refreshCurrentView();
    }
  }
}

export function createTaskFromData(
  taskData,
  allTasks,
  tasksContainer,
  currentView
) {
  // Create the DOM element
  const taskItem = document.createElement('div');
  taskItem.className = 'task-item';
  taskItem.dataset.taskId = taskData.id; // Add taskId for event delegation
  taskItem.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${
          taskData.completed ? 'checked' : ''
        }>
        <span class="task-text">${taskData.text}</span>
        <i class="fa-regular fa-star star-icon"></i>
        <i class="fas fa-trash-alt delete-icon"></i> 
    `;

  // Add to allTasks array
  allTasks.push({
    id: taskData.id,
    completed: taskData.completed,
    important: taskData.important,
    text: taskData.text,
    element: taskItem,
  });

  // Apply visual states
  applyTaskStyling(taskItem, taskData);

  // Add to display only if in home view
  if (currentView === 'home') {
    tasksContainer.appendChild(taskItem);
  }
}

export function applyTaskStyling(taskItem, taskData) {
  const taskText = taskItem.querySelector('.task-text');
  const starIcon = taskItem.querySelector('.star-icon');

  // Apply completed styling
  if (taskData.completed) {
    taskText.style.textDecoration = 'line-through';
    taskText.style.color = '#888';
  }

  // Apply important styling
  if (taskData.important) {
    starIcon.className = 'fas fa-star star-icon';
    starIcon.style.color = '#ffc107';
  }
}

export function clearCompletedTasks(allTasks, refreshCurrentView) {
  // Filter out completed tasks
  const remainingTasks = allTasks.filter((task) => !task.completed);

  // Clear the array and repopulate with remaining tasks
  allTasks.length = 0;
  allTasks.push(...remainingTasks);

  // refresh the completed view
  refreshCurrentView();
  saveTasksToStorage(allTasks);
}
