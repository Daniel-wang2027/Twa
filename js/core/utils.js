/* =========================================
   UTILITIES & TIMER (Fixed Break Logic)
   ========================================= */

const sounds = {
    complete: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
};

function playSound(type) {
    if(sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].volume = 0.4;
        sounds[type].play().catch(() => {});
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if(!container) return;
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

/* --- TIMER LOGIC --- */
let timer = { 
    interval: null, 
    timeLeft: 25*60, 
    isRunning: false,
    mode: 'work' // 'work' or 'break'
};

function toggleTimer() {
    playSound('click');
    const icon = document.getElementById('timerIcon');

    if(timer.isRunning) { 
        clearInterval(timer.interval); 
        timer.isRunning = false; 
        if(icon) icon.className = "fa-solid fa-play"; 
    } else { 
        timer.isRunning = true; 
        if(icon) icon.className = "fa-solid fa-pause"; 

        timer.interval = setInterval(() => { 
            if(timer.timeLeft > 0) { 
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

    if(timer.mode === 'work') {
        showToast("Focus complete! Time for a break?", "success");
        // Auto-switch to break, but don't start
        switchTimerMode('break');
    } else {
        showToast("Break over! Back to work.", "info");
        switchTimerMode('work');
    }

    const icon = document.getElementById('timerIcon');
    if(icon) icon.className = "fa-solid fa-play";
}

function switchTimerMode(forceMode = null) {
    // Toggle or force
    if (forceMode) timer.mode = forceMode;
    else timer.mode = timer.mode === 'work' ? 'break' : 'work';

    resetTimer();
}

function resetTimer() { 
    clearInterval(timer.interval); 
    timer.isRunning = false; 
    const icon = document.getElementById('timerIcon');
    if(icon) icon.className = "fa-solid fa-play"; 

    // Get Settings
    const workMins = (typeof settings !== 'undefined' && settings.workTime) ? settings.workTime : 25;
    const breakMins = (typeof settings !== 'undefined' && settings.breakTime) ? settings.breakTime : 5;

    // Set Time
    timer.timeLeft = (timer.mode === 'work' ? workMins : breakMins) * 60;

    updateTimerUI();
}

function updateTimerUI() { 
    const m = Math.floor(timer.timeLeft / 60).toString().padStart(2,'0'); 
    const s = (timer.timeLeft % 60).toString().padStart(2,'0'); 

    const display = document.getElementById('timerDisplay');
    const container = document.getElementById('timer-container'); // Need to add ID to HTML

    if(display) {
        display.innerText = `${m}:${s}`;
        // Color coding
        if(timer.mode === 'work') display.className = "text-lg font-mono font-bold text-primary w-14 text-center cursor-pointer";
        else display.className = "text-lg font-mono font-bold text-green-500 w-14 text-center cursor-pointer";
    }
}