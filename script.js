// Timer variables
let timer;
let isRunning = false;
let isWorkSession = true;
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let timeRemaining = workDuration;

// DOM elements
const timerDisplay = document.querySelector('.timer-display');
const toggleBtn = document.getElementById('toggle-btn');
const skipBtn = document.getElementById('skip-btn');
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
const themeToggle = document.getElementById('theme-toggle');

// Audio elements
const tickSound = document.getElementById('tick-sound');
const clickSound = document.getElementById('click-sound');
const notificationSound = document.getElementById('notification-sound');

// --- Sound Functions ---
function playClickSound() {
    if (clickSound.src && clickSound.src !== window.location.href) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.error("Error playing click sound:", e));
    }
}

function playTickSound() {
    if (tickSound.src && tickSound.src !== window.location.href) {
        tickSound.currentTime = 0;
        tickSound.play().catch(e => console.error("Error playing tick sound:", e));
    }
}

function stopTickSound() {
    tickSound.pause();
}

function playNotificationSound() {
    if (notificationSound.src && notificationSound.src !== window.location.href) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(e => console.error("Error playing notification sound:", e));
    }
}


// --- Timer Functions ---

function startTimer() {
    isRunning = true;
    toggleBtn.textContent = 'Pause';
    timer = setInterval(() => {
        timeRemaining--;
        if (isWorkSession) {
            playTickSound();
        }
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timer);
            isRunning = false;
            handleSessionEnd();
        }
    }, 1000);
}

function pauseTimer() {
    stopTickSound();
    clearInterval(timer);
    isRunning = false;
    toggleBtn.textContent = 'Start';
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Toggle timer (start/pause)
function toggleTimer() {
    playClickSound();
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// Reset timer (used by settings)
function resetTimer() {
    pauseTimer();
    isWorkSession = true;
    timeRemaining = workDuration;
    updateTimerDisplay();
}

// Skip to the next session
function skipSession() {
    playClickSound();
    pauseTimer();
    handleSessionEnd(true); // Pass true to indicate a skip
}


// Handle session end
function handleSessionEnd(skipped = false) {
    stopTickSound();
    playNotificationSound();
    if (isWorkSession) {
        // Work session ends
        if (!skipped) {
            let completedPomodoros = parseInt(completedPomodorosSpan.textContent);
            completedPomodoros++;
            completedPomodorosSpan.textContent = completedPomodoros;
        }
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
    setTimeout(() => {
        if (isRunning) return; // Don't auto-start if user paused during notification
        startTimer();
    }, 3000); // Automatically start the next session after a short delay
}

// --- UI Functions ---

// Show popup notification
function showPopup(title, message) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 2500); // Hide after 2.5 seconds
}

// Add to-do item
function addTodo() {
    playClickSound();
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
        saveTodos();
    }
}

// Handle to-do list clicks (delete or complete)
function handleTodoListClick(e) {
    if (e.target.matches('.delete-btn')) {
        playClickSound();
        e.target.parentElement.remove();
    } else if (e.target.matches('input[type="checkbox"]')) {
        playClickSound();
        e.target.parentElement.classList.toggle('completed');
    }
    updateStats();
    saveTodos();
}

// Update statistics
function updateStats() {
    const remainingTasks = todoList.querySelectorAll('li:not(.completed)').length;
    remainingTasksSpan.textContent = remainingTasks;
}

// Toggle theme
function toggleTheme() {
    playClickSound();
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
    saveSettings();
}

// --- Persistence Functions ---

function saveSettings() {
    localStorage.setItem('pomodoroSettings', JSON.stringify({
        work: workDurationInput.value,
        break: breakDurationInput.value,
        theme: document.body.className
    }));
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('pomodoroSettings'));
    if (settings) {
        workDurationInput.value = settings.work;
        breakDurationInput.value = settings.break;
        document.body.className = settings.theme || 'light-theme';
        themeToggle.checked = document.body.classList.contains('dark-theme');

        workDuration = workDurationInput.value * 60;
        breakDuration = breakDurationInput.value * 60;
    }
}

function saveTodos() {
    const todos = [];
    todoList.querySelectorAll('li').forEach(li => {
        todos.push({
            text: li.querySelector('span').textContent,
            completed: li.classList.contains('completed')
        });
    });
    localStorage.setItem('pomodoroTodos', JSON.stringify(todos));
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('pomodoroTodos'));
    if (todos) {
        todos.forEach(todo => {
            const li = document.createElement('li');
            if (todo.completed) {
                li.classList.add('completed');
            }
            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                <span>${todo.text}</span>
                <button class="delete-btn">Delete</button>
            `;
            todoList.appendChild(li);
        });
    }
}

// --- Event Listeners ---
toggleBtn.addEventListener('click', toggleTimer);
skipBtn.addEventListener('click', skipSession);
addTodoBtn.addEventListener('click', addTodo);
todoList.addEventListener('click', handleTodoListClick);
themeToggle.addEventListener('change', toggleTheme);

workDurationInput.addEventListener('change', () => {
    workDuration = workDurationInput.value * 60;
    if (isWorkSession) {
        resetTimer();
    }
    saveSettings();
});

breakDurationInput.addEventListener('change', () => {
    breakDuration = breakDurationInput.value * 60;
    if (!isWorkSession) {
        resetTimer();
    }
    saveSettings();
});

// --- Initial Setup ---
loadSettings();
loadTodos();
resetTimer();
updateStats();
