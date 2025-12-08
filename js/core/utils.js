/* =========================================
   UTILITIES & HELPERS
   ========================================= */

const sounds = {
    complete: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
};

function playSound(type) {
    if (settings && settings.soundMode === 'silent') return;
    if (settings && settings.soundMode === 'haptic') {
        if(navigator.vibrate) navigator.vibrate(50);
        return;
    }
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].volume = 0.4;
        sounds[type].play().catch(() => {});
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* --- CYCLE DAY LOGIC --- */
function getCycleDay(targetDate) {
    if (typeof CYCLE_START_DATE === 'undefined') return null;
    const d = new Date(targetDate);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return null; // Weekend

    const start = new Date(CYCLE_START_DATE);
    start.setHours(0,0,0,0);
    d.setHours(0,0,0,0);

    if (d < start) return null;

    let workDays = 0;
    let loopDate = new Date(start);

    while (loopDate <= d) {
        const wDay = loopDate.getDay();
        if (wDay !== 0 && wDay !== 6) workDays++;
        loopDate.setDate(loopDate.getDate() + 1);
    }

    return ((workDays - 1) % 7) + 1;
}

/* --- DATE FORMATTING HELPERS (FIXES THE CRASH) --- */

// 1. Calculate Start of Week based on Settings
function getStartOfWeek(dateObj) {
    const d = new Date(dateObj);
    const day = d.getDay(); // 0=Sun, 1=Mon...

    if (settings && settings.startMonday) {
        // If Monday Start:
        // Sunday (0) -> Go back 6 days
        // Mon (1) -> Go back 0 days
        const shift = day === 0 ? 6 : day - 1;
        d.setDate(d.getDate() - shift);
    } else {
        // If Sunday Start (Default):
        // Sunday (0) -> Go back 0 days
        d.setDate(d.getDate() - day);
    }
    return d;
}

// 2. Format Date (MM/DD or DD/MM)
function formatShortDate(dateObj) {
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();

    if (settings && settings.dateFormat === 'INTL') {
        return `${d}/${m}`;
    }
    return `${m}/${d}`;
}

/* --- TIMER LOGIC --- */
let timer = { interval: null, timeLeft: 25*60, isRunning: false, mode: 'work' };

function toggleTimer() {
    playSound('click');
    const icon = document.getElementById('timerIcon');
    if (timer.isRunning) { 
        clearInterval(timer.interval); 
        timer.isRunning = false; 
        if(icon) icon.className = "fa-solid fa-play"; 
    } else { 
        timer.isRunning = true; 
        if(icon) icon.className = "fa-solid fa-pause"; 
        timer.interval = setInterval(() => { 
            if (timer.timeLeft > 0) { 
                timer.timeLeft--; 
                updateTimerUI(); 
            } else { 
                timerComplete(); 
            } 
        }, 1000); 
    }
}

function timerComplete() {
    clearInterval(timer.interval);
    timer.isRunning = false;
    playSound('success');
    if (timer.mode === 'work') {
        showToast("Focus complete! Break time?", "success");
        switchTimerMode('break');
    } else {
        showToast("Break over! Focus time.", "info");
        switchTimerMode('work');
    }
    const icon = document.getElementById('timerIcon');
    if(icon) icon.className = "fa-solid fa-play";
}

function switchTimerMode(forceMode = null) {
    if (forceMode) timer.mode = forceMode;
    else timer.mode = timer.mode === 'work' ? 'break' : 'work';
    resetTimer();
}

function resetTimer() { 
    clearInterval(timer.interval); 
    timer.isRunning = false; 
    const icon = document.getElementById('timerIcon');
    if(icon) icon.className = "fa-solid fa-play"; 
    const workMins = (typeof settings !== 'undefined' && settings.workTime) ? settings.workTime : 25;
    const breakMins = (typeof settings !== 'undefined' && settings.breakTime) ? settings.breakTime : 5;
    timer.timeLeft = (timer.mode === 'work' ? workMins : breakMins) * 60; 
    updateTimerUI(); 
}

function updateTimerUI() { 
    const m = Math.floor(timer.timeLeft / 60).toString().padStart(2,'0'); 
    const s = (timer.timeLeft % 60).toString().padStart(2,'0'); 
    const display = document.getElementById('timerDisplay');
    if (display) {
        display.innerText = `${m}:${s}`;
        display.className = timer.mode === 'work' ? "text-lg font-mono font-bold text-primary w-14 text-center cursor-pointer select-none" : "text-lg font-mono font-bold text-green-500 w-14 text-center cursor-pointer select-none";
    }
}