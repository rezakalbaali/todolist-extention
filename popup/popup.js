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
    tasks.forEach(({ task, isDone }) => addTaskToDOM(task, isDone));
  });

  const save = () => {
    const task = taskInput.value.trim();
    if (task) {
      chrome.storage.local.get([domain], (result) => {
        const tasks = result[domain] || [];
        tasks.push({ task, isDone: false });
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
    if (e.target.classList.contains("remove-button")) {
      const task =
        e.target.parentElement.parentElement.querySelector(".text").textContent;
      chrome.storage.local.get([domain], (result) => {
        let tasks = result[domain] || [];
        tasks = tasks.filter(({ task: t }) => t !== task);
        chrome.storage.local.set({ [domain]: tasks }, () => {
          e.target.parentElement.parentElement.remove();
        });
      });
    } else if (e.target.classList.contains("done-button")) {
      const task =
        e.target.parentElement.parentElement.querySelector(".text").textContent;
      chrome.storage.local.get([domain], (result) => {
        let tasks = result[domain] || [];
        tasks.forEach((item) => {
          if (item.task === task) {
            item.isDone = !item.isDone;
          }
        });

        chrome.storage.local.set({ [domain]: tasks }, () => {
          const taskTextElement =
            e.target.parentElement.parentElement.querySelector(".text");
          taskTextElement.classList.toggle("done");
        });
      });
    }
  });

  // Add task to the DOM
  /**
   *
   * @param {string} task
   * @param {boolean} isDone
   */
  function addTaskToDOM(task, isDone) {
    const taskText = document.createElement("span");
    taskText.textContent = task;
    taskText.classList.add("text");
    if (isDone) {
      taskText.classList.add("done");
    }

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("remove-button", "button");

    const doneButton = document.createElement("button");
    doneButton.textContent = "toggle";
    doneButton.classList.add("done-button", "button");

    const actions = document.createElement("div");
    actions.append(doneButton, removeButton);
    actions.classList = "actions";

    const li = document.createElement("li");
    li.classList = "task";
    li.append(taskText, actions);

    taskList.appendChild(li);
  }

  window.addEventListener("scroll", function () {
    if (window.scrollY > 20) {
      title.classList.add("border");
    } else {
      title.classList.remove("border");
    }
  });

  taskInput.focus();
});
