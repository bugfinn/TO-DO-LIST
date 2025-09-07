export function saveTasksToStorage(allTasks) {
  try {
    // Create clean data without DOM elements
    const tasksData = allTasks.map((task) => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      important: task.important,
    }));

    localStorage.setItem('todoAppTasks', JSON.stringify(tasksData));
    console.log('Tasks saved to localStorage');
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
}

export function loadTasksFromStorage() {
  try {
    const savedTasks = localStorage.getItem('todoAppTasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    } else {
      console.log('No saved tasks found');
      return [];
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}