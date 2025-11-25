/* =========================================
   STUDENT CORE (Init, Navigation, Stats, Profile)
   ========================================= */

console.log("Student Core Loaded"); // Check Console to see if this appears

function initStudent() {
    const layout = document.getElementById('student-layout');
    if (layout) layout.classList.remove('hidden');

    // Set Header Info
    if (typeof currentUser !== 'undefined' && currentUser) {
        const initials = document.getElementById('s-profileInitials');
        const name = document.getElementById('s-profileName');
        if (initials) initials.innerText = currentUser.name.slice(0, 2).toUpperCase();
        if (name) name.innerText = currentUser.name;
    }

    const streakEl = document.getElementById('streak-count');
    const dateEl = document.getElementById('currentDate');
    if (streakEl) streakEl.innerText = (typeof streak !== 'undefined' ? streak : 0) + " Day Streak";
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString();

    if (typeof renderThemeButtons === 'function') renderThemeButtons('theme-selector');
    if (typeof renderMatrix === 'function') renderMatrix();
    renderStats();
}

function switchStudentView(view) {
    if (typeof playSound === 'function') playSound('click');

    // Load Backpack settings if opening settings tab
    if (view === 'settings' && typeof renderBackpackSettings === 'function') {
        renderBackpackSettings();
    }

    // Hide all views
    ['dashboard', 'completed', 'profile', 'settings', 'game', 'class-detail'].forEach(v => {
        const el = document.getElementById(`s-view-${v}`);
        if (el) el.classList.add('hidden');

        const nav = document.getElementById(`nav-s-${v}`);
        if (nav) nav.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base";
    });

    // Show selected view
    const viewEl = document.getElementById(`s-view-${view}`);
    if (viewEl) viewEl.classList.remove('hidden');

    const activeNav = document.getElementById(`nav-s-${view}`);
    if (activeNav) activeNav.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-primary bg-base border border-border";

    // Refresh data
    if (view === 'dashboard' && typeof renderMatrix === 'function') renderMatrix();
    if (view === 'completed') renderCompleted();
    if (view === 'profile') renderProfile();

    // Game Logic
    if (view === 'game' && typeof initGame === 'function') setTimeout(initGame, 100);
    else if (typeof stopGame === 'function') stopGame();
}

/* --- STATS & PROFILE --- */

function renderStats() {
    const bar = document.getElementById('stats-bar');
    if (!bar) return;
    bar.innerHTML = '';

    let counts = {};
    classes.forEach(c => counts[c] = 0);

    globalTasks.filter(t => t.completed).forEach(t => {
        counts[t.course] = (counts[t.course] || 0) + 1;
    });

    classes.slice(0, 4).forEach(c => {
        const color = classPreferences[c] || '#888';
        bar.innerHTML += `
        <div class="bg-surface p-3 rounded-xl border border-border">
            <div class="text-xs text-muted truncate">${c}</div>
            <div class="text-xl font-bold" style="color:${color}">
                ${counts[c]} Done
            </div>
        </div>`;
    });
}

function renderCompleted() {
    const list = document.getElementById('list-completed');
    if (!list) return;
    list.innerHTML = '';

    const completedTasks = globalTasks.filter(t => t.completed).sort((a, b) => new Date(b.due) - new Date(a.due));

    if (completedTasks.length === 0) {
        list.innerHTML = '<div class="text-center text-muted p-8">No history yet. Go do some work!</div>';
        return;
    }

    completedTasks.forEach(t => {
        list.innerHTML += `
        <div class="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border opacity-60">
            <i class="fa-solid fa-check-circle text-accent text-xl"></i>
            <div>
                <div class="font-bold line-through">${t.title}</div>
                <div class="text-xs text-muted">${t.course}</div>
            </div>
        </div>`;
    });
}

function renderProfile() {
    const list = document.getElementById('profile-list');
    if (!list) return;
    list.innerHTML = '';

    classes.forEach(c => {
        const color = classPreferences[c] || '#888';
        const total = globalTasks.filter(t => t.course === c).length;
        const done = globalTasks.filter(t => t.completed && t.course === c).length;
        const pending = total - done;

        list.innerHTML += `
        <div onclick="openClassDetail('${c}')" class="bg-surface p-6 rounded-xl border border-border flex justify-between items-center shadow-md cursor-pointer hover:scale-[1.02] transition-transform group">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" 
                     style="background-color: ${color} !important;">
                    ${c.substring(0, 1)}
                </div>
                <div>
                    <span class="font-bold text-lg block group-hover:text-primary transition-colors">${c}</span>
                    <span class="text-xs text-muted">${pending} Due • ${done} Done</span>
                </div>
            </div>
            <button onclick="event.stopPropagation(); openStudentClassSettings('${c}')" class="bg-base hover:bg-border text-text w-10 h-10 flex items-center justify-center rounded-lg transition-colors">
                <i class="fa-solid fa-gear"></i>
            </button>
        </div>`;
    });
}

/* --- CLASS DETAIL VIEW LOGIC --- */

function openClassDetail(className) {
    if (typeof playSound === 'function') playSound('click');

    document.getElementById('s-view-profile').classList.add('hidden');
    document.getElementById('s-view-class-detail').classList.remove('hidden');

    const titleEl = document.getElementById('cd-title');
    if (titleEl) {
        titleEl.innerText = className;
        titleEl.style.color = classPreferences[className] || 'var(--text)';
    }

    const active = globalTasks.filter(t => t.course === className && !t.completed).sort((a, b) => new Date(a.due) - new Date(b.due));
    const history = globalTasks.filter(t => t.course === className && t.completed).sort((a, b) => new Date(b.due) - new Date(a.due));

    const statsEl = document.getElementById('cd-stats');
    if (statsEl) statsEl.innerText = `${history.length} Completed • ${active.length} Pending`;

    const activeContainer = document.getElementById('cd-active-list');
    if (activeContainer) {
        activeContainer.innerHTML = '';
        if (active.length === 0) activeContainer.innerHTML = '<div class="text-muted text-sm italic">No active assignments.</div>';
        active.forEach(t => {
            const dateStr = new Date(t.due).toLocaleDateString();
            activeContainer.innerHTML += `
            <div class="bg-base p-3 rounded-lg border border-border flex justify-between items-center">
                <div>
                    <div class="font-bold text-sm">${t.title}</div>
                    <div class="text-xs text-muted"><i class="fa-regular fa-clock"></i> ${dateStr}</div>
                </div>
                <span class="text-xs font-bold bg-surface border border-border px-2 py-1 rounded">${t.type}</span>
            </div>`;
        });
    }

    const historyContainer = document.getElementById('cd-history-list');
    if (historyContainer) {
        historyContainer.innerHTML = '';
        if (history.length === 0) historyContainer.innerHTML = '<div class="text-muted text-sm italic">No history yet.</div>';
        history.forEach(t => {
            historyContainer.innerHTML += `
            <div class="flex items-center gap-3 p-2">
                <i class="fa-solid fa-check text-green-500 text-xs"></i>
                <span class="text-sm line-through text-muted">${t.title}</span>
            </div>`;
        });
    }
}

function closeClassDetail() {
    if (typeof playSound === 'function') playSound('click');
    document.getElementById('s-view-class-detail').classList.add('hidden');
    document.getElementById('s-view-profile').classList.remove('hidden');
}

function openStudentClassSettings(className) {
    const modal = document.getElementById('classSettingsModal');
    const nameEl = document.getElementById('modal-class-name');
    const picker = document.getElementById('class-color-picker');
    const renameContainer = document.getElementById('rename-container');

    if (modal) modal.classList.remove('hidden');
    if (nameEl) nameEl.innerText = className;
    if (picker) picker.value = classPreferences[className] || '#000000';
    if (renameContainer) renameContainer.classList.add('hidden');

    currentTeacherClass = className;
}

// FIX: SAFE SAVE FUNCTION
function saveClassSettings() {
    try {
        // 1. Get Color
        const picker = document.getElementById('class-color-picker');
        if(!picker) throw new Error("Color picker not found");

        const newColor = picker.value;

        // 2. Apply Color
        if (typeof currentTeacherClass !== 'undefined' && currentTeacherClass) {
            classPreferences[currentTeacherClass] = newColor;
        } else {
            alert("Error: No class selected to save.");
            return;
        }

        // 3. Save to Storage
        if (typeof saveData === 'function') saveData();

        // 4. Close Modal
        const modal = document.getElementById('classSettingsModal');
        if(modal) modal.classList.add('hidden');

        // 5. Refresh Views
        if (typeof renderMatrix === 'function') renderMatrix();
        renderStats();
        renderProfile();

        // 6. Feedback
        if (typeof showToast === 'function') showToast("Class color updated!", "success");
        else alert("Saved!");

    } catch (err) {
        alert("Save Failed: " + err.message);
        console.error(err);
    }
}

/* =========================================
   IEP & ACCESSIBILITY LOGIC
   ========================================= */

// 1. Render the Backpack List & Dyslexia Toggle
function renderBackpackSettings() {
    const container = document.getElementById('backpack-list');

    // Handle Backpack List
    if(container) {
        if(!settings.backpack) settings.backpack = ["Charge iPad", "Pencil Case"];
        container.innerHTML = '';
        settings.backpack.forEach((item, index) => {
            container.innerHTML += `
            <div class="flex justify-between items-center bg-base p-2 rounded-lg border border-border">
                <span class="text-sm font-medium ml-2">${item}</span>
                <button onclick="removeBackpackItem(${index})" class="text-muted hover:text-red-500 w-8 h-8 flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button>
            </div>`;
        });
    }

    // Handle Dyslexia Toggle (Instant Save)
    const dysBox = document.getElementById('setting-dyslexia');
    if(dysBox) {
        // Set initial state
        dysBox.checked = settings.dyslexia || false;

        // Add Click Listener for Instant Toggle
        dysBox.onclick = function() {
            settings.dyslexia = this.checked;

            // Apply Visuals Immediately
            if(settings.dyslexia) {
                document.body.classList.add('dyslexia-mode');
            } else {
                document.body.classList.remove('dyslexia-mode');
            }

            // Save Logic
            if(typeof saveData === 'function') saveData();
            if(typeof playSound === 'function') playSound('click');
        };
    }
}