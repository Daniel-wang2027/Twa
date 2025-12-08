/* ==========================================================================
   STUDENT: SETTINGS & CONFIGURATION
   ==========================================================================
   PURPOSE: 
   1. Handles saving user preferences (Timers, Themes, Accessibility).
   2. Applies visual changes immediately (CSS class toggles).
   3. Manages account settings (Password change).
   ========================================================================== */

/* =========================================
   1. PRODUCTIVITY SETTINGS (Timer & Matrix)
   ========================================= */

function saveTimerSettings() {
    const workEl = document.getElementById('setting-work');
    const breakEl = document.getElementById('setting-break');

    if (workEl) settings.workTime = parseInt(workEl.value) || 25;
    if (breakEl) settings.breakTime = parseInt(breakEl.value) || 5;

    saveData(); 

    // Reset the active timer to reflect new duration immediately
    if (typeof resetTimer === 'function') resetTimer();

    playSound('success');
    if (typeof showToast === 'function') showToast("Timer Updated", "success");
}

function saveBufferSettings() {
    const bufferEl = document.getElementById('setting-buffer');
    if (bufferEl) settings.buffer = parseInt(bufferEl.value) || 0;

    saveData();

    // Re-calculate the Matrix view to show updated deadlines
    if (typeof renderMatrix === 'function') renderMatrix();

    playSound('click');
    if (typeof showToast === 'function') showToast("Matrix Buffer Updated", "success");
}

/* =========================================
   2. CLASS CUSTOMIZATION (Colors)
   ========================================= */

/**
 * Opens the settings modal for the class currently being viewed.
 */
function openCurrentClassSettings() {
    // viewClassTarget is a global variable from nav.js
    if (typeof viewClassTarget !== 'undefined' && viewClassTarget) {
        openStudentClassSettings(viewClassTarget);
    }
}

function openStudentClassSettings(className) {
    const modal = document.getElementById('classSettingsModal');
    if (!modal) return;

    document.getElementById('modal-class-name').innerText = className;

    // Set color picker to current preference (or black if none)
    const picker = document.getElementById('class-color-picker');
    if (picker) picker.value = classPreferences[className] || '#000000';

    modal.dataset.targetClass = className;
    modal.classList.remove('hidden');
}

function saveClassSettings() {
    const modal = document.getElementById('classSettingsModal');
    const className = modal.dataset.targetClass;
    const picker = document.getElementById('class-color-picker');

    if (className && picker) {
        // Save new color
        classPreferences[className] = picker.value;
        saveData();
        modal.classList.add('hidden');

        // Refresh all views that use color
        if (typeof renderMatrix === 'function') renderMatrix();
        if (typeof renderProfile === 'function') renderProfile();
        if (typeof renderCalendar === 'function') renderCalendar();

        // If we are currently inside the class detail view, update the header dot immediately
        const dot = document.getElementById('detail-class-dot');
        if (dot) {
            dot.style.backgroundColor = picker.value;
            dot.style.boxShadow = `0 0 10px ${picker.value}`;
        }

        playSound('success');
    }
}

/* =========================================
   3. ACCOUNT SETTINGS (Password)
   ========================================= */

function savePasswordChange() {
    const oldPass = document.getElementById('setting-old-pass').value;
    const newPass = document.getElementById('setting-new-pass').value.trim();

    // Validation
    if (!oldPass || !newPass) return alert("Please fill in both password fields.");
    if (oldPass !== currentUser.password) return alert("Incorrect current password.");
    if (newPass.length < 4) return alert("New password must be at least 4 characters.");

    // Update in LocalStorage (The "Database")
    const usersRaw = localStorage.getItem("operation_twa_users");
    if (usersRaw) {
        let users = JSON.parse(usersRaw);
        const idx = users.findIndex(u => u.email === currentUser.email);

        if (idx > -1) {
            users[idx].password = newPass;
            localStorage.setItem("operation_twa_users", JSON.stringify(users));

            // Update current session
            currentUser.password = newPass;
            localStorage.setItem("twa_current_user", JSON.stringify(currentUser));

            // Clear Fields
            document.getElementById('setting-old-pass').value = "";
            document.getElementById('setting-new-pass').value = "";

            playSound('success');
            if (typeof showToast === 'function') showToast("Password Updated", "success");
        }
    }
}

/* =========================================
   4. ADVANCED ACCESSIBILITY & LOGIC
   ========================================= */

function saveAdvancedSettings() {
    // 1. Get Elements
    const cbEl = document.getElementById('setting-cb');
    const dysEl = document.getElementById('setting-dyslexia');
    const motionEl = document.getElementById('setting-motion');
    const plainEl = document.getElementById('setting-plain');
    const densityEl = document.getElementById('setting-density'); // Slider (0 or 1)

    const dateEl = document.getElementById('setting-dateformat');
    const time24El = document.getElementById('setting-time24');
    const monEl = document.getElementById('setting-monday');
    const guideEl = document.getElementById('setting-guide');

    // 2. Update Settings Object
    if (cbEl) settings.colorBlindMode = cbEl.value;
    if (dysEl) settings.dyslexia = dysEl.checked;
    if (motionEl) settings.reducedMotion = motionEl.checked;
    if (plainEl) settings.plainLanguage = plainEl.checked;

    // Map Density Slider: 0 -> 'cozy', 1 -> 'roomy'
    if (densityEl) {
        settings.density = densityEl.value === "1" ? "roomy" : "cozy";
    }

    if (dateEl) settings.dateFormat = dateEl.value;
    if (time24El) settings.timeFormat24 = time24El.checked;
    if (monEl) settings.startMonday = monEl.checked;
    if (guideEl) settings.readingGuide = guideEl.checked;

    // 3. Save & Apply
    saveData();
    applyVisualSettings();

    // Trigger Re-renders
    if (typeof updateInterfaceText === 'function') updateInterfaceText();
    if (typeof renderMatrix === 'function') renderMatrix();
    if (typeof renderCalendar === 'function') renderCalendar();

    if (typeof showToast === 'function') showToast("Preferences Updated", "success");
}

function setSoundMode(mode) {
    settings.soundMode = mode;
    saveData();

    // Update Buttons Visual State
    ['sound', 'haptic', 'silent'].forEach(m => {
        const btn = document.getElementById(`btn-snd-${m}`);
        if (btn) {
            if (m === mode) {
                btn.className = "flex-1 py-2 text-xs font-bold bg-primary text-white shadow-sm";
            } else {
                btn.className = "flex-1 py-2 text-xs font-bold hover:bg-surface text-muted";
            }
        }
    });
}

/**
 * Applies CSS classes to the Body based on settings.
 * Called on load and after saving settings.
 */
function applyVisualSettings() {
    const body = document.body;

    // Dyslexia Font
    body.classList.toggle('dyslexia-mode', settings.dyslexia);

    // Reduced Motion (No animations)
    body.classList.toggle('motion-reduce', settings.reducedMotion);

    // Density (Padding sizing)
    body.classList.remove('density-cozy', 'density-roomy');
    body.classList.add(`density-${settings.density || 'cozy'}`);

    // Color Blindness Filters
    body.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia');
    if (settings.colorBlindMode !== 'none') {
        body.classList.add(`cb-${settings.colorBlindMode}`);
    }

    // Reading Guide Cursor
    body.classList.toggle('reading-guide', settings.readingGuide);
}

/* =========================================
   5. NUCLEAR OPTION (Reset App)
   ========================================= */

function nukeApp() {
    if (confirm("⚠️ DANGER: This will delete ALL your data, tasks, settings, and login history.\n\nThis cannot be undone. Are you sure?")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}