/**
 * Randizunk App - Core Application State & Data Loader
 */

const appState = {
  currentStep: 1,
  config: null,
  selectedEvents: [],
  selectedTimes: [],
  customNote: '',
  noButtonAttempts: 0
};

async function loadAppConfig() {
  try {
    const response = await fetch('data/events.json');
    if (!response.ok) {
      throw new Error(`HTTP hiba: ${response.status}`);
    }
    appState.config = await response.json();
    if (appState.config?.settings?.testSuiteName) {
      const suiteLabel = document.getElementById('qa-suite-label');
      if (suiteLabel) {
        suiteLabel.textContent = `Test Suite: ${appState.config.settings.testSuiteName}`;
      }
    }
  } catch (error) {
    console.error('Nem sikerült betölteni a data/events.json fájlt:', error);
  }
}

function goToStep(stepNumber) {
  appState.currentStep = stepNumber;
  document.querySelectorAll('.screen').forEach((section, index) => {
    const isTarget = index + 1 === stepNumber;
    section.hidden = !isTarget;
    section.classList.toggle('active', isTarget);
  });

  const indicator = document.getElementById('step-indicator');
  if (indicator) {
    indicator.textContent = `Step ${stepNumber} / 3`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAppConfig();
});
