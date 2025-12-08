/* ==========================================================================
   UTILITIES & HELPERS
   ==========================================================================
   PURPOSE: Contains shared functions used throughout the app.
   - Sound Effects
   - Toast Notifications (Popups)
   - Date & Cycle Day Calculations
   - Pomodoro Timer Logic
   ========================================================================== */

/* =========================================
   1. SOUND & FEEDBACK
   ========================================= */

const sounds = {
    complete: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    click:    new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    success:  new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
};

function playSound(type) {
    // 1. Check if sound is disabled
    if (settings && settings.soundMode === 'silent') return;

    // 2. Check for Haptic Mode (Vibration on Mobile)
    if (settings && settings.soundMode === 'haptic') {
        if (navigator.vibrate) navigator.vibrate(50);
        return;
    }

    // 3. Play Sound
    if (sounds[type]) {
        sounds[type].currentTime = 0; // Reset to start
        sounds[type].volume = 0.4;

        // .catch() prevents errors if the user hasn't interacted with the page yet
        sounds[type].play().catch(() => {});
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Choose Icon based on type
    let icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* =========================================
   2. SCHOOL CYCLE DAY LOGIC
   ========================================= */

/**
 * Calculates the current School Cycle Day (1-7).
 * It skips weekends (Saturday/Sunday) to ensure the count is accurate.
 * Relies on global CYCLE_START_DATE.
 */
function getCycleDay(targetDate) {
    if (typeof CYCLE_START_DATE === 'undefined') return null;

    const d = new Date(targetDate);
    const dayOfWeek = d.getDay();

    // Return null if it's a weekend (0=Sun, 6=Sat)
    if (dayOfWeek === 0 || dayOfWeek === 6) return null; 

    // Normalize dates to midnight to ignore time differences
    const start = new Date(CYCLE_START_DATE);
    start.setHours(0,0,0,0);
    d.setHours(0,0,0,0);

    // Safety check: Don't calculate dates before the school year started
    if (d < start) return null;

    let workDays = 0;
    let loopDate = new Date(start);

    // Count every weekday between Start Date and Target Date
    while (loopDate <= d) {
        const wDay = loopDate.getDay();
        if (wDay !== 0 && wDay !== 6) workDays++;
        loopDate.setDate(loopDate.getDate() + 1);
    }

    // Modulo 7 gives us the remainder (Cycle Day)
    // We do (workDays - 1) % 7 + 1 to get a 1-7 result instead of 0-6
    return ((workDays - 1) % 7) + 1;
}

/* =========================================
   3. DATE FORMATTING HELPERS
   ========================================= */

/**
 * Returns the Date object for the beginning of the current week.
 * Respects the user's "Start on Monday" setting.
 */
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

/**
 * Formats a date string (e.g., "12/25" or "25/12")
 * Respects the user's International Date Format setting.
 */
function formatShortDate(dateObj) {
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();

    if (settings && settings.dateFormat === 'INTL') {
        return `${d}/${m}`;
    }
    return `${m}/${d}`;
}

/* =========================================
   4. POMODORO TIMER LOGIC
   ========================================= */

let timer = { 
    interval: null, 
    timeLeft: 25 * 60, 
    isRunning: false, 
    mode: 'work' // 'work' or 'break'
};

function toggleTimer() {
    playSound('click');
    const icon = document.getElementById('timerIcon');

    if (timer.isRunning) { 
        // STOP TIMER
        clearInterval(timer.interval); 
        timer.isRunning = false; 
        if (icon) icon.className = "fa-solid fa-play"; 
    } else { 
        // START TIMER
        timer.isRunning = true; 
        if (icon) icon.className = "fa-solid fa-pause"; 

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

    // Switch modes automatically
    if (timer.mode === 'work') {
        showToast("Focus complete! Break time?", "success");
        switchTimerMode('break');
    } else {
        showToast("Break over! Focus time.", "info");
        switchTimerMode('work');
    }

    const icon = document.getElementById('timerIcon');
    if (icon) icon.className = "fa-solid fa-play";
}

function switchTimerMode(forceMode = null) {
    if (forceMode) {
        timer.mode = forceMode;
    } else {
        timer.mode = timer.mode === 'work' ? 'break' : 'work';
    }
    resetTimer();
}

function resetTimer() { 
    clearInterval(timer.interval); 
    timer.isRunning = false; 

    const icon = document.getElementById('timerIcon');
    if (icon) icon.className = "fa-solid fa-play"; 

    // Get duration from settings (or default to 25/5)
    const workMins = (settings && settings.workTime) ? settings.workTime : 25;
    const breakMins = (settings && settings.breakTime) ? settings.breakTime : 5;

    timer.timeLeft = (timer.mode === 'work' ? workMins : breakMins) * 60; 
    updateTimerUI(); 
}

function updateTimerUI() { 
    // Format mm:ss
    const m = Math.floor(timer.timeLeft / 60).toString().padStart(2,'0'); 
    const s = (timer.timeLeft % 60).toString().padStart(2,'0'); 

    const display = document.getElementById('timerDisplay');
    if (display) {
        display.innerText = `${m}:${s}`;

        // Change color based on mode
        if (timer.mode === 'work') {
            display.className = "text-lg font-mono font-bold text-primary w-14 text-center cursor-pointer select-none";
        } else {
            display.className = "text-lg font-mono font-bold text-green-500 w-14 text-center cursor-pointer select-none";
        }
    }
}