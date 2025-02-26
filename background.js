chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log(tab);
    showTasksNotification(tab.url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log(tab);
    showTasksNotification(tab.url);
  }
});

function showTasksNotification(url) {
  if (!url) {
    return;
  }
  const domain = new URL(url).hostname;
  chrome.storage.local.get([domain], (result) => {
    const tasks = result[domain] || [];
    const message = tasks
      .filter((task) => !task.isDone)
      .map(({ task }) => task)
      .join("\n");
      

    if (message) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: `Tasks for ${domain}`,
        message: message,
      });
    }
  });
}
