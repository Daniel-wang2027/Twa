/* =========================================
   UTILITIES & DATA PERSISTENCE
   ========================================= */

// AUDIO SYSTEM
function playSound(type) {
    if(sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].volume = 0.5;
        sounds[type].play().catch(e => console.log("Interact first"));
    }
}

// SAVE DATA
function saveData() {
    // 1. Safety Check: Don't save if no one is logged in yet
    if (!currentUser || !currentUser.email) {
        console.log("Skipping save: No user logged in.");
        return; 
    }

    // 2. Create a unique key for this user (e.g., "operation_twa_v15_data_john@test.com")
    const userKey = STORAGE_KEY + "_" + currentUser.email;

    // 3. Package the data
    const data = {
        tasks: globalTasks,
        settings: settings,
        streak: streak,
        classes: classes,
        preferences: classPreferences
    };

    // 4. Write to browser storage
    localStorage.setItem(userKey, JSON.stringify(data));
    console.log("Data Saved for:", currentUser.email);
}

// LOAD DATA
function loadData() {
    // 1. Safety Check
    if (!currentUser || !currentUser.email) return;

    const userKey = STORAGE_KEY + "_" + currentUser.email;
    const raw = localStorage.getItem(userKey);

    if (raw) {
        const data = JSON.parse(raw);

        // Restore variables if they exist in save file
        if(data.tasks) globalTasks = data.tasks;
        if(data.settings) settings = data.settings;
        if(data.streak) streak = data.streak;
        if(data.classes) classes = data.classes;
        if(data.preferences) classPreferences = data.preferences;

        console.log("Data Loaded for:", currentUser.email);

        // Apply saved theme & timer immediately
        if(settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
        resetTimer();
    } else {
        console.log("No save found for this user. Starting fresh.");
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
                alert("Timer Done"); 
                resetTimer(); 
            } 
        }, 1000); 
    }
}

function resetTimer() { 
    clearInterval(timer.interval); 
    timer.isRunning = false; 
    timer.timeLeft = settings.workTime * 60; 
    document.getElementById('timerIcon').className = "fa-solid fa-play"; 
    updateTimerUI(); 
}

function updateTimerUI() { 
    const m = Math.floor(timer.timeLeft / 60).toString().padStart(2,'0'); 
    const s = (timer.timeLeft % 60).toString().padStart(2,'0'); 
    document.getElementById('timerDisplay').innerText = `${m}:${s}`; 
}

function saveSettings() {
    playSound('click');
    settings.buffer = parseInt(document.getElementById('setting-buffer').value) || 0;
    settings.workTime = parseInt(document.getElementById('setting-work').value) || 25;
    settings.breakTime = parseInt(document.getElementById('setting-break').value) || 5;

    saveData(); // <--- Trigger Save

    resetTimer(); 
    renderMatrix(); 
    alert("Settings Saved");
}