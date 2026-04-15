chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['enabled'], (data) => {
    if (data.enabled === undefined) {
      chrome.storage.local.set({
        enabled: true,
        interval: 20, // minutes
        showExercises: true,
        showNotification: true,
        customMessage: "Take a break!"
      });
    }
    createAlarm();
  });
});

function createAlarm() {
  chrome.storage.local.get(['enabled', 'interval'], (data) => {
    if (data.enabled) {
      // Use delayInMinutes and recreate for simplicity
      // and so we have an exact scheduled time for the popup
      chrome.alarms.create("breakAlarm", { delayInMinutes: data.interval || 20 });
    } else {
      chrome.alarms.clear("breakAlarm");
    }
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.interval || changes.enabled) {
    createAlarm();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "breakAlarm") {
    triggerBreak();
    createAlarm(); // schedule next break immediately
  }
});

function triggerBreak() {
  chrome.storage.local.get(['showExercises', 'showNotification', 'customMessage'], (data) => {
    if (data.showNotification) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png', 
        title: 'EyeRest',
        message: data.customMessage || 'Take a break! Spend a few seconds now, for a healthier future.'
      });
    }
    
    if (data.showExercises) {
      chrome.tabs.create({ url: chrome.runtime.getURL("break.html") });
    }
  });
}
