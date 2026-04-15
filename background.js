chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['enabled'], (data) => {
    if (data.enabled === undefined) {
      chrome.storage.local.set({
        enabled: true,
        interval: 20, 
        breakDuration: 20,
        showExercises: true,
        showNotification: true,
        customMessage: "Take a break!",
        theme: 'dark'
      });
    }
    createAlarm();
  });
});

function createAlarm() {
  chrome.storage.local.get(['enabled', 'interval'], (data) => {
    chrome.alarms.clear("breakAlarm");
    if (data.enabled) {
      chrome.alarms.create("breakAlarm", { delayInMinutes: data.interval || 20 });
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
    // Do NOT create next alarm here. Wait for message from break window.
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "breakFinished") {
    createAlarm();
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
    } else {
      // If not showing exercises page, restart timer immediately
      createAlarm();
    }
  });
}
