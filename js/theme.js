export function initializeTheme() {
  // Apply saved theme on page load
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  // Initialize the theme icon
  initializeThemeIcon();
}

export function setupThemeToggle() {
  // Enhanced theme toggle with icon switching
  document
    .getElementById('theme-toggle')
    .addEventListener('click', function () {
      const body = document.body;
      const themeIcon = this.querySelector('i'); // Get the icon inside the button

      // Toggle dark mode and save to localStorage
      const isDark = body.classList.toggle('dark');
      if (isDark) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }

      // Switch icon based on current theme
      updateThemeIcon(body, themeIcon, this);
    });

  // Also allow clicking anywhere in the settings panel to toggle theme
  const settingsPanelEl = document.getElementById('settings-panel');
  const themeBtn = document.getElementById('theme-toggle');

  if (settingsPanelEl && themeBtn) {
    settingsPanelEl.addEventListener('click', function (e) {
      if (!(e.target instanceof Element)) return;
      // Prevent double toggling when the actual button/icon is clicked
      if (e.target.closest('#theme-toggle')) return;
      themeBtn.click();
    });
  }
}
// function ti inintialize the theme icon
function initializeThemeIcon() {
  const themeButton = document.getElementById('theme-toggle');
  const themeIcon = themeButton.querySelector('i');
  const body = document.body;

  updateThemeIcon(body, themeIcon, themeButton);
}

function updateThemeIcon(body, themeIcon, themeButton) {
  if (body.classList.contains('dark')) {
    // Dark mode is ON → Show SUN icon (to switch back to light)
    themeIcon.className = 'fas fa-sun';
    themeButton.title = 'Switch to light mode';
  } else {
    // Light mode is ON → Show MOON icon (to switch to dark)
    themeIcon.className = 'fas fa-moon';
    themeButton.title = 'Switch to dark mode';
  }
}
