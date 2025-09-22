import { showDeleteModal, confirmDelete, cancelDelete } from './modal.js';
import { loadTasksFromStorage } from './storage.js';
import {
  addTask,
  toggleTaskComplete,
  toggleTaskImportant,
  createTaskFromData,
  clearCompletedTasks,
} from './tasks.js';
import { initializeTheme, setupThemeToggle } from './theme.js';
const taskInput = document.querySelector(
  '.second-container input[type="text"]'
);
// DOM ref
const addTaskIcon = document.querySelector('.add-task-icon');
const tasksContainer = document.querySelector('.tasks-container');
const allTasksLink = document.getElementById('all-tasks-link');
const secondContainer = document.querySelector('.second-container');
const mainContent = document.querySelector('.main-content');
const completedTasksLink = document.getElementById('completed-tasks-link');
const searchInput = document.getElementById('search-input');
let currentSearchTerm = '';

// Mobile sidebar toggling
const menuToggleButton = document.getElementById('menu-toggle');
const sidebarElement = document.querySelector('.sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');

// function to open and close sidebar
function openSidebar() {
  if (!sidebarElement) return;
  sidebarElement.classList.add('open');
  if (sidebarBackdrop) sidebarBackdrop.classList.add('show');
}

function closeSidebar() {
  if (!sidebarElement) return;
  sidebarElement.classList.remove('open');
  if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
}

if (menuToggleButton) {
  menuToggleButton.addEventListener('click', function () {
    if (sidebarElement && sidebarElement.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener('click', closeSidebar);
}

// Close sidebar when a sidebar link is clicked (mobile UX)
const sidebarLinks = document.querySelectorAll('.sidebar a');
if (sidebarLinks && sidebarLinks.length > 0) {
  sidebarLinks.forEach((link) => {
    link.addEventListener('click', function () {
      if (link.closest('.settings-item')) {
        //not to close sidebar while clicking on setting

        return;
      }
      // Only relevant on small screens
      if (window.matchMedia('(max-width: 768px)').matches) {
        closeSidebar();
      }
    });
  });
}

//  Handles opening and closing the settings panel on user interaction
document.addEventListener('DOMContentLoaded', function () {
  const settingsLink = document.querySelector('.settings-item > a');
  const settingsPanel = document.querySelector('.settings-panel');

  if (settingsLink && settingsPanel) {
    settingsLink.addEventListener('click', function (e) {
      e.preventDefault();
      settingsPanel.classList.toggle('show');
    });
  }
  document.addEventListener('click', function (e) {
    const settingsPanel = document.querySelector('.settings-panel');
    const settingsItem = document.querySelector('.settings-item');

    if (settingsPanel && !settingsItem.contains(e.target)) {
      settingsPanel.classList.remove('show');
    }
  });
});

// Add array to store all tasks
let allTasks = [];
let currentView = 'home'; // Track current view

// Utility to refresh current view after changes
function refreshCurrentView() {
  if (currentView === 'allTasks') showAllTasksView();
  else if (currentView === 'home') showHomeView();
  else if (currentView === 'important') showImportantTasksView();
  else if (currentView === 'completed') showCompletedTasksView();
}

// Renders the "My Day" view, including header and all tasks.
// If no tasks exist, shows a motivational message.
function showAllTasksView() {
  currentView = 'allTasks';

  mainContent.classList.add('all-tasks-view');

  // Show the add task bar for My Day view
  secondContainer.style.display = 'flex';

  tasksContainer.innerHTML = '';

  const dayHeader = document.createElement('div');
  dayHeader.className = 'day-header';
  dayHeader.style.cssText = `
        padding: 20px 0; 
        border-bottom: 1px solid #eee; 
        margin-bottom: 20px;
        text-align: center;
    `;

  const today = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const dateString = today.toLocaleDateString('en-US', options);

  dayHeader.innerHTML = `
        <h2 style="color: #333; margin: 0; font-weight: 300; font-size: 1.8em;">
            <i class="fas fa-calendar-day" style="margin-right: 10px; color: #4a90e2;"></i>
            My Day
        </h2>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 1em;">${dateString}</p>
    `;

  tasksContainer.appendChild(dayHeader);

  if (allTasks.length === 0) {
    const emptyMessage = document.createElement('div');

    emptyMessage.style.cssText =
      'text-align: center; color: #666; padding: 40px 20px;';
    emptyMessage.innerHTML = `
            <i class="fas fa-sun" style="font-size: 50px; color: #ffc107; margin-bottom: 15px;"></i>
            <p style="font-size: 1.2em; margin: 0;">Start your day by adding a task below!</p>
        `;
    tasksContainer.appendChild(emptyMessage);
  } else {
    // Create a container for tasks
    const tasksWrapper = document.createElement('div');
    tasksWrapper.className = 'tasks-wrapper';

    allTasks.forEach((task) => {
      tasksWrapper.appendChild(task.element);
    });

    tasksContainer.appendChild(tasksWrapper);
  }
}

// Function to show home view (default view)
function showHomeView() {
  currentView = 'home';
  mainContent.classList.remove('all-tasks-view');
  secondContainer.style.display = 'none'; // Hide add task bar in home view
  tasksContainer.innerHTML = '';

  // Add welcome image and content to home view
  const homeContent = document.createElement('div');
  homeContent.className = 'home-welcome';
  homeContent.style.cssText = `
        text-align: center; 
        padding: 40px 20px;  
        max-width: 500px; 
        margin: 0 auto;
    `;

  homeContent.innerHTML = `
        <div class="home-icon-container">
            <i class="fas fa-clipboard-list"></i>
        </div>
        <h1>Welcome to Your Todo App</h1>
        <p>
             Manage your tasks with ease. Add new tasks, mark them as important or completed, and organize your day efficiently.
              Use the navigation to view all tasks, important tasks, or completed tasks.
        </p>
        <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
            <button onclick="document.getElementById('all-tasks-link').click()" 
                    style="padding: 12px 24px; background: #4a90e2; color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px; transition: background 0.3s;">
                <i class="fas fa-tasks" style="margin-right: 8px;"></i>My Day
            </button>
            <button onclick="document.getElementById('important-tasks-link').click()" 
                    style="padding: 12px 24px; background: #ffc107; color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px; transition: background 0.3s;">
                <i class="fas fa-star" style="margin-right: 8px;"></i>Important
            </button>
        </div>
    `;

  tasksContainer.appendChild(homeContent);
}

// Add click event to "All Task" link
allTasksLink.addEventListener('click', function (e) {
  e.preventDefault();
  showAllTasksView();
});

// Add task on Enter key press
taskInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    addTask(allTasks, taskInput, tasksContainer, currentView);
  }
});

// Add task on icon click
addTaskIcon.addEventListener('click', function () {
  addTask(allTasks, taskInput, tasksContainer, currentView);
});

// Show empty message on page load
const savedTasks = loadTasksFromStorage();
if (savedTasks.length > 0) {
  savedTasks.forEach((taskData) => {
    createTaskFromData(taskData, allTasks, tasksContainer, currentView);
  });
}

function showCompletedTasksView() {
  currentView = 'completed';

  // adding css class for diff background
  mainContent.classList.add('all-tasks-view');

  //hide the add task bar
  secondContainer.style.display = 'none';
  //clearing container first
  tasksContainer.innerHTML = '';

  const completedTasks = allTasks.filter((task) => task.completed);

  if (completedTasks.length === 0) {
    tasksContainer.innerHTML =
      '<p class="texted-state">No completed tasks yet !</p>';
  } else {
    //adding clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Completed';
    clearButton.className = 'clear-completed-btn';
    tasksContainer.appendChild(clearButton);

    //  completed tasks
    completedTasks.forEach((task) => {
      tasksContainer.appendChild(task.element);
    });

    // adding click event to clear button
    clearButton.addEventListener('click', () =>
      clearCompletedTasks(allTasks, refreshCurrentView)
    );
  }
}

const importantTasksLink = document.getElementById('important-tasks-link');

importantTasksLink.addEventListener('click', function (e) {
  e.preventDefault();
  showImportantTasksView();
});
completedTasksLink.addEventListener('click', function (e) {
  e.preventDefault();
  showCompletedTasksView();
});
// function to show important tasks and do filter for important
function showImportantTasksView() {
  currentView = 'important';
  // adding css class
  mainContent.classList.add('all-tasks-view');

  //show task bar
  secondContainer.style.display = 'flex';

  // clearing the container
  tasksContainer.innerHTML = '';
  // filter the important task
  const importantTask = allTasks.filter((task) => task.important);
  if (importantTask.length === 0) {
    tasksContainer.innerHTML =
      '<p class="text-state">No important tasks yet !</p>';
  } else {
    importantTask.forEach((task) => {
      tasksContainer.appendChild(task.element);
    });
  }
}

// Add this once, instead of per-task listeners
tasksContainer.addEventListener('click', function (e) {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  const taskId = parseInt(taskItem.dataset.taskId);

  if (e.target.classList.contains('task-checkbox')) {
    toggleTaskComplete(taskId, allTasks, currentView, refreshCurrentView);
  } else if (e.target.classList.contains('star-icon')) {
    toggleTaskImportant(taskId, allTasks, currentView, refreshCurrentView);
  } else if (e.target.classList.contains('delete-icon')) {
    showDeleteModal(taskId);
  }
});

const homeLink = document.getElementById('home-link');

homeLink.addEventListener('click', function (e) {
  e.preventDefault();
  showHomeView();
});

function filterTasks(searchTerm) {
  currentSearchTerm = searchTerm.toLowerCase();

  // Clear container
  tasksContainer.innerHTML = '';

  // If search is empty, return to current view
  if (currentSearchTerm === '') {
    if (currentView === 'home') {
      showHomeView();
    } else if (currentView === 'allTasks') {
      showAllTasksView();
    } else if (currentView === 'important') {
      showImportantTasksView();
    } else if (currentView === 'completed') {
      showCompletedTasksView();
    }
    return;
  }

  // Search ALL tasks regardless of current view
  const filteredTasks = allTasks.filter((task) => {
    return task.text.toLowerCase().includes(currentSearchTerm);
  });

  // Display all matching tasks
  if (filteredTasks.length === 0) {
    tasksContainer.innerHTML =
      '<p style="text-align: center; color: #666; padding: 20px;">No tasks found matching "' +
      searchTerm +
      '"</p>';
  } else {
    // Show search results header
    const searchHeader = document.createElement('h3');
    searchHeader.textContent = `Search results for "${searchTerm}" (${filteredTasks.length} found)`;
    searchHeader.style.cssText =
      'text-align: center; color: #333; margin-bottom: 20px; font-weight: normal;';
    tasksContainer.appendChild(searchHeader);

    // Show all matching tasks
    filteredTasks.forEach((task) => {
      tasksContainer.appendChild(task.element);
    });
  }
}

// Real-time search as user types - shows ALL matching tasks
searchInput.addEventListener('input', function (e) {
  const searchTerm = e.target.value.trim();
  filterTasks(searchTerm);
});

// Clear search when user presses Escape
searchInput.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    searchInput.value = '';
    filterTasks('');
  }
});

// Replace everything after line 441 with this clean version:
const searchIcon = document.querySelector('.search-icon');

if (searchIcon) {
  // Test click first
  searchIcon.addEventListener('click', function () {
    console.log('Icon clicked!'); // Check console
    const searchTerm = searchInput.value.trim();

    if (searchTerm !== '') {
      filterTasks(searchTerm);
    } else {
      alert('Please enter search text first!');
    }

    searchInput.focus();
  });

  // Add hover effects
  searchIcon.style.cursor = 'pointer';
  searchIcon.addEventListener('mouseenter', function () {
    this.style.color = '#1e1f20ff';
  });

  searchIcon.addEventListener('mouseleave', function () {
    this.style.color = '';
  });
} else {
  console.error('Search icon not found!');
}

// Set home view as default when page loads
document.addEventListener('DOMContentLoaded', function () {
  showHomeView();
});

showHomeView();

// Set up modal event listeners
document.getElementById('confirm-delete').addEventListener('click', () => {
  confirmDelete(allTasks, currentView, refreshCurrentView);
});
document
  .getElementById('cancel-delete')
  .addEventListener('click', cancelDelete);

initializeTheme();
setupThemeToggle();

