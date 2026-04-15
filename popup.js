document.addEventListener('DOMContentLoaded', () => {
  const enabledToggle = document.getElementById('enabledToggle');
  const intervalValue = document.getElementById('intervalValue');
  const intervalSlider = document.getElementById('intervalSlider');
  const durationValue = document.getElementById('durationValue');
  const durationSlider = document.getElementById('durationSlider');
  const exercisesToggle = document.getElementById('exercisesToggle');
  const notificationToggle = document.getElementById('notificationToggle');
  const customMessage = document.getElementById('customMessage');
  const timerDisplay = document.getElementById('timerDisplay');
  const resetBtn = document.getElementById('resetBtn');

  // Load saved settings
  chrome.storage.local.get(
    ['enabled', 'interval', 'breakDuration', 'showExercises', 'showNotification', 'customMessage'],
    (data) => {
      enabledToggle.checked = data.enabled !== false;
      intervalSlider.value = data.interval || 20;
      intervalValue.textContent = data.interval || 20;
      
      durationSlider.value = data.breakDuration || 20;
      durationValue.textContent = data.breakDuration || 20;

      exercisesToggle.checked = data.showExercises !== false;
      notificationToggle.checked = data.showNotification !== false;
      customMessage.value = data.customMessage || "Take a break!";
      
      updateDisplay();
    }
  );

  function saveSettings() {
    chrome.storage.local.set({
      enabled: enabledToggle.checked,
      interval: parseInt(intervalSlider.value),
      breakDuration: parseInt(durationSlider.value),
      showExercises: exercisesToggle.checked,
      showNotification: notificationToggle.checked,
      customMessage: customMessage.value
    });
  }

  enabledToggle.addEventListener('change', () => {
    saveSettings();
    updateDisplay();
  });

  intervalSlider.addEventListener('input', (e) => {
    intervalValue.textContent = e.target.value;
  });
  
  durationSlider.addEventListener('input', (e) => {
    durationValue.textContent = e.target.value;
  });

  intervalSlider.addEventListener('change', saveSettings);
  durationSlider.addEventListener('change', saveSettings);
  exercisesToggle.addEventListener('change', saveSettings);
  notificationToggle.addEventListener('change', saveSettings);
  customMessage.addEventListener('change', saveSettings);

  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    intervalSlider.value = 20;
    intervalValue.textContent = 20;
    durationSlider.value = 20;
    durationValue.textContent = 20;
    exercisesToggle.checked = true;
    notificationToggle.checked = true;
    customMessage.value = "Take a break!";
    enabledToggle.checked = true;
    saveSettings();
    updateDisplay();
  });

  function updateDisplay() {
    if (enabledToggle.checked) {
      document.body.classList.remove('disabled');
    } else {
      document.body.classList.add('disabled');
      timerDisplay.textContent = "Disabled";
    }
  }

  // Timer logic
  setInterval(() => {
    if (!enabledToggle.checked) return;
    
    chrome.alarms.get("breakAlarm", (alarm) => {
      if (alarm && alarm.scheduledTime) {
        const timeLeftMs = alarm.scheduledTime - Date.now();
        if (timeLeftMs > 0) {
          const totalSeconds = Math.floor(timeLeftMs / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          if (minutes > 0) {
             timerDisplay.textContent = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
          } else {
             timerDisplay.textContent = `${seconds} sec`;
          }
        } else {
          timerDisplay.textContent = "0 sec";
        }
      } else {
        timerDisplay.textContent = "--";
      }
    });
  }, 1000);
});
