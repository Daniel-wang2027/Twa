/* =========================================
   STUDENT: SETTINGS & CONFIG
   ========================================= */

function saveTimerSettings() {
    const workEl = document.getElementById('setting-work');
    const breakEl = document.getElementById('setting-break');

    if(workEl) settings.workTime = parseInt(workEl.value) || 25;
    if(breakEl) settings.breakTime = parseInt(breakEl.value) || 5;

    saveData(); 
    if(typeof resetTimer === 'function') resetTimer();

    playSound('success');
    if(typeof showToast === 'function') showToast("Timer Updated", "success");
}

function saveBufferSettings() {
    const bufferEl = document.getElementById('setting-buffer');
    if(bufferEl) settings.buffer = parseInt(bufferEl.value) || 0;

    saveData();
    if(typeof renderMatrix === 'function') renderMatrix();

    playSound('click');
    if(typeof showToast === 'function') showToast("Matrix Buffer Updated", "success");
}

function saveGeneralSettings() {
    const dysEl = document.getElementById('setting-dyslexia');
    const time24El = document.getElementById('setting-time24');

    if(dysEl) {
        settings.dyslexia = dysEl.checked;
        document.body.classList.toggle('dyslexia-mode', settings.dyslexia);
    }

    if(time24El) {
        settings.timeFormat24 = time24El.checked;
    }

    saveData();
    if(typeof renderCalendar === 'function') renderCalendar();
}

function openCurrentClassSettings() {
    // viewClassTarget is defined in nav.js but accessible here due to loading order
    if(typeof viewClassTarget !== 'undefined' && viewClassTarget) {
        openStudentClassSettings(viewClassTarget);
    }
}

function openStudentClassSettings(className) {
    const modal = document.getElementById('classSettingsModal');
    if(!modal) return;
    document.getElementById('modal-class-name').innerText = className;
    const picker = document.getElementById('class-color-picker');
    if(picker) picker.value = classPreferences[className] || '#000000';
    modal.dataset.targetClass = className;
    modal.classList.remove('hidden');
}

function saveClassSettings() {
    const modal = document.getElementById('classSettingsModal');
    const className = modal.dataset.targetClass;
    const picker = document.getElementById('class-color-picker');

    if (className && picker) {
        classPreferences[className] = picker.value;
        saveData();
        modal.classList.add('hidden');

        // Refresh visuals
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderProfile === 'function') renderProfile();
        if(typeof renderCalendar === 'function') renderCalendar();

        // Update dot if in detail view
        const dot = document.getElementById('detail-class-dot');
        if(dot) {
            dot.style.backgroundColor = picker.value;
            dot.style.boxShadow = `0 0 10px ${picker.value}`;
        }

        playSound('success');
    }
}

function savePasswordChange() {
    const oldPass = document.getElementById('setting-old-pass').value;
    const newPass = document.getElementById('setting-new-pass').value.trim();

    if (!oldPass || !newPass) return alert("Please fill in both password fields.");
    if (oldPass !== currentUser.password) return alert("Incorrect current password.");
    if (newPass.length < 4) return alert("New password must be at least 4 characters.");

    const usersRaw = localStorage.getItem("operation_twa_users");
    if (usersRaw) {
        let users = JSON.parse(usersRaw);
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx > -1) {
            users[idx].password = newPass;
            localStorage.setItem("operation_twa_users", JSON.stringify(users));
            currentUser.password = newPass;
            localStorage.setItem("twa_current_user", JSON.stringify(currentUser));

            document.getElementById('setting-old-pass').value = "";
            document.getElementById('setting-new-pass').value = "";
            playSound('success');
            if(typeof showToast === 'function') showToast("Password Updated", "success");
        }
    }
}

/* --- ADVANCED ACCESSIBILITY & LOGIC --- */

function saveAdvancedSettings() {
    // 1. Get Elements
    const cbEl = document.getElementById('setting-cb');
    const dysEl = document.getElementById('setting-dyslexia');
    const motionEl = document.getElementById('setting-motion');
    const plainEl = document.getElementById('setting-plain');

    // CHANGED: Slider instead of Select
    const densityEl = document.getElementById('setting-density');

    const dateEl = document.getElementById('setting-dateformat');
    const time24El = document.getElementById('setting-time24');
    const monEl = document.getElementById('setting-monday');
    const guideEl = document.getElementById('setting-guide');

    // 2. Update Settings Object
    if(cbEl) settings.colorBlindMode = cbEl.value;
    if(dysEl) settings.dyslexia = dysEl.checked;
    if(motionEl) settings.reducedMotion = motionEl.checked;
    if(plainEl) settings.plainLanguage = plainEl.checked;

    // CHANGED: Map Slider 0/1 to 'cozy'/'roomy'
    if(densityEl) settings.density = densityEl.value === "1" ? "roomy" : "cozy";

    if(dateEl) settings.dateFormat = dateEl.value;
    if(time24El) settings.timeFormat24 = time24El.checked;
    if(monEl) settings.startMonday = monEl.checked;
    if(guideEl) settings.readingGuide = guideEl.checked;

    saveData();
    applyVisualSettings();

    // Trigger updates
    if(typeof updateInterfaceText === 'function') updateInterfaceText();
    if(typeof renderMatrix === 'function') renderMatrix();
    if(typeof renderCalendar === 'function') renderCalendar();

    if(typeof showToast === 'function') showToast("Preferences Updated", "success");
}

function setSoundMode(mode) {
    settings.soundMode = mode;
    saveData();

    // Update Buttons Visual
    ['sound', 'haptic', 'silent'].forEach(m => {
        const btn = document.getElementById(`btn-snd-${m}`);
        if(btn) {
            if(m === mode) btn.className = "flex-1 py-2 text-xs font-bold bg-primary text-white shadow-sm";
            else btn.className = "flex-1 py-2 text-xs font-bold hover:bg-surface text-muted";
        }
    });
}

function applyVisualSettings() {
    const body = document.body;

    // Dyslexia
    body.classList.toggle('dyslexia-mode', settings.dyslexia);

    // Motion
    body.classList.toggle('motion-reduce', settings.reducedMotion);

    // Density
    body.classList.remove('density-cozy', 'density-roomy');
    body.classList.add(`density-${settings.density || 'cozy'}`);

    // Color Blindness
    body.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia');
    if(settings.colorBlindMode !== 'none') {
        body.classList.add(`cb-${settings.colorBlindMode}`);
    }

    // Reading Guide
    body.classList.toggle('reading-guide', settings.readingGuide);

    // Plain Language Replacements (Simple DOM Manipulation)
    const plain = settings.plainLanguage;
    const termMap = {
        'Assignment': 'Work',
        'Assignments': 'Work',
        'Assessment': 'Test',
        'Course': 'Class',
        'Matrix': 'Grid'
    };

    // NOTE: A full plain language swap usually requires a render re-run.
    // For now, we rely on the re-renders called in saveAdvancedSettings.
}

/* --- NUCLEAR OPTION --- */
function nukeApp() {
    if(confirm("DANGER: This will delete ALL your data, settings, and local history. This cannot be undone.\n\nAre you sure?")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}