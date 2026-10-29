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

  // Reset floating "No" button if leaving Step 1
  const btnNo = document.getElementById('btn-no');
  if (btnNo && stepNumber !== 1) {
    btnNo.classList.remove('is-evading');
    btnNo.style.left = '';
    btnNo.style.top = '';
  }
}

/**
 * Evasive "No" Button Logic (Works on Desktop Mouse & Mobile Touch)
 */
function evadeNoButton(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const btnNo = document.getElementById('btn-no');
  const btnYes = document.getElementById('btn-yes');
  if (!btnNo) return;

  appState.noButtonAttempts += 1;

  // Show QA edge-case log message
  const defaultMessages = [
    "Nice try, QA! Ez a funkció jelenleg nem támogatott. 🕵️‍♀️",
    "Error 404: A 'Nem' opció nem található a rendszerben!",
    "Status: WontFix — Ez egy ismert feature, nem bug! 😉",
    "Edge case detektálva! Kérlek próbáld a másik gombot!",
    "AssertionError: expected 'Igen' but received 'Nem' attempt."
  ];
  const messages = appState.config?.settings?.noButtonMessages || defaultMessages;
  const msgIndex = (appState.noButtonAttempts - 1) % messages.length;

  const logBox = document.getElementById('qa-log-box');
  const logMessage = document.getElementById('qa-log-message');
  if (logBox && logMessage) {
    logBox.hidden = false;
    logMessage.textContent = `${messages[msgIndex]} (Attempt #${appState.noButtonAttempts})`;
  }

  // Subtly grow the "Yes" button to make it even more inviting
  if (btnYes) {
    const scale = Math.min(1 + appState.noButtonAttempts * 0.04, 1.28);
    btnYes.style.transform = `scale(${scale})`;
  }

  // Calculate safe viewport coordinates so the button never leaves the screen
  const btnRect = btnNo.getBoundingClientRect();
  const btnWidth = btnRect.width || 100;
  const btnHeight = btnRect.height || 48;
  const padding = 20;

  const maxX = Math.max(padding, window.innerWidth - btnWidth - padding);
  const maxY = Math.max(padding, window.innerHeight - btnHeight - padding);

  let newX = padding + Math.random() * (maxX - padding);
  let newY = padding + Math.random() * (maxY - padding);

  // Ensure it jumps a noticeable distance away from current position
  if (Math.hypot(newX - btnRect.left, newY - btnRect.top) < 90) {
    newX = newX < window.innerWidth / 2 ? maxX - 10 : padding + 10;
    newY = newY < window.innerHeight / 2 ? maxY - 10 : padding + 10;
  }

  btnNo.classList.add('is-evading');
  btnNo.style.left = `${Math.round(newX)}px`;
  btnNo.style.top = `${Math.round(newY)}px`;
}

/**
 * Lightweight Confetti Burst Animation
 */
function launchConfetti(count = 45) {
  const colors = ['#e11d48', '#fb7185', '#f472b6', '#10b981', '#f59e0b', '#8b5cf6'];
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;

    const angle = Math.random() * Math.PI * 2;
    const velocity = 90 + Math.random() * 220;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 60;
    const rot = `${Math.round((Math.random() - 0.5) * 720)}deg`;

    piece.style.setProperty('--dx', `${Math.round(dx)}px`);
    piece.style.setProperty('--dy', `${Math.round(dy + 180)}px`);
    piece.style.setProperty('--rot', rot);
    piece.style.animationDuration = `${750 + Math.random() * 650}ms`;

    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1500);
  }
}

function initScreen1Events() {
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');

  if (btnYes) {
    btnYes.addEventListener('click', () => {
      launchConfetti(50);
      goToStep(2);
    });
  }

  if (btnNo) {
    // Desktop mouse hover
    btnNo.addEventListener('mouseenter', evadeNoButton);
    // Mobile touchstart (with passive: false so preventDefault blocks click)
    btnNo.addEventListener('touchstart', evadeNoButton, { passive: false });
    // Fallback if someone uses keyboard Tab + Enter or fast click
    btnNo.addEventListener('click', evadeNoButton);
    btnNo.addEventListener('focus', evadeNoButton);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAppConfig();
  initScreen1Events();
});
