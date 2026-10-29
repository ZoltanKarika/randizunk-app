/**
 * Randizunk App - Core Application State & Data Loader
 */

const appState = {
  currentStep: 1,
  config: null,
  selectedEvents: [],
  selectedTimes: [],
  customDateTime: '',
  customNote: '',
  noButtonAttempts: 0,
  webhookSent: false
};

const FALLBACK_CONFIG = {
  settings: {
    testSuiteName: "First_Date_v1.0",
    webhookUrl: "",
    noButtonMessages: [
      "Nice try, QA! Ez a funkció jelenleg nem támogatott. 🕵️‍♀️",
      "Error 404: A 'Nem' opció nem található a rendszerben!",
      "Status: WontFix — Ez egy ismert feature, nem bug! 😉",
      "Edge case detektálva! Kérlek próbáld a zöld gombot!",
      "AssertionError: expected 'Igen' but received 'Nem' attempt."
    ],
    timeOptions: [
      "Péntek 18:00",
      "Péntek 19:30",
      "Szombat 16:00",
      "Szombat 18:30",
      "Vasárnap 15:30",
      "Vasárnap 17:00"
    ]
  },
  events: [
    {
      id: "nagyerdei-seta",
      title: "Nagyerdei séta",
      icon: "🌳",
      description: "Kellemes séta a Nagyerdőn a fák között, a Békás-tó és a stadion környékén, jó beszélgetéssel.",
      tag: "Természet & Romantikus"
    },
    {
      id: "sor-bor",
      title: "Sör / Bor",
      icon: "🍷",
      description: "Beülünk egy hangulatos debreceni helyre egy jó pohár borra vagy kézműves sörre.",
      tag: "Laza & Beszélgetős"
    },
    {
      id: "mozi",
      title: "Mozi",
      icon: "🍿",
      description: "Megnézünk egy jó filmet (Cinema City / Apolló), utána pedig kibeszéljük a látottakat.",
      tag: "Kultúra & Kikapcsolódás"
    },
    {
      id: "dg-italiano",
      title: "DG Italiano Pizzázás",
      icon: "🍕",
      description: "Egy igazi olasz pizzázás a DG Italiano-ban – garantáltan jó hangulat és szuper ízek.",
      tag: "Gasztronómia"
    },
    {
      id: "anna-cukraszda-toci",
      title: "Kávé – Anna Cukrászda (Tóci) + séta",
      icon: "☕",
      description: "Finom kávé és süti az Anna Cukrászdában a Tóciban, utána pedig egy kellemes séta.",
      tag: "Édes & Nyugodt"
    },
    {
      id: "annuska-fagyi",
      title: "Fagyi – Annuska (Nagyerdő)",
      icon: "🍦",
      description: "Egy jó fagyizás a nagyerdei Annuskában, mert fagyizni bármilyen időben ér! #notoocoldforicecream",
      tag: "#notoocoldforicecream"
    }
  ]
};

async function loadAppConfig() {
  try {
    const response = await fetch('data/events.json');
    if (!response.ok) {
      throw new Error(`HTTP hiba: ${response.status}`);
    }
    appState.config = await response.json();
  } catch (error) {
    console.warn('Fallback konfiguráció használata:', error);
    appState.config = FALLBACK_CONFIG;
  }

  if (appState.config?.settings?.testSuiteName) {
    const suiteLabel = document.getElementById('qa-suite-label');
    if (suiteLabel) {
      suiteLabel.textContent = `Test Suite: ${appState.config.settings.testSuiteName}`;
    }
  }

  renderScreen2Options();
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

  const statusDot = document.getElementById('qa-status-dot');
  if (statusDot) {
    statusDot.classList.toggle('passed', stepNumber === 3);
  }

  // Reset floating "No" button if leaving Step 1
  const btnNo = document.getElementById('btn-no');
  if (btnNo && stepNumber !== 1) {
    btnNo.classList.remove('is-evading');
    btnNo.style.left = '';
    btnNo.style.top = '';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const messages =
    appState.config?.settings?.noButtonMessages || FALLBACK_CONFIG.settings.noButtonMessages;
  const msgIndex = (appState.noButtonAttempts - 1) % messages.length;

  const logBox = document.getElementById('qa-log-box');
  const logMessage = document.getElementById('qa-log-message');
  if (logBox && logMessage) {
    logBox.hidden = false;
    logMessage.textContent = `${messages[msgIndex]} (Attempt #${appState.noButtonAttempts})`;
  }

  if (btnYes) {
    const scale = Math.min(1 + appState.noButtonAttempts * 0.04, 1.28);
    btnYes.style.transform = `scale(${scale})`;
  }

  const btnRect = btnNo.getBoundingClientRect();
  const btnWidth = btnRect.width || 100;
  const btnHeight = btnRect.height || 48;
  const padding = 20;

  const maxX = Math.max(padding, window.innerWidth - btnWidth - padding);
  const maxY = Math.max(padding, window.innerHeight - btnHeight - padding);

  let newX = padding + Math.random() * (maxX - padding);
  let newY = padding + Math.random() * (maxY - padding);

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

/**
 * Screen 2: Render Event Cards & Time Preference Chips from JSON
 */
function renderScreen2Options() {
  const eventsGrid = document.getElementById('events-grid');
  const timeChipsContainer = document.getElementById('time-chips');
  const events = appState.config?.events || FALLBACK_CONFIG.events;
  const timeOptions =
    appState.config?.settings?.timeOptions || FALLBACK_CONFIG.settings.timeOptions;

  if (eventsGrid) {
    eventsGrid.innerHTML = '';
    events.forEach((evt) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'event-card';
      card.dataset.eventId = evt.id;
      card.setAttribute('aria-pressed', 'false');

      card.innerHTML = `
        <span class="event-icon" aria-hidden="true">${evt.icon}</span>
        <div class="event-info">
          <div class="event-header-row">
            <span class="event-title">${evt.title}</span>
            <span class="event-tag">${evt.tag || ''}</span>
          </div>
          <p class="event-desc">${evt.description}</p>
        </div>
      `;

      card.addEventListener('click', () => toggleEventSelection(evt.id, card));
      eventsGrid.appendChild(card);
    });
  }

  if (timeChipsContainer) {
    timeChipsContainer.innerHTML = '';
    timeOptions.forEach((timeLabel) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'time-chip';
      chip.textContent = timeLabel;
      chip.setAttribute('aria-pressed', 'false');

      chip.addEventListener('click', () => toggleTimeSelection(timeLabel, chip));
      timeChipsContainer.appendChild(chip);
    });
  }
}

function toggleEventSelection(eventId, cardElement) {
  const idx = appState.selectedEvents.indexOf(eventId);
  if (idx === -1) {
    appState.selectedEvents.push(eventId);
    cardElement.classList.add('selected');
    cardElement.setAttribute('aria-pressed', 'true');
  } else {
    appState.selectedEvents.splice(idx, 1);
    cardElement.classList.remove('selected');
    cardElement.setAttribute('aria-pressed', 'false');
  }

  const validationMsg = document.getElementById('event-validation-msg');
  if (validationMsg && appState.selectedEvents.length > 0) {
    validationMsg.hidden = true;
  }
}

function toggleTimeSelection(timeLabel, chipElement) {
  const idx = appState.selectedTimes.indexOf(timeLabel);
  if (idx === -1) {
    appState.selectedTimes.push(timeLabel);
    chipElement.classList.add('selected');
    chipElement.setAttribute('aria-pressed', 'true');
  } else {
    appState.selectedTimes.splice(idx, 1);
    chipElement.classList.remove('selected');
    chipElement.setAttribute('aria-pressed', 'false');
  }
}

/**
 * Screen 3: Build Formatted QA Report, Copy to Clipboard & Trigger Webhook
 */
function formatCustomDateTime(dateTimeStr) {
  if (!dateTimeStr) return '';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const daysHu = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    const dayName = daysHu[d.getDay()];
    return `${year}.${month}.${day}. (${dayName}) ${hours}:${minutes}`;
  } catch {
    return dateTimeStr;
  }
}

function buildQAReportText() {
  const events = appState.config?.events || FALLBACK_CONFIG.events;
  const chosenEvents = events
    .filter((e) => appState.selectedEvents.includes(e.id))
    .map((e) => `${e.icon} ${e.title}`);

  const timeParts = [];
  if (appState.customDateTime) {
    timeParts.push(formatCustomDateTime(appState.customDateTime));
  }
  if (appState.selectedTimes.length > 0) {
    timeParts.push(...appState.selectedTimes);
  }

  const chosenTimes = timeParts.length > 0 ? timeParts.join(' VAGY ') : 'Rugalmas / megbeszéljük';
  const note = appState.customNote.trim() || 'Nincs extra megjegyzés';

  return [
    '🧪 QA TEST REPORT: FIRST_DATE_v1.0',
    '===================================',
    '✅ Státusz: PASSED (Igen!)',
    `🛡️ "Nem" gomb kísérletek: ${appState.noButtonAttempts} db`,
    `🎯 Választott program(ok):`,
    ...chosenEvents.map((item) => `   • ${item}`),
    `🕒 Időpont preferencia (nap/óra): ${chosenTimes}`,
    `💬 Megjegyzés / Feature Request: ${note}`,
    '==================================='
  ].join('\n');
}

async function sendBackgroundNotification(reportText) {
  const webhookUrl = appState.config?.settings?.webhookUrl?.trim();
  if (!webhookUrl || appState.webhookSent) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: JSON.stringify({ text: reportText })
    });
    appState.webhookSent = true;
  } catch (err) {
    console.warn('Háttér-értesítés nem sikerült:', err);
  }
}

async function copyReportToClipboard() {
  const reportText = buildQAReportText();
  const feedback = document.getElementById('copy-feedback');
  const copyBtnLabel = document.getElementById('copy-btn-label');

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(reportText);
    } else {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = reportText;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      tempTextArea.remove();
    }

    if (feedback) {
      feedback.hidden = false;
    }
    if (copyBtnLabel) {
      copyBtnLabel.textContent = '✅ Kimásolva! Illeszd be nekem chatbe!';
    }
  } catch (err) {
    console.error('Másolási hiba:', err);
  }
}

function initAppEvents() {
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const btnToSummary = document.getElementById('btn-to-summary');
  const btnCopyReport = document.getElementById('btn-copy-report');
  const btnBackEdit = document.getElementById('btn-back-edit');
  const customNoteInput = document.getElementById('custom-note');
  const customDateTimeInput = document.getElementById('custom-datetime');

  if (btnYes) {
    btnYes.addEventListener('click', () => {
      launchConfetti(50);
      goToStep(2);
    });
  }

  if (btnNo) {
    btnNo.addEventListener('mouseenter', evadeNoButton);
    btnNo.addEventListener('touchstart', evadeNoButton, { passive: false });
    btnNo.addEventListener('click', evadeNoButton);
    btnNo.addEventListener('focus', evadeNoButton);
  }

  if (btnToSummary) {
    btnToSummary.addEventListener('click', () => {
      if (appState.selectedEvents.length === 0) {
        const validationMsg = document.getElementById('event-validation-msg');
        if (validationMsg) {
          validationMsg.hidden = false;
        }
        return;
      }

      if (customDateTimeInput) {
        appState.customDateTime = customDateTimeInput.value;
      }

      if (customNoteInput) {
        appState.customNote = customNoteInput.value;
      }

      const reportText = buildQAReportText();
      const reportPreview = document.getElementById('report-preview');
      if (reportPreview) {
        reportPreview.textContent = reportText;
      }

      launchConfetti(60);
      goToStep(3);
      sendBackgroundNotification(reportText);
    });
  }

  if (btnCopyReport) {
    btnCopyReport.addEventListener('click', copyReportToClipboard);
  }

  if (btnBackEdit) {
    btnBackEdit.addEventListener('click', () => {
      const feedback = document.getElementById('copy-feedback');
      const copyBtnLabel = document.getElementById('copy-btn-label');
      if (feedback) feedback.hidden = true;
      if (copyBtnLabel) copyBtnLabel.textContent = '📋 Válasz másolása a vágólapra';
      goToStep(2);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAppConfig();
  initAppEvents();
});
