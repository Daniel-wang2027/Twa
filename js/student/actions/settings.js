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