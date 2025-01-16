// Helper to get the domain name
function getDomain(url) {
  const urlObj = new URL(url);
  return urlObj.hostname;
}

document.addEventListener("DOMContentLoaded", async () => {
  const title = document.getElementsByClassName("title")[0];
  const taskInput = document.getElementById("taskInput");
  const addTaskButton = document.getElementById("addTask");
  const taskList = document.getElementById("taskList");
  const domainSpan = document.getElementById("domain");

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const domain = getDomain(tab.url);
  domainSpan.textContent = domain;

  // Load tasks for the domain
  chrome.storage.local.get([domain], (result) => {
    const tasks = result[domain] || [];
    tasks.forEach((task) => addTaskToDOM(task));
  });

  const save = () => {
    const task = taskInput.value.trim();
    if (task) {
      chrome.storage.local.get([domain], (result) => {
        const tasks = result[domain] || [];
        tasks.push(task);
        chrome.storage.local.set({ [domain]: tasks }, () => {
          addTaskToDOM(task);
          taskInput.value = "";
        });
      });
    }
  };

  // Add task to storage and DOM
  addTaskButton.addEventListener("click", save);
  taskInput.addEventListener("keyup", (e) => {

    if (e.key === "Enter") {
      save();
    }
  });

  // Remove task from storage and DOM
  taskList.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const task = e.target.previousSibling.textContent;
      chrome.storage.local.get([domain], (result) => {
        let tasks = result[domain] || [];
        tasks = tasks.filter((t) => t !== task);
        chrome.storage.local.set({ [domain]: tasks }, () => {
          e.target.parentElement.remove();
        });
      });
    }
  });

  // Add task to the DOM
  function addTaskToDOM(task) {
    const li = document.createElement("li");
    li.textContent = task;
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    li.appendChild(removeButton);
    taskList.appendChild(li);
  }

  window.addEventListener("scroll", function() {
    if (window.scrollY > 20) {
      title.classList.add('border') 
    }else{
      title.classList.remove('border') 
    }
});
});
