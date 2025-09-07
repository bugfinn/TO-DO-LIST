// Modal functions for task deletion confirmation
// Handles showing, confirming, and canceling task deletion
import { saveTasksToStorage } from './storage.js';

export function showDeleteModal(taskId) {
  const modal = document.getElementById('delete-modal');
  modal.style.display = 'flex';
  modal.dataset.taskId = taskId;
}

export function confirmDelete(allTasks, currentView, refreshCurrentView) {
  const modal = document.getElementById('delete-modal');
  const taskId = modal.dataset.taskId;
  const taskIndex = allTasks.findIndex((t) => t.id == taskId);
  if (taskIndex !== -1) {
    // Remove from DOM
    allTasks[taskIndex].element.remove();
    // Remove from array
    allTasks.splice(taskIndex, 1);

    saveTasksToStorage(allTasks);

    // Refresh current view if needed
    if (currentView !== 'home') {
      refreshCurrentView();
    }
  }
  modal.style.display = 'none';
}

export function cancelDelete() {
  const modal = document.getElementById('delete-modal');
  modal.style.display = 'none';
}
