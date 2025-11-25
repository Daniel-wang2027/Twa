/* =========================================
   UTILITIES & DATA PERSISTENCE
   ========================================= */

// AUDIO SYSTEM
function playSound(type) {
    if(typeof sounds !== 'undefined' && sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].volume = 0.4;
        // Catch error if user hasn't interacted with page yet
        sounds[type].play().catch(() => {});
    }
}

// TOAST NOTIFICATIONS
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if(!container) return;

    // Create Element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icons based on type
    let icon = 'fa-circle-info';
    if(type === 'success') icon = 'fa-circle-check';
    if(type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon} text-${type === 'info' ? 'primary' : type}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    if(type === 'success') playSound('success');
    if(type === 'error') playSound('click'); 

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// SAVE DATA
function saveData() {
    // Don't save if no user logged in
    if (!currentUser || !currentUser.email) return; 

    const userKey = STORAGE_KEY + "_" + currentUser.email;
    const data = {
        tasks: globalTasks,
        settings: settings,
        streak: streak,
        classes: classes,
        preferences: classPreferences
    };
    localStorage.setItem(userKey, JSON.stringify(data));
    console.log("Saved.");
}

// LOAD DATA
function loadData() {
    if (!currentUser || !currentUser.email) return;
    const userKey = STORAGE_KEY + "_" + currentUser.email;
    const raw = localStorage.getItem(userKey);

    if (raw) {
        const data = JSON.parse(raw);
        if(data.tasks) globalTasks = data.tasks;
        if(data.settings) settings = data.settings;
        if(data.streak) streak = data.streak;
        if(data.classes) classes = data.classes;
        if(data.preferences) classPreferences = data.preferences;

        // Apply Theme
        if(settings.theme) document.documentElement.setAttribute('data-theme', settings.theme);

        // Apply Dyslexia Font (Moved here correctly)
        if (settings.dyslexia) {
            document.body.classList.add('dyslexia-mode');
        } else {
            document.body.classList.remove('dyslexia-mode');
        }

        resetTimer();
    }
}

// TIMER LOGIC
let timer = { interval: null, timeLeft: 25*60, isRunning: false };

function toggleTimer() {
    playSound('click');
    if(timer.isRunning) { 
        clearInterval(timer.interval); 
        timer.isRunning = false; 
        document.getElementById('timerIcon').className = "fa-solid fa-play"; 
    } else { 
        timer.isRunning = true; 
        document.getElementById('timerIcon').className = "fa-solid fa-pause"; 
        timer.interval = setInterval(() => { 
            if(timer.timeLeft > 0) { 
                timer.timeLeft--; 
                updateTimerUI(); 
            } else { 
                playSound('success');
                if(typeof showToast === 'function') showToast("Focus Session Complete!", "success");
                resetTimer(); 
            } 
        }, 1000); 
    }
}

function resetTimer() { 
    clearInterval(timer.interval); 
    timer.isRunning = false; 
    // Use default if settings aren't loaded yet
    const workMinutes = settings.workTime || 25;
    timer.timeLeft = workMinutes * 60; 

    const icon = document.getElementById('timerIcon');
    if(icon) icon.className = "fa-solid fa-play"; 
    updateTimerUI(); 
}

function updateTimerUI() { 
    const m = Math.floor(timer.timeLeft / 60).toString().padStart(2,'0'); 
    const s = (timer.timeLeft % 60).toString().padStart(2,'0'); 
    const display = document.getElementById('timerDisplay');
    if(display) display.innerText = `${m}:${s}`; 
}

// SAVE SETTINGS (Fixed & Cleaned)
function saveSettings() {
    playSound('click');

    // 1. Save Numbers
    settings.buffer = parseInt(document.getElementById('setting-buffer').value) || 0;
    settings.workTime = parseInt(document.getElementById('setting-work').value) || 25;
    settings.breakTime = parseInt(document.getElementById('setting-break').value) || 5;

    // 2. Save Dyslexia Toggle
    const dysBox = document.getElementById('setting-dyslexia');
    if(dysBox) {
        settings.dyslexia = dysBox.checked;

        // Apply immediately
        if(settings.dyslexia) document.body.classList.add('dyslexia-mode');
        else document.body.classList.remove('dyslexia-mode');
    }

    // 3. Persist
    saveData();
    resetTimer(); 

    // 4. Refresh UI
    if(typeof renderMatrix === 'function') renderMatrix(); 
    if(typeof renderBackpackSettings === 'function') renderBackpackSettings();

    if(typeof showToast === 'function') {
        showToast("Settings Saved", "success");
    } else {
        alert("Settings Saved");
    }
}