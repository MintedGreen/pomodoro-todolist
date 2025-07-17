// Timer variables
let timer;
let isRunning = false;
let isWorkSession = true;
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let timeRemaining = workDuration;

// DOM elements
const timerDisplay = document.querySelector('.timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const completedPomodorosSpan = document.getElementById('completed-pomodoros');
const remainingTasksSpan = document.getElementById('remaining-tasks');
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupMessage = document.getElementById('popup-message');
const popupCloseBtn = document.getElementById('popup-close-btn');

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Start timer
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                clearInterval(timer);
                isRunning = false;
                handleSessionEnd();
            }
        }, 1000);
    }
}

// Pause timer
function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

// Reset timer
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isWorkSession = true;
    timeRemaining = workDuration;
    updateTimerDisplay();
}

// Handle session end
function handleSessionEnd() {
    if (isWorkSession) {
        // Work session ends
        let completedPomodoros = parseInt(completedPomodorosSpan.textContent);
        completedPomodoros++;
        completedPomodorosSpan.textContent = completedPomodoros;
        showPopup('Work session complete!', 'Time for a break.');
        isWorkSession = false;
        timeRemaining = breakDuration;
    } else {
        // Break session ends
        showPopup('Break over!', 'Time to get back to work.');
        isWorkSession = true;
        timeRemaining = workDuration;
    }
    updateTimerDisplay();
}

// Show popup
function showPopup(title, message) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popup.style.display = 'flex';
}

// Close popup
function closePopup() {
    popup.style.display = 'none';
}

// Add to-do item
function addTodo() {
    const task = todoInput.value.trim();
    if (task) {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox">
            <span>${task}</span>
            <button class="delete-btn">Delete</button>
        `;
        todoList.appendChild(li);
        todoInput.value = '';
        updateStats();
    }
}

// Handle to-do list clicks
function handleTodoListClick(e) {
    if (e.target.matches('.delete-btn')) {
        e.target.parentElement.remove();
        updateStats();
    } else if (e.target.matches('input[type="checkbox"]')) {
        e.target.parentElement.classList.toggle('completed');
        updateStats();
    }
}

// Update stats
function updateStats() {
    const remainingTasks = todoList.querySelectorAll('li:not(.completed)').length;
    remainingTasksSpan.textContent = remainingTasks;
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addTodoBtn.addEventListener('click', addTodo);
todoList.addEventListener('click', handleTodoListClick);
popupCloseBtn.addEventListener('click', closePopup);
workDurationInput.addEventListener('change', () => {
    workDuration = workDurationInput.value * 60;
    if (isWorkSession) {
        resetTimer();
    }
});
breakDurationInput.addEventListener('change', () => {
    breakDuration = breakDurationInput.value * 60;
    if (!isWorkSession) {
        resetTimer();
    }
});

// Initial setup
updateTimerDisplay();
updateStats();
